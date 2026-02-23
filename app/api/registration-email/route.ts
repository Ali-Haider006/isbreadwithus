// app/api/registration-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { full_name, email, meetup_title, meetup_date, meetup_time, location, payment_required, payment_amount } = await req.json()

    if (!email || !full_name || !meetup_title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const formattedDate = meetup_date
      ? new Date(meetup_date).toLocaleDateString('en-US', {
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
        })
      : 'TBD'

    const formattedTime = meetup_time
      ? (() => {
          const [h, m] = meetup_time.split(':')
          const hour = parseInt(h)
          return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
        })()
      : ''

    await resend.emails.send({
      from: 'IsbReadWithUs <noreply@isbreadwithus.com>',
      to: [email],
      subject: `Registration Received – ${meetup_title}`,
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
                        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Registration Confirmation</p>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:40px;">
                        <p style="color:#374151;font-size:16px;margin:0 0 8px;">Hi <strong>${full_name}</strong>,</p>
                        <p style="color:#374151;font-size:16px;margin:0 0 24px;line-height:1.6;">
                          Thank you for registering! We've received your registration for the following meetup:
                        </p>

                        <!-- Meetup details box -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;border-radius:12px;margin-bottom:24px;">
                          <tr>
                            <td style="padding:24px;">
                              <h2 style="color:#3a4095;font-size:20px;margin:0 0 16px;">${meetup_title}</h2>
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="padding:6px 0;color:#6b7280;font-size:14px;width:24px;">📅</td>
                                  <td style="padding:6px 0;color:#374151;font-size:14px;">${formattedDate}${formattedTime ? ` • ${formattedTime}` : ''}</td>
                                </tr>
                                ${location ? `
                                <tr>
                                  <td style="padding:6px 0;color:#6b7280;font-size:14px;">📍</td>
                                  <td style="padding:6px 0;color:#374151;font-size:14px;">${location}</td>
                                </tr>` : ''}
                                <tr>
                                  <td style="padding:6px 0;color:#6b7280;font-size:14px;">💳</td>
                                  <td style="padding:6px 0;color:#374151;font-size:14px;">
                                    ${payment_required ? `PKR ${payment_amount || 0} ` : 'Free entry'}
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>

                        <!-- Status notice -->
                        ${payment_required ? `
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;margin-bottom:24px;">
                          <tr>
                            <td style="padding:20px;">
                              <p style="color:#92400e;font-size:14px;margin:0;font-weight:600;">⏳ Payment Verification Pending</p>
                              <p style="color:#b45309;font-size:14px;margin:8px 0 0;line-height:1.6;">
                                We've received your registration and payment screenshot. Our team will verify your payment shortly and confirm your spot. You'll hear from us soon!
                              </p>
                            </td>
                          </tr>
                        </table>
                        ` : `
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:24px;">
                          <tr>
                            <td style="padding:20px;">
                              <p style="color:#166534;font-size:14px;margin:0;font-weight:600;">✅ Registration Confirmed</p>
                              <p style="color:#15803d;font-size:14px;margin:8px 0 0;line-height:1.6;">
                                Your spot is confirmed! We look forward to seeing you at the meetup.
                              </p>
                            </td>
                          </tr>
                        </table>
                        `}

                        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px;">
                          If you have any questions, feel free to reach out to us on Instagram.
                        </p>

                        <!-- Instagram CTA -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center">
                              <a href="https://www.instagram.com/islamabadreadswithus/"
                                style="display:inline-block;background:#3a4095;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:50px;font-size:14px;font-weight:600;">
                                Follow us on Instagram
                              </a>
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
    console.error('Email send error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}