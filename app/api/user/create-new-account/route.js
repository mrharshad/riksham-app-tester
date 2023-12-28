import dbConnect from "@/backend/config/dbConnect";
import User from "@/backend/models/user";
import nodeMailer from "nodemailer";
import Jwt from "jsonwebtoken";
import errors from "@/backend/utils/errorHandler";
import { cookies } from "next/headers";

// apply api - /user/sign-up
export async function POST(req) {
  try {
    const hostname = new URL(req.url).hostname;
    let {
      fName,
      lName,
      email,
      address,
      pinCode,
      district,
      state,
      mobileNo,
      birth,
      gender,
    } = await req.json();
    dbConnect();
    let [userName, domain] = email.toLowerCase().trim().split("@");
    email = userName + "@gmail.com";

    const characters =
      "ABCstuDE67FGHIJKOPQRSTUVWXabcdefghijklmnopqrvwxyzYZ0123458LM9N";
    let randomString = "";
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }

    const findUser = await User.findOne({ email });
    if (findUser) {
      throw new Error(`already has an account created`);
    }
    const newToken = Jwt.sign(
      { token: randomString, verifiedEmail: email },
      process.env.JWT_SECRET_CODE,
      {
        expiresIn: "24h",
      }
    );

    cookies().set({
      name: "newAccount",
      value: JSON.stringify({
        fName,
        lName,
        email,
        mobileNo,
        address,
        state,
        district,
        pinCode,
        token: newToken,
        tokensSent: 1,
        birth,
        gender,
        tokenExpire: Date.now() + 15 * 60 * 1000,
      }),
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      path: "/",
    });

    const transporter = nodeMailer.createTransport({
      service: process.SMTP_SERVICE,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      // secure: true,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    const message = `Hi ${fName} \n\n We have received a request to sign up on ${hostname} via your email address. Your ${hostname} verification code is: \n\n ${randomString} \n\n If you did not request this code, it is possible that someone else is trying to sign up for ${hostname}. Do not forward or give this code to anyone. \n\n You received this message because your @gmail address was used to sign up on ${hostname}.`;
    const mailOption = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: `${hostname} Email Verification Code`,
      text: message,
    };
    const sendMail = await transporter.sendMail(mailOption);
    if (sendMail.accepted.length > 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `The verification code has been sent to ${email}`,
        }),
        {
          status: 200,
        }
      );
    } else {
      throw new Error(
        "There was a problem sending  verification code, please try again later"
      );
    }
  } catch (error) {
    return errors(error, 200);
  }
}
