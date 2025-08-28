const express = require('express');
const sgMail = require('@sendgrid/mail');

const app = express();
app.use(express.json());  // For reading data from frontend

// Set your SendGrid API Key (Twilio's email key)
sgMail.setApiKey(process.env.SENDGRID_API_KEY);  // Use environment variable

// The /send-email endpoint (your frontend will call this)
app.post('/send-email', async (req, res) => {
  const { toEmail, commission, balance } = req.body;  // Data from frontend

  // Check if all info is there
  if (!toEmail || !commission || !balance) {
    return res.status(400).send('Missing info: need toEmail, commission, balance');
  }

  // Email message (customize if you want)
  const msg = {
    to: toEmail,  // Referrer's email
    from: 'acmelectrical12@gmail.com',  // Your sender email from SendGrid
    subject: 'You Earned a Referral Commission!',
    text: `Hi! You earned QR ${commission} from a referral. Your balance is now QR ${balance}. Thanks! - ACM HUB`,
    html: `<p>Hi!</p><p>You earned <strong>QR ${commission}</strong> from a referral.</p><p>Your balance is now <strong>QR ${balance}</strong>.</p><p>Thanks! - ACM HUB</p>`,
  };

  try {
    await sgMail.send(msg);  // Send via Twilio SendGrid
    console.log('Email sent to ' + toEmail);
    res.send('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending email');
  }
});

// Start the server on a flexible port (for Vercel/local)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
