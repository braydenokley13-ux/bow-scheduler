import { promises as fs } from "node:fs"
import path from "node:path"

import { getBackendMode, getEmailConfig, hasResendConfig } from "@/lib/env"
import { buildInterviewIcs, buildIcsFilename } from "@/lib/services/ics"
import type { BookingRecord, EmailEnvelope } from "@/lib/types"

const MOCK_EMAIL_DIR = path.join(process.cwd(), ".mock", "emails")

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/** Minimal branded HTML wrapper so emails look consistent without an extra dep. */
function renderHtmlLayout(opts: {
  title: string
  preheader: string
  bodyHtml: string
  ctaLabel?: string
  ctaUrl?: string
}) {
  const { title, preheader, bodyHtml, ctaLabel, ctaUrl } = opts
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#050c17;font-family:'Manrope',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#f5f0e4;">
    <div style="display:none;opacity:0;height:0;overflow:hidden;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#050c17;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:linear-gradient(180deg,#0e1c34 0%,#071120 100%);border:1px solid rgba(183,155,103,0.22);border-radius:24px;overflow:hidden;">
            <tr>
              <td style="padding:36px 40px 24px 40px;border-bottom:1px solid rgba(183,155,103,0.18);">
                <div style="font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:#dec99d;">BOW Sports Capital · Sports Economics</div>
                <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;line-height:1.15;margin:16px 0 0 0;color:#f5f0e4;font-weight:600;letter-spacing:-0.02em;">${escapeHtml(title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 8px 40px;font-size:15px;line-height:1.7;color:#c4cad6;">
                ${bodyHtml}
              </td>
            </tr>
            ${
              ctaLabel && ctaUrl
                ? `<tr><td style="padding:12px 40px 32px 40px;"><a href="${escapeHtml(
                    ctaUrl
                  )}" style="display:inline-block;background:#b79b67;color:#08111d;font-weight:600;padding:14px 26px;border-radius:999px;text-decoration:none;font-size:14px;letter-spacing:0.02em;">${escapeHtml(
                    ctaLabel
                  )}</a></td></tr>`
                : ""
            }
            <tr>
              <td style="padding:24px 40px 36px 40px;border-top:1px solid rgba(183,155,103,0.14);font-size:12px;color:#8b93a1;">
                BOW Sports Capital · Sports Economics Story Interviews
                <br />
                You are receiving this message because you booked a short interview to share how the Sports Economics class impacted you. If this wasn't you, reply to this email and we'll take care of it.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

async function sendEmail(envelope: EmailEnvelope) {
  const config = getEmailConfig()

  if (getBackendMode() === "mock" || !hasResendConfig()) {
    await fs.mkdir(MOCK_EMAIL_DIR, { recursive: true })
    const filename = `${Date.now()}-${envelope.subject
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase()
      .slice(0, 60)}.json`
    await fs.writeFile(
      path.join(MOCK_EMAIL_DIR, filename),
      JSON.stringify(
        { ...envelope, from: config.from, sentAt: new Date().toISOString() },
        null,
        2
      )
    )
    return { id: `mock-${filename}` }
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      from: config.from,
      to: [envelope.to],
      reply_to: envelope.replyTo ?? config.replyTo,
      subject: envelope.subject,
      html: envelope.html,
      text: envelope.text,
      attachments: envelope.attachments?.map((att) => ({
        filename: att.filename,
        content: att.content,
      })),
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Resend API error (${response.status}): ${body}`)
  }

  return (await response.json()) as { id: string }
}

export async function sendBookingConfirmationEmail(
  booking: BookingRecord,
  manageUrl: string
) {
  const ics = buildInterviewIcs(booking)
  const subject = `You're on the schedule · ${booking.slot.displayDate}`
  const bodyHtml = `
    <p>Hi ${escapeHtml(booking.parentName.split(" ")[0] || booking.parentName)},</p>
    <p>Your BOW Sports Economics interview is booked. Here's what we have:</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:rgba(183,155,103,0.08);border:1px solid rgba(183,155,103,0.25);border-radius:16px;padding:20px;margin:18px 0;">
      <tr>
        <td style="color:#f5f0e4;font-size:18px;font-family:'Cormorant Garamond',Georgia,serif;">
          <strong>${escapeHtml(booking.slot.displayDate)}</strong><br />
          <span style="color:#dec99d;font-size:15px;">${escapeHtml(booking.slot.displayTime)}</span>
        </td>
      </tr>
    </table>
    <p><strong style="color:#dec99d;">On the call:</strong> ${escapeHtml(
      booking.interviewRole
    )}<br />
    <strong style="color:#dec99d;">Class term:</strong> ${escapeHtml(booking.classTerm)}</p>
    <p><strong style="color:#dec99d;">One idea you want to talk about:</strong><br />
    <em>${escapeHtml(booking.favoriteIdea)}</em></p>
    <p>Come ready with one concept or moment from Sports Economics that changed the way you look at a game, a decision, an incentive, or a tradeoff. That's the conversation we want to have.</p>
    <p>If anything changes, you can reschedule or cancel anytime from the link below.</p>
  `

  const html = renderHtmlLayout({
    title: "You're on the schedule",
    preheader: `BOW Sports Economics interview · ${booking.slot.displayDate} at ${booking.slot.displayTime}`,
    bodyHtml,
    ctaLabel: "Manage your interview",
    ctaUrl: manageUrl,
  })

  const text = [
    "BOW Sports Capital — Sports Economics interview",
    "",
    `When: ${booking.slot.displayDate} at ${booking.slot.displayTime}`,
    `On the call: ${booking.interviewRole}`,
    `Class term: ${booking.classTerm}`,
    "",
    `Manage link: ${manageUrl}`,
    booking.meetLink ? `Meeting link: ${booking.meetLink}` : "",
  ]
    .filter(Boolean)
    .join("\n")

  return sendEmail({
    to: booking.email,
    subject,
    html,
    text,
    attachments: [
      {
        filename: buildIcsFilename(booking),
        content: Buffer.from(ics, "utf8").toString("base64"),
        contentType: "text/calendar",
      },
    ],
  })
}

export async function sendRescheduleConfirmationEmail(
  booking: BookingRecord,
  manageUrl: string
) {
  const ics = buildInterviewIcs(booking)
  const bodyHtml = `
    <p>Hi ${escapeHtml(booking.parentName.split(" ")[0] || booking.parentName)},</p>
    <p>We moved your BOW Sports Economics interview to a new time:</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:rgba(183,155,103,0.08);border:1px solid rgba(183,155,103,0.25);border-radius:16px;padding:20px;margin:18px 0;">
      <tr>
        <td style="color:#f5f0e4;font-size:18px;font-family:'Cormorant Garamond',Georgia,serif;">
          <strong>${escapeHtml(booking.slot.displayDate)}</strong><br />
          <span style="color:#dec99d;font-size:15px;">${escapeHtml(booking.slot.displayTime)}</span>
        </td>
      </tr>
    </table>
    <p>The updated calendar invite is attached. See you then.</p>
  `

  return sendEmail({
    to: booking.email,
    subject: `Rescheduled · ${booking.slot.displayDate}`,
    html: renderHtmlLayout({
      title: "Your interview is rescheduled",
      preheader: `New time · ${booking.slot.displayDate} ${booking.slot.displayTime}`,
      bodyHtml,
      ctaLabel: "Manage your interview",
      ctaUrl: manageUrl,
    }),
    text: `Your BOW Sports Economics interview is now on ${booking.slot.displayDate} at ${booking.slot.displayTime}.\n\nManage: ${manageUrl}`,
    attachments: [
      {
        filename: buildIcsFilename(booking),
        content: Buffer.from(ics, "utf8").toString("base64"),
        contentType: "text/calendar",
      },
    ],
  })
}

export async function sendCancellationEmail(booking: BookingRecord) {
  const bodyHtml = `
    <p>Hi ${escapeHtml(booking.parentName.split(" ")[0] || booking.parentName)},</p>
    <p>We cancelled your BOW Sports Economics interview. If you'd like to book another time, you can come back any time — the door stays open for every student who took the class.</p>
  `
  return sendEmail({
    to: booking.email,
    subject: "Your BOW interview was cancelled",
    html: renderHtmlLayout({
      title: "Interview cancelled",
      preheader: "No worries — come back whenever the timing works.",
      bodyHtml,
    }),
    text: "Your BOW Sports Economics interview was cancelled. You can book a new time anytime at /share-your-bow-story.",
  })
}

export async function sendManagementLinkEmail(
  booking: BookingRecord,
  manageUrl: string
) {
  const bodyHtml = `
    <p>Hi ${escapeHtml(booking.parentName.split(" ")[0] || booking.parentName)},</p>
    <p>Here's the link to manage your BOW Sports Economics interview on <strong>${escapeHtml(
      booking.slot.displayDate
    )}</strong> at <strong>${escapeHtml(booking.slot.displayTime)}</strong>.</p>
    <p>This link lets you reschedule or cancel. It expires automatically after the interview.</p>
  `
  return sendEmail({
    to: booking.email,
    subject: "Your BOW interview management link",
    html: renderHtmlLayout({
      title: "Manage your interview",
      preheader: `BOW Sports Economics · ${booking.slot.displayDate}`,
      bodyHtml,
      ctaLabel: "Open management page",
      ctaUrl: manageUrl,
    }),
    text: `Manage your BOW Sports Economics interview: ${manageUrl}`,
  })
}

