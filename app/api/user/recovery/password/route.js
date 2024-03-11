import dbConnect from "@/backend/config/dbConnect";
import User from "@/backend/models/user";
import nodeMailer from "nodemailer";
import crypto from "crypto";
// apply api - /user/login
export async function PUT(req) {
  try {
    let { email } = await req.json();
    dbConnect();

    let [userName, domain] = email.trim().split("@");
    domain = domain.toLowerCase();
    if (domain !== "gmail.com") {
      throw new Error("Use username@gmail.com to sign up");
    }
    email = userName.concat("@", domain);
    const findUser = await User.findOne({ email });
    if (!findUser) {
      throw new Error(`We don't have any users associated with ${email} email`);
    }
    const protocol = new URL(req.url).protocol;
    const hostname = new URL(req.url).hostname;
    const randomString = crypto.randomBytes(20).toString("hex");
    const resetPasswordUrl = `${protocol}//${hostname}/user/password-recovery?key=${randomString}`;
    let { firstName, tokensSent, holdOnToken } = findUser;
    tokensSent = tokensSent || 0;

    if (holdOnToken > Date.now()) {
      const pendingTime = ((holdOnToken - Date.now()) / 60 / 60 / 1000)
        .toFixed(2)
        .toString();
      const [hours, minute] = pendingTime.split(".");
      throw new Error(
        `try after: ${
          pendingTime.length > 2
            ? `${hours}:hours ${minute}:minutes`
            : `${minute}: minutes`
        }`
      );
    }
    const message = `Hi ${firstName}  \n\n We have received a request for password recovery on ${hostname} via your email address, You can choose your new password through this URL, \n\n ${resetPasswordUrl} \n\n This URL will become invalid after some time,\n\n  If you did not request this code, it is possible that someone else is trying to password recovery for ${hostname} Do not forward or give this code to anyone.\n\n You received this message because your @gmail address was used to password recovery on ${hostname}`;
    const transporter = nodeMailer.createTransport({
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    const mailOption = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: `${hostname} password recovery`,
      text: message,
    };
    const sendMail = await transporter.sendMail(mailOption);

    if (sendMail.accepted.length > 0) {
      const update = await findUser.updateOne({
        $set: {
          token: crypto.createHash("sha256").update(randomString).digest("hex"),
          tokenExpire: Date.now() + 15 * 60 * 1000,
          tokensSent: tokensSent <= 3 ? tokensSent + 1 : 0,
          holdOnToken:
            tokensSent === 4 ? Date.now() + 12 * 60 * 60 * 1000 : undefined,
        },
      });
      if (update.modifiedCount === 1 && update.acknowledged) {
        return new Response(
          JSON.stringify({
            success: true,
            message: `Email send:- ${email}`,
          }),
          {
            status: 200,
          }
        );
      } else {
        throw new Error("your token not updated");
      }
    } else {
      throw new Error(
        "There was a problem sending token, please try again later"
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      {
        status: 200,
      }
    );
  }
}
