/**
 * GearUp — Ultra-Premium Email Design System v2
 * World-class transactional email templates with full brand consistency.
 * Email-client safe: table-based layouts, inline styles only.
 */

// ─── Brand Tokens ──────────────────────────────────────────────────────────────
const B = {
  primary: '#10B981',
  primaryDark: '#059669',
  primaryLight: '#D1FAE5',
  navy: '#041B34',
  navyMid: '#0B2B50',
  navyLight: '#0F3460',
  text: '#1E293B',
  textMuted: '#64748B',
  textLight: '#94A3B8',
  border: '#E2E8F0',
  bg: '#F1F5F9',
  white: '#FFFFFF',
  amber: '#F59E0B',
  amberLight: '#FFFBEB',
  amberBorder: '#FDE68A',
  amberText: '#92400E',
  red: '#EF4444',
  redLight: '#FEF2F2',
  redBorder: '#FECACA',
  redText: '#991B1B',
  blue: '#3B82F6',
  blueLight: '#EFF6FF',
  blueBorder: '#BFDBFE',
  blueText: '#1D4ED8',
};

// ─── Shared Base Wrapper ───────────────────────────────────────────────────────
const wrap = (heroIcon, heroTitle, heroSubtitle, body, { preview = '', footerNote = '' } = {}) => `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>GearUp — ${heroTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    table,td{mso-table-lspace:0;mso-table-rspace:0}
    img{border:0;height:auto;line-height:100%;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic}
    body{height:100%!important;margin:0!important;padding:0!important;width:100%!important;background-color:${B.bg}}
    a{color:${B.primary};text-decoration:none}
    @media only screen and (max-width:620px){
      .email-container{width:100%!important;margin:auto!important}
      .fluid{max-width:100%!important;height:auto!important}
      .stack{display:block!important;width:100%!important}
      .px-mobile{padding-left:24px!important;padding-right:24px!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${B.bg};font-family:'Inter',Arial,Helvetica,sans-serif;">

${preview ? `<!-- Preview text --><div style="display:none;font-size:1px;color:${B.bg};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preview}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
<tr><td style="padding:32px 16px 48px;background-color:${B.bg};">
<table class="email-container" align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:auto;max-width:600px;width:100%;">

  <!-- ══ LOGO HEADER ══ -->
  <tr>
    <td align="center" style="padding-bottom:20px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="background:linear-gradient(145deg,${B.navy} 0%,${B.navyMid} 60%,${B.navyLight} 100%);border-radius:14px;padding:0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="padding:14px 28px 14px 22px;">
                  <!-- Gear icon -->
                  <span style="display:inline-block;width:32px;height:32px;background:${B.primary};border-radius:8px;text-align:center;line-height:32px;font-size:16px;vertical-align:middle;margin-right:10px;">⚙️</span>
                  <span style="font-family:'Inter',Arial,sans-serif;font-size:24px;font-weight:900;color:${B.white};letter-spacing:-1px;vertical-align:middle;">Gear<span style="color:${B.primary};">Up</span></span>
                  <span style="font-family:'Inter',Arial,sans-serif;font-size:10px;font-weight:600;color:rgba(16,185,129,0.7);letter-spacing:3px;text-transform:uppercase;vertical-align:middle;margin-left:8px;">Marketplace</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ══ HERO BANNER ══ -->
  <tr>
    <td style="border-radius:20px 20px 0 0;overflow:hidden;background:linear-gradient(135deg,${B.navy} 0%,${B.navyMid} 50%,${B.navyLight} 100%);">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td class="px-mobile" style="padding:44px 48px 40px;text-align:center;">
            <!-- Icon circle -->
            <div style="display:inline-block;width:72px;height:72px;background:rgba(16,185,129,0.15);border-radius:50%;line-height:72px;text-align:center;font-size:34px;border:2px solid rgba(16,185,129,0.3);margin-bottom:20px;">${heroIcon}</div>
            <!-- Title -->
            <h1 style="margin:0 0 10px;font-family:'Inter',Arial,sans-serif;font-size:28px;font-weight:800;color:${B.white};letter-spacing:-0.5px;line-height:1.2;">${heroTitle}</h1>
            <!-- Subtitle -->
            ${heroSubtitle ? `<p style="margin:0;font-family:'Inter',Arial,sans-serif;font-size:15px;font-weight:400;color:rgba(255,255,255,0.6);line-height:1.5;">${heroSubtitle}</p>` : ''}
            <!-- Divider -->
            <div style="width:56px;height:3px;background:linear-gradient(90deg,${B.primary},${B.primaryDark});border-radius:2px;margin:20px auto 0;"></div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ══ CARD BODY ══ -->
  <tr>
    <td style="background:${B.white};border-radius:0 0 20px 20px;box-shadow:0 8px 40px rgba(4,27,52,0.10),0 2px 8px rgba(4,27,52,0.06);">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td class="px-mobile" style="padding:40px 48px 44px;">
            ${body}
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ══ SPACER ══ -->
  <tr><td style="height:24px;"></td></tr>

  <!-- ══ FOOTER ══ -->
  <tr>
    <td style="text-align:center;padding:0 16px 8px;">
      <!-- Divider dots -->
      <p style="margin:0 0 14px;font-family:'Inter',Arial,sans-serif;font-size:11px;color:${B.border};letter-spacing:4px;">• • • • • • •</p>
      <p style="margin:0 0 6px;font-family:'Inter',Arial,sans-serif;font-size:12px;color:${B.textLight};line-height:1.6;">
        ${footerNote || 'This is an automated message. Please do not reply directly to this email.'}
      </p>
      <p style="margin:0;font-family:'Inter',Arial,sans-serif;font-size:11px;color:${B.border};">
        &copy; ${new Date().getFullYear()} GearUp Marketplace &mdash; All rights reserved.
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;

// ─── Reusable Partials ─────────────────────────────────────────────────────────

/** Plain paragraph */
const p = (text) =>
  `<p style="margin:0 0 18px;font-family:'Inter',Arial,sans-serif;font-size:15px;line-height:1.75;color:${B.text};">${text}</p>`;

/** Large OTP digit display */
const otpBlock = (otp) => {
  const digits = String(otp).split('');
  const boxes = digits.map(d =>
    `<td style="padding:0 4px;">
          <div style="width:52px;height:64px;background:linear-gradient(180deg,${B.navyLight} 0%,${B.navy} 100%);border-radius:12px;text-align:center;line-height:64px;font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:700;color:${B.white};border-bottom:3px solid ${B.primary};">${d}</div>
        </td>`
  ).join('');
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px auto;background:${B.bg};border-radius:16px;padding:24px 20px;border:1px solid ${B.border};">
      <tr>
        <td style="text-align:center;padding-bottom:14px;">
          <span style="font-family:'Inter',Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:3px;color:${B.primary};text-transform:uppercase;">Your Verification Code</span>
        </td>
      </tr>
      <tr>
        <td>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
            <tr>${boxes}</tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="text-align:center;padding-top:16px;">
          <span style="font-family:'Inter',Arial,sans-serif;font-size:12px;color:${B.textMuted};">&#9203; Expires in <strong style="color:${B.text};">10 minutes</strong></span>
        </td>
      </tr>
    </table>`;
};

/** Info table (key-value rows) */
const infoTable = (rows, bgColor = B.bg) => {
  const trs = rows.map(([label, value], i) => {
    const borderTop = i === 0 ? '' : `border-top:1px solid ${B.border};`;
    return `<tr>
          <td style="${borderTop}padding:12px 20px;">
            <span style="font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:${B.textMuted};">${label}</span>
          </td>
          <td style="${borderTop}padding:12px 20px;text-align:right;">
            <span style="font-family:'Inter',Arial,sans-serif;font-size:14px;font-weight:600;color:${B.text};">${value}</span>
          </td>
        </tr>`;
  }).join('');
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:20px 0;background:${bgColor};border-radius:12px;border:1px solid ${B.border};overflow:hidden;">
      ${trs}
    </table>`;
};

/** CTA button */
const btn = (href, label) =>
  `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:30px auto;">
    <tr>
      <td style="border-radius:12px;background:linear-gradient(135deg,${B.primary} 0%,${B.primaryDark} 100%);box-shadow:0 6px 20px rgba(16,185,129,0.4);">
        <a href="${href}" style="display:inline-block;padding:16px 44px;font-family:'Inter',Arial,sans-serif;font-size:15px;font-weight:700;color:${B.white};text-decoration:none;letter-spacing:0.2px;">${label} &rarr;</a>
      </td>
    </tr>
  </table>`;

/** Alert box */
const alert = (text, { bg = B.amberLight, border = B.amberBorder, textColor = B.amberText, icon = '⚠️' } = {}) =>
  `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:20px 0;background:${bg};border-radius:10px;border:1px solid ${border};">
    <tr>
      <td style="padding:14px 18px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="width:28px;vertical-align:middle;padding-right:10px;font-size:18px;">${icon}</td>
            <td style="font-family:'Inter',Arial,sans-serif;font-size:13px;line-height:1.6;color:${textColor};">${text}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;

/** Highlight banner (success/info strip) */
const highlight = (text, { bg = B.primaryLight, textColor = B.primaryDark, icon = '' } = {}) =>
  `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:20px 0;background:${bg};border-radius:12px;border-left:4px solid ${B.primary};">
    <tr>
      <td style="padding:16px 20px;font-family:'Inter',Arial,sans-serif;font-size:14px;font-weight:600;color:${textColor};">${icon ? icon + '&nbsp;&nbsp;' : ''}${text}</td>
    </tr>
  </table>`;

/** Copy link box */
const linkBox = (url) =>
  `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:16px 0;background:${B.bg};border-radius:10px;border:1px solid ${B.border};">
    <tr>
      <td style="padding:12px 18px;">
        <p style="margin:0 0 4px;font-family:'Inter',Arial,sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${B.textMuted};">Or copy this link</p>
        <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:12px;color:${B.primary};word-break:break-all;">${url}</p>
      </td>
    </tr>
  </table>`;

/** Section divider */
const divider = () =>
  `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:24px 0;">
    <tr><td style="border-top:1px solid ${B.border};"></td></tr>
  </table>`;


// ─── Template: Registration OTP ───────────────────────────────────────────────
const getRegistrationOTPTemplate = (otp, name = '') => {
  const greet = name ? `Hi <strong>${name}</strong>,` : 'Hi there,';
  const body = `
      ${p(`${greet} welcome to <strong>GearUp Marketplace</strong> — the platform connecting sports manufacturers, wholesalers, and buyers across Pakistan.`)}
      ${p('To complete your registration, please verify your email address using the one-time code below.')}
      ${otpBlock(otp)}
      ${alert('Never share this code with anyone. GearUp will <strong>never</strong> ask for your verification code via phone, chat, or email.', { icon: '🛡️' })}
      ${divider()}
      ${p(`<span style="font-size:13px;color:${B.textMuted};">Didn't create a GearUp account? You can safely ignore this email — no action is needed.</span>`)}
    `;
  return wrap('🎉', 'Verify Your Email Address', 'Complete your GearUp account setup', body, {
    preview: `Your GearUp verification code is ${otp} — valid for 10 minutes.`,
    footerNote: 'You received this because someone registered on GearUp with your email address.'
  });
};

// ─── Template: Resend OTP ─────────────────────────────────────────────────────
const getResendOTPTemplate = (otp) => {
  const body = `
      ${p('You requested a new verification code for your <strong>GearUp</strong> account. Your previous code has been invalidated.')}
      ${p('Use the fresh code below to verify your email address:')}
      ${otpBlock(otp)}
      ${alert('This code replaces your previous one. <strong>Only this latest code is valid.</strong>', { icon: '🔁' })}
      ${divider()}
      ${p(`<span style="font-size:13px;color:${B.textMuted};">If you didn't request a new code, someone may be attempting to access your account. Please secure it immediately.</span>`)}
    `;
  return wrap('🔄', 'New Verification Code', 'Your previous code has been replaced', body, {
    preview: `Your new GearUp code is ${otp} — valid for 10 minutes.`
  });
};

// ─── Template: Password Reset ─────────────────────────────────────────────────
const getPasswordResetTemplate = (resetUrl) => {
  const body = `
      ${p('We received a request to reset the password for your <strong>GearUp</strong> account. Click the button below to create a new, secure password.')}
      ${btn(resetUrl, 'Reset My Password')}
      ${linkBox(resetUrl)}
      ${alert('This password reset link expires in <strong>10 minutes</strong>. If you did not request a reset, your password remains unchanged — no action is needed.', { icon: '🛡️' })}
      ${divider()}
      ${p(`<span style="font-size:13px;color:${B.textMuted};">For your security, never share this link with anyone. GearUp support will never ask for it.</span>`)}
    `;
  return wrap('🔐', 'Reset Your Password', 'This secure link expires in 10 minutes', body, {
    preview: 'Reset your GearUp password — this link expires in 10 minutes.',
    footerNote: 'If you did not request this, no changes have been made to your account.'
  });
};

// ─── Template: Order Approved (Buyer) ────────────────────────────────────────
const getBuyerOrderApprovedTemplate = (orderId) => {
  const body = `
      ${p('Your payment has been reviewed and <strong>successfully verified</strong> by the GearUp team. Your order is now in active processing.')}
      ${infoTable([
    ['Order Reference', `#${orderId}`],
    ['Payment Status', '✅ Verified'],
    ['Order Status', 'In Manufacturing'],
    ['Next Update', 'Shipment Notification'],
  ])}
      ${highlight('Your order is now with the manufacturer. You\'ll receive a shipping notification as soon as it\'s dispatched.', { icon: '🚀' })}
      ${p(`<span style="font-size:13px;color:${B.textMuted};">Track your order status in real-time from your GearUp dashboard. Reach out to support if you have any questions.</span>`)}
    `;
  return wrap('✅', 'Order Approved!', 'Payment confirmed — manufacturing is underway', body, {
    preview: `Great news! Your GearUp order #${orderId} has been approved and is now being processed.`
  });
};

// ─── Template: Order Approved (Manufacturer) ──────────────────────────────────
const getManufacturerOrderApprovedTemplate = (orderId, buyerName) => {
  const body = `
      ${p('A buyer\'s payment for the following order has been <strong>verified and approved</strong>. This order has been assigned to you for processing and fulfillment.')}
      ${infoTable([
    ['Order Reference', `#${orderId}`],
    ['Buyer Name', buyerName || '—'],
    ['Payment Status', '✅ Approved'],
    ['Required Action', '⚡ Process & Ship'],
  ])}
      ${alert('Please begin processing this order promptly and update the shipment status from your manufacturer dashboard as soon as it is dispatched.', {
    bg: B.blueLight, border: B.blueBorder, textColor: B.blueText, icon: 'ℹ️'
  })}
      ${p(`<span style="font-size:13px;color:${B.textMuted};">Log in to your GearUp dashboard to view full order details, buyer information, and upload shipment tracking data.</span>`)}
    `;
  return wrap('📦', 'New Order Assigned', 'A buyer payment has been verified — action required', body, {
    preview: `New approved order #${orderId} from ${buyerName || 'a buyer'} — ready for manufacturing.`
  });
};

// ─── Template: Payment Proof (Admin) ──────────────────────────────────────────
const getPaymentProofTemplate = (orderId, buyerName, amount) => {
  const formattedAmt = typeof amount === 'number' ? amount.toLocaleString('en-PK') : (amount || '—');
  const body = `
      ${p('A buyer has submitted their payment proof for the order below and is <strong>awaiting your approval</strong>. Please review the screenshot and take action from the Admin Dashboard.')}
      ${infoTable([
    ['Order Reference', `#${orderId}`],
    ['Buyer Name', buyerName || '—'],
    ['Amount Claimed', `PKR ${formattedAmt}`],
    ['Submission Time', new Date().toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })],
    ['Action Required', '⏳ Review & Approve'],
  ], B.amberLight)}
      ${alert('Review the payment screenshot carefully before approving. Verify the amount matches the order total before proceeding.', {
    bg: B.redLight, border: B.redBorder, textColor: B.redText, icon: '⚡'
  })}
      ${p(`<span style="font-size:13px;color:${B.textMuted};">Log in to the Admin Dashboard to view the uploaded screenshot and approve or reject this payment.</span>`)}
    `;
  return wrap('💳', 'Payment Proof Received', 'Admin action required — review and approve', body, {
    preview: `Payment proof uploaded for Order #${orderId} (PKR ${formattedAmt}) — your review is needed.`
  });
};

// ─── Template: Order Shipped (Buyer) ──────────────────────────────────────────
const getShipmentTemplate = (orderId) => {
  const body = `
      ${p('Exciting news! Your <strong>GearUp order has been shipped</strong> by the manufacturer and is on its way to you.')}
      ${infoTable([
    ['Order Reference', `#${orderId}`],
    ['Shipment Status', '🚚 Dispatched'],
    ['Next Step', 'Delivery in Progress'],
  ])}
      ${highlight('Your order is en route! Check your GearUp dashboard for real-time delivery updates and tracking information.', { icon: '📍' })}
      ${p(`<span style="font-size:13px;color:${B.textMuted};">If you have any questions about your shipment, please contact the manufacturer through your GearUp dashboard's messaging feature.</span>`)}
    `;
  return wrap('🚚', 'Your Order is On Its Way!', 'The manufacturer has dispatched your order', body, {
    preview: `Your GearUp order #${orderId} has been shipped and is heading your way!`
  });
};

// ─── Exports ───────────────────────────────────────────────────────────────────
module.exports = {
  getRegistrationOTPTemplate,
  getResendOTPTemplate,
  getPasswordResetTemplate,
  getBuyerOrderApprovedTemplate,
  getManufacturerOrderApprovedTemplate,
  getPaymentProofTemplate,
  getShipmentTemplate,
};
