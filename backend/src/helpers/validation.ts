import Joi from "joi";
import { ValidatePasswordProps } from "../types/types";

export const validatePassword = (data: ValidatePasswordProps) => {
  const schema = Joi.object({
    password: Joi.string()
      .min(8)
      .required()
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"))
      .messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least {#limit} characters long",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)",
      }),
  });
  return schema.validate(data, { abortEarly: false });
};
