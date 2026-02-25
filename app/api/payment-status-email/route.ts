// app/api/payment-status-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email, full_name, meetup_title, meetup_date, meetup_location, status } = await req.json()

    if (!email || !full_name || !meetup_title || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const formattedDate = meetup_date
      ? (() => {
          const [year, month, day] = meetup_date.split('-').map(Number)
          return new Date(year, month - 1, day).toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
          })
        })()
      : 'TBD'

    const isVerified = status === 'verified'

    const subject = isVerified
      ? `🎉 Your spot is confirmed – ${meetup_title}`
      : `Registration Update – ${meetup_title}`

    const statusBlock = isVerified
      ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:24px;">
          <tr>
            <td style="padding:24px;">
              <p style="color:#166534;font-size:18px;margin:0 0 8px;font-weight:700;">🎉 Payment Verified!</p>
              <p style="color:#15803d;font-size:14px;margin:0;line-height:1.6;">
                Great news! We've verified your payment and your spot is officially confirmed.
                We can't wait to see you at the meetup!
              </p>
            </td>
          </tr>
        </table>
      `
      : `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin-bottom:24px;">
          <tr>
            <td style="padding:24px;">
              <p style="color:#991b1b;font-size:18px;margin:0 0 8px;font-weight:700;">Payment Not Verified</p>
              <p style="color:#b91c1c;font-size:14px;margin:0;line-height:1.6;">
                Unfortunately, we were unable to verify your payment for this meetup.
                If you believe this is a mistake or need help, please reach out to us on Instagram and we'll sort it out.
              </p>
            </td>
          </tr>
        </table>
      `

    const ctaButton = isVerified
      ? `<a href="https://www.instagram.com/islamabadreadswithus/"
            style="display:inline-block;background:#3a4095;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:50px;font-size:14px;font-weight:600;">
            Follow us on Instagram
          </a>`
      : `<a href="https://www.instagram.com/islamabadreadswithus/"
            style="display:inline-block;background:#3a4095;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:50px;font-size:14px;font-weight:600;">
            Contact Us on Instagram
          </a>`

    await resend.emails.send({
      from: 'IsbReadWithUs <noreply@yourdomain.com>',
      to: [email],
      subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);max-width:600px;width:100%;">

                    <!-- Header -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#3a4095,#5a60b5);padding:40px 40px 32px;text-align:center;">
                        <div style="font-size:28px;margin-bottom:8px;">📚</div>
                        <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">IsbReadWithUs</h1>
                        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Payment Status Update</p>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:40px;">
                        <p style="color:#374151;font-size:16px;margin:0 0 24px;">
                          Hi <strong>${full_name}</strong>,
                        </p>

                        <!-- Status block -->
                        ${statusBlock}

                        <!-- Meetup details -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;border-radius:12px;margin-bottom:24px;">
                          <tr>
                            <td style="padding:20px;">
                              <p style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px;">Meetup</p>
                              <p style="color:#3a4095;font-size:18px;font-weight:700;margin:0 0 6px;">${meetup_title}</p>
                              <p style="color:#6b7280;font-size:14px;margin:0 0 4px;">📅 ${formattedDate}</p>
                              ${meetup_location ? `<p style="color:#6b7280;font-size:14px;margin:0;">📍 ${meetup_location}</p>` : ""}
                            </td>
                          </tr>
                        </table>

                        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px;">
                          ${isVerified
                            ? 'If you have any questions or need directions to the venue, feel free to reach out to us on Instagram.'
                            : 'We apologize for any inconvenience. Please contact us on Instagram and we\'ll do our best to help you.'}
                        </p>

                        <!-- CTA -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center">
                              ${ctaButton}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                        <p style="color:#9ca3af;font-size:12px;margin:0;">
                          © ${new Date().getFullYear()} IsbReadWithUs Book Club · Islamabad, Pakistan
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Payment status email error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}