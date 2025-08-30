const express = require('express');
const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend"); // New for MailerSend

const app = express();
app.use(express.json());

// Set up MailerSend with your token (from env var)
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY // From Vercel env
});

// The /send-email endpoint
app.post('/send-email', async (req, res) => {
  const { toEmail, commission, balance } = req.body;
  if (!toEmail || !commission || !balance) {
    return res.status(400).send('Missing info: need toEmail, commission, balance');
  }

  // Set sender and recipient
  const sentFrom = new Sender("acmelectrical12@gmail.com", "ACM HUB"); // Your verified email
  const recipients = [new Recipient(toEmail)];

  // Email details
  const emailParams = new EmailParams({
    from: sentFrom,
    to: recipients,
    subject: "Referral Commission Update", // Neutral to avoid spam
    html: `<p>Hi!</p><p>You got a referral update: QR ${commission} added.</p><p>New balance: QR ${balance}.</p><p>Thanks! - ACM HUB</p>`,
    text: `Hi! You got a referral update: QR ${commission} added. New balance: QR ${balance}. Thanks! - ACM HUB`
  });

  try {
    await mailerSend.email.send(emailParams);
    console.log('Email sent to ' + toEmail);
    res.send('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending email');
  }
});

module.exports = app; // For Vercel