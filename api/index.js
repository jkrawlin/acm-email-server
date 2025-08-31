const express = require('express');
const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend"); // New for MailerSend
const admin = require('firebase-admin');

const app = express();
app.use(express.json());

// Init FCM (uses env var you'll add next)
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
});

// Function to send push
async function sendPushNotification(token, commission, balance) {
  const message = {
    notification: {
      title: 'Commission Earned',
      body: `You earned QR ${commission}! Balance: QR ${balance}`
    },
    token: token
  };
  try {
    await admin.messaging().send(message);
    console.log('Push sent');
  } catch (error) {
    console.error('Push error:', error);
  }
}

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

app.post('/send-push', async (req, res) => {
  const { token, commission, balance } = req.body;
  if (!token || !commission || !balance) return res.status(400).send('Missing info');
  await sendPushNotification(token, commission, balance);
  res.send('Push sent!');
});

module.exports = app; // For Vercel