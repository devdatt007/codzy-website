/* ============================================
   CODZY — Email Utility
   Send emails via Gmail SMTP using Nodemailer
   ============================================ */

const nodemailer = require('nodemailer');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || 'codzy.web@gmail.com',
        pass: process.env.EMAIL_PASS || '',
    },
    family: 4,              // Force IPv4 (Render IPv6 can't reach Gmail)
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
});

/* ── Send welcome email to client on login ── */
async function sendWelcomeEmail(userEmail, userName, isFirstLogin = false) {
    try {
        const subject = isFirstLogin ? 'Welcome to Codzy! 🎉' : 'Welcome back to Codzy! 🎉';
        const heading = isFirstLogin ? `Welcome, ${userName}!` : `Welcome back, ${userName}!`;
        const message = isFirstLogin
            ? 'Thank you for joining Codzy! Your account is ready. Start exploring our premium templates and build something extraordinary.'
            : 'Thank you for signing in to your Codzy account. We\'re glad to have you back.';

        await transporter.sendMail({
            from: `"Codzy" <${process.env.EMAIL_USER || 'codzy.web@gmail.com'}>`,
            to: userEmail,
            subject,
            html: `
                <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#0A192F;color:#fff;border-radius:12px;overflow:hidden;">
                    <div style="background:linear-gradient(135deg,#0A192F,#162A50);padding:40px 32px;text-align:center;">
                        <h1 style="margin:0 0 4px;font-size:28px;letter-spacing:3px;">COD<span style="color:#D4AF37;">ZY</span></h1>
                        <p style="color:#8892B0;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0;">Premium Web Development</p>
                    </div>
                    <div style="padding:32px;">
                        <h2 style="color:#D4AF37;font-size:20px;margin:0 0 16px;">${heading}</h2>
                        <p style="color:#CCD6F6;line-height:1.7;margin:0 0 20px;">${message}</p>
                        <p style="color:#CCD6F6;line-height:1.7;margin:0 0 24px;">
                            Explore our premium templates, manage your projects, and build something extraordinary.
                        </p>
                        <a href="${BASE_URL}/templates.html" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#B8860B,#D4AF37);color:#0A192F;font-weight:700;text-decoration:none;border-radius:8px;font-size:14px;">Browse Templates</a>
                    </div>
                    <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
                        <p style="color:#4A5568;font-size:11px;margin:0;">© 2026 Codzy. All rights reserved.</p>
                    </div>
                </div>
            `,
        });
        console.log(`✉ ${isFirstLogin ? 'Welcome' : 'Welcome back'} email sent to ${userEmail}`);
    } catch (err) {
        console.error('Email send error:', err.message);
    }
}

/* ── Send order notification to admin ── */
async function sendOrderNotification(order, user) {
    try {
        const itemsList = JSON.parse(order.items || '[]')
            .map(i => `<tr><td style="padding:8px 12px;border-bottom:1px solid #1a2744;color:#CCD6F6;">${i.name}</td><td style="padding:8px 12px;border-bottom:1px solid #1a2744;color:#CCD6F6;text-align:center;">${i.qty}</td><td style="padding:8px 12px;border-bottom:1px solid #1a2744;color:#D4AF37;text-align:right;">$${(i.price * i.qty).toFixed(2)}</td></tr>`)
            .join('');

        await transporter.sendMail({
            from: `"Codzy Orders" <${process.env.EMAIL_USER || 'codzy.web@gmail.com'}>`,
            to: process.env.ADMIN_EMAIL || 'codzy.web@gmail.com',
            subject: `🛒 New Order #${order.id} — $${Number(order.total).toFixed(2)}`,
            html: `
                <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#0A192F;color:#fff;border-radius:12px;overflow:hidden;">
                    <div style="background:linear-gradient(135deg,#0A192F,#162A50);padding:32px;text-align:center;">
                        <h1 style="margin:0 0 4px;font-size:28px;letter-spacing:3px;">COD<span style="color:#D4AF37;">ZY</span></h1>
                        <p style="color:#D4AF37;font-size:14px;font-weight:600;margin:8px 0 0;">New Order Received!</p>
                    </div>
                    <div style="padding:32px;">
                        <div style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.15);border-radius:8px;padding:16px;margin-bottom:24px;">
                            <p style="margin:0 0 4px;color:#8892B0;font-size:12px;text-transform:uppercase;">Order #${order.id}</p>
                            <p style="margin:0;color:#CCD6F6;"><strong>Customer:</strong> ${user ? user.name : 'Unknown'}</p>
                            <p style="margin:4px 0 0;color:#CCD6F6;"><strong>Email:</strong> ${user ? user.email : 'N/A'}</p>
                        </div>
                        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                            <thead>
                                <tr style="border-bottom:2px solid #D4AF37;">
                                    <th style="padding:8px 12px;text-align:left;color:#D4AF37;font-size:12px;text-transform:uppercase;">Item</th>
                                    <th style="padding:8px 12px;text-align:center;color:#D4AF37;font-size:12px;text-transform:uppercase;">Qty</th>
                                    <th style="padding:8px 12px;text-align:right;color:#D4AF37;font-size:12px;text-transform:uppercase;">Price</th>
                                </tr>
                            </thead>
                            <tbody>${itemsList}</tbody>
                        </table>
                        <div style="border-top:2px solid #D4AF37;padding-top:12px;text-align:right;">
                            <p style="margin:4px 0;color:#8892B0;font-size:13px;">Subtotal: $${Number(order.subtotal).toFixed(2)}</p>
                            <p style="margin:4px 0;color:#8892B0;font-size:13px;">Tax: $${Number(order.tax).toFixed(2)}</p>
                            <p style="margin:4px 0;color:#D4AF37;font-size:18px;font-weight:700;">Total: $${Number(order.total).toFixed(2)}</p>
                        </div>
                    </div>
                    <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
                        <a href="${BASE_URL}/admin.html" style="color:#D4AF37;font-size:13px;text-decoration:none;">View in Admin Dashboard →</a>
                    </div>
                </div>
            `,
        });
        console.log(`✉ Order notification sent to admin`);
    } catch (err) {
        console.error('Order email error:', err.message);
    }
}

/* ── Notify admin of new newsletter subscriber ── */
async function sendSubscriptionNotification(subscriberEmail) {
    try {
        await transporter.sendMail({
            from: `"Codzy Newsletter" <${process.env.EMAIL_USER || 'codzy.web@gmail.com'}>`,
            to: process.env.ADMIN_EMAIL || 'codzy.web@gmail.com',
            subject: `📰 New Newsletter Subscriber`,
            html: `
                <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#0A192F;color:#fff;border-radius:12px;overflow:hidden;">
                    <div style="background:linear-gradient(135deg,#0A192F,#162A50);padding:32px;text-align:center;">
                        <h1 style="margin:0 0 4px;font-size:28px;letter-spacing:3px;">COD<span style="color:#D4AF37;">ZY</span></h1>
                        <p style="color:#D4AF37;font-size:14px;font-weight:600;margin:8px 0 0;">New Subscriber!</p>
                    </div>
                    <div style="padding:32px;text-align:center;">
                        <div style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.15);border-radius:8px;padding:20px;margin-bottom:16px;">
                            <p style="margin:0;color:#8892B0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Email Address</p>
                            <p style="margin:8px 0 0;color:#D4AF37;font-size:18px;font-weight:600;">${subscriberEmail}</p>
                        </div>
                        <p style="color:#8892B0;font-size:13px;margin:0;">Someone just subscribed to the Codzy newsletter.</p>
                    </div>
                </div>
            `,
        });
        console.log(`✉ Subscription notification sent to admin`);
    } catch (err) {
        console.error('Subscription email error:', err.message);
    }
}

/* ── Send order confirmation to customer ── */
async function sendOrderConfirmation(userEmail, userName, order) {
    try {
        const items = JSON.parse(order.items || '[]');
        const itemsHTML = items
            .map(i => `<tr><td style="padding:8px 12px;border-bottom:1px solid #1a2744;color:#CCD6F6;">${i.name}</td><td style="padding:8px 12px;border-bottom:1px solid #1a2744;color:#CCD6F6;text-align:center;">${i.qty}</td><td style="padding:8px 12px;border-bottom:1px solid #1a2744;color:#D4AF37;text-align:right;">$${(i.price * i.qty).toFixed(2)}</td></tr>`)
            .join('');

        await transporter.sendMail({
            from: `"Codzy" <${process.env.EMAIL_USER || 'codzy.web@gmail.com'}>`,
            to: userEmail,
            subject: `🎉 Order #${order.id} Confirmed — Thank you!`,
            html: `
                <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#0A192F;color:#fff;border-radius:12px;overflow:hidden;">
                    <div style="background:linear-gradient(135deg,#0A192F,#162A50);padding:40px 32px;text-align:center;">
                        <h1 style="margin:0 0 4px;font-size:28px;letter-spacing:3px;">COD<span style="color:#D4AF37;">ZY</span></h1>
                        <p style="color:#8892B0;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0;">Premium Web Development</p>
                    </div>
                    <div style="padding:32px;">
                        <h2 style="color:#D4AF37;font-size:20px;margin:0 0 16px;">Thank you, ${userName}!</h2>
                        <p style="color:#CCD6F6;line-height:1.7;margin:0 0 24px;">
                            Your order has been confirmed. Here's a summary of your purchase:
                        </p>
                        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                            <thead>
                                <tr style="border-bottom:2px solid #D4AF37;">
                                    <th style="padding:8px 12px;text-align:left;color:#D4AF37;font-size:12px;text-transform:uppercase;">Item</th>
                                    <th style="padding:8px 12px;text-align:center;color:#D4AF37;font-size:12px;text-transform:uppercase;">Qty</th>
                                    <th style="padding:8px 12px;text-align:right;color:#D4AF37;font-size:12px;text-transform:uppercase;">Price</th>
                                </tr>
                            </thead>
                            <tbody>${itemsHTML}</tbody>
                        </table>
                        <div style="border-top:2px solid #D4AF37;padding-top:12px;text-align:right;">
                            <p style="margin:4px 0;color:#8892B0;font-size:13px;">Subtotal: $${Number(order.subtotal).toFixed(2)}</p>
                            <p style="margin:4px 0;color:#8892B0;font-size:13px;">Tax: $${Number(order.tax).toFixed(2)}</p>
                            <p style="margin:4px 0;color:#D4AF37;font-size:18px;font-weight:700;">Total: $${Number(order.total).toFixed(2)}</p>
                        </div>
                        <p style="color:#8892B0;line-height:1.7;margin:24px 0 0;font-size:13px;">
                            If you have any questions about your order, feel free to <a href="${BASE_URL}/contact.html" style="color:#D4AF37;">contact us</a>.
                        </p>
                    </div>
                    <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
                        <p style="color:#4A5568;font-size:11px;margin:0;">© 2026 Codzy. All rights reserved.</p>
                    </div>
                </div>
            `,
        });
        console.log(`✉ Order confirmation sent to ${userEmail}`);
    } catch (err) {
        console.error('Order confirmation email error:', err.message);
    }
}

module.exports = { sendWelcomeEmail, sendOrderNotification, sendSubscriptionNotification, sendOrderConfirmation };
