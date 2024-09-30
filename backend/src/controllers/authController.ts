import { Request, Response } from "express";
import User, { validateUser } from "../models/userModel";
import bcrypt from "bcrypt";
import { logger } from "../startup/logger";
import jwt from "jsonwebtoken";
import { TokenPayload } from "../types/types";
import { createTransport } from "nodemailer";
import "dotenv/config";
import { validatePassword } from "../helpers/validation";

export const login = async (req: Request, res: Response) => {
  try {
    const { error } = validateUser(req.body);
    if (error) {
      return res.status(400).send({ error: error.details[0].message });
    }

    const user = await User.findOne({ indexNumber: req.body.indexNumber });
    if (!user) {
      return res
        .status(400)
        .send({ error: "Invalid index number or password" });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res
        .status(400)
        .send({ error: "Invalid index number or password" });
    }

    const token = user.generateAuthToken();

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.json({ message: "Login successful", token });
  } catch (error) {
    logger.error(`Error in login: ${(error as Error).message}`);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { indexNumber } = req.body;
    const user = await User.findOne({ indexNumber });
    if (!user) {
      return res.status(400).send({ error: "Index number does not exist" });
    }

    const secret = process.env.JWTPrivateKey + user.password;
    const token = jwt.sign(
      { indexNumber: user.indexNumber, id: user._id },
      secret,
      {
        expiresIn: "5m",
      }
    );

    const link = `${process.env.FRONTEND_URL!}/auth/reset-password/${
      user._id
    }/${token}`;

    const transporter = createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL!,
        pass: process.env.APP_Password!,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL!,
      to: user.email,
      subject: "Reset password",
      html: `
      <p>Hello ${user.firstName || "User"},</p>
      <p>We received a request to reset the password for your account. Please click the link below to reset your password:</p>
      <a href="${link}">Reset Password</a>
      <p>This link will expire in 5 minutes for security reasons. If you didn't request this password reset, you can safely ignore this email.</p>
      <p>Thank you,<br>UENR Team</p>
    `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send({ message: "Email sent successfully" });
  } catch (error) {
    logger.error((error as Error).message);
    res.status(500).send({ error: "Failed to process password reset request" });
  }
};

export const resetPasswordGet = async (req: Request, res: Response) => {
  const { id, token } = req.params;
  if (!id || !token) {
    return res.status(400).send({ error: "Invalid token or id" });
  }
  const user = await User.findOne({ _id: id });
  if (!user) {
    return res.status(400).send({ error: "No user found" });
  }

  const secret = process.env.JWTPrivateKey! + user.password;
  try {
    const verify = jwt.verify(token, secret) as TokenPayload;

    res.send({
      indexNumber: verify.indexNumber,
      status: "not verified",
    });
  } catch (error) {
    logger.error((error as Error).message);
    res.status(400).send({ error: "Invalid token or user not found" });
  }
};

export const resetPasswordPost = async (req: Request, res: Response) => {
  try {
    const { error } = validatePassword(req.body);
    if (error) {
      return res.status(400).send({ error: error.details[0].message });
    }

    const { id, token } = req.params;
    if (!id || !token) {
      return res.status(400).send({ error: "Invalid token or id" });
    }
    const { password } = req.body;

    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(400).send({ error: "No user found" });
    }

    const secret = process.env.JWTPrivateKey! + user.password;
    const verify = jwt.verify(token, secret) as TokenPayload;
    if (!verify) {
      return res.status(400).send({ error: "Token not verified" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          password: hashedPassword,
        },
      }
    );

    res.status(200).send({
      message: "Password updated",
    });
  } catch (error) {
    logger.error((error as Error).message);
    res.status(400).send({ error: "Failed to update password" });
  }
};
