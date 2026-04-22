const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  let transporter;

  // If no SMTP_USER is provided in .env, automatically create a fake testing account
  if (!process.env.SMTP_USER) {
    console.log("No SMTP_USER found in .env. Creating a temporary test account...");
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    // Normal configuration (For real sending, when you add your own emails later)
    const port = process.env.SMTP_PORT || 465;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: port,
      secure: Number(port) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  const mailOptions = {
    from: `${process.env.FROM_NAME || 'AlumniConnect'} <${process.env.SMTP_USER || 'test@alumniconnect.com'}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);

  // If using testing account, print the preview URL in the console so you can see the OTP!
  if (!process.env.SMTP_USER) {
    console.log("==========================================================");
    console.log("TEST EMAIL SENT!");
    console.log("Preview URL To View OTP: %s", nodemailer.getTestMessageUrl(info));
    console.log("==========================================================");
  }

  return info;
};

module.exports = sendEmail;
