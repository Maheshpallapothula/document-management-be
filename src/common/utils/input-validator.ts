import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { MESSAGES } from "../utils/messages";
import { REGEX } from "../utils/regex";

@ValidatorConstraint({ name: "remove_white_spaces", async: false })
export class RemoveWhiteSpaces implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return typeof text === "string" && text.trim().length > 0;
  }
  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return MESSAGES.ERROR.SHORT_VALUE_ERROR;
  }
}

@ValidatorConstraint({ name: "special_chars_only", async: false })
export class ValidatePassword implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const pattern = new RegExp(REGEX.PASSWORD);
    return pattern.test(value);
  }
  defaultMessage(args: ValidationArguments) {
    const allowedChars = args?.constraints[0];
    return `Invalid characters found. Only ${allowedChars.join(
      ", "
    )} are allowed.`;
  }
}
