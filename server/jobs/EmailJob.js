const BaseJob = require("./BaseJob");
const nodemailer = require("nodemailer");

class EmailJob extends BaseJob {
  constructor(taskData) {
    super(taskData);
    this.to = taskData.payload?.to || "";
    this.subject = taskData.payload?.subject || "No Subject";
    this.body = taskData.payload?.body || "";
    this.from = taskData.payload?.from || process.env.EMAIL_USER;
  }

  async run() {
    console.log(`[EmailJob] Sending real email to: ${this.to}`);

    // Validation
    if (!this.to || !this.subject)
      throw new Error("EmailJob requires 'to' and 'subject' in payload");

    // Create Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send the actual email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: this.to,
      subject: this.subject,
      text: this.body,
    });

    console.log(`[EmailJob] Real email delivered to ${this.to}`);
    return { type: "email", recipient: this.to, subject: this.subject, sentAt: new Date().toISOString() };
  }

  getSummary() {
    return { ...super.getSummary(), type: "EmailJob", recipient: this.to, subject: this.subject };
  }
}

module.exports = EmailJob;
