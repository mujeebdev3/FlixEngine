import { BadRequestError } from "../utils/index.js";
import { ERROR_MESSAGES } from "../config/index.js";

/**
 * Validates the provided values based on the conditions defined in validations array.
 * @param {Array} validations - An array of validation conditions with value and message
 * @throws {BadRequestError} - If any validation fails
 */
export const validateInputs = (validations) => {
  validations.forEach(({ value, message }) => {
    if (!value) throw new BadRequestError(message);
  });
};

/**
 * Custom validation for specific fields.
 * @param {string} email - The email to validate
 * @param {string} password - The password to validate
 * @param {string} phoneNr - The phone number to validate
 * @param {string} name - The name to validate
 * @throws {BadRequestError} - If any validation fails
 */
export const validateSignup = (email, password, phoneNr, name) => {
  const validations = [
    { value: email, message: ERROR_MESSAGES.INVALID_EMAIL },
    { value: password, message: ERROR_MESSAGES.INVALID_PASSWORD },
    { value: phoneNr, message: ERROR_MESSAGES.INVALID_PHONE },
    { value: name, message: ERROR_MESSAGES.INVALID_NAME },
  ];

  validateInputs(validations);
};
