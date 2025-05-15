import { BadRequestError } from "../utils/index.js";
import { ERROR_MESSAGES } from "../config/index.js";

/**
 * Validates movie data when creating or updating a movie.
 * @param {string} title - The movie title to validate
 * @param {string} genre - The movie genre to validate
 * @param {string} director - The movie director to validate
 * @param {number} releaseYear - The release year to validate
 * @param {string} description - The description to validate
 * @param {Array<string>} cast - The cast members to validate
 * @param {number} duration - The duration of the movie to validate
 * @param {string} coverImageUri - The URI for the cover image to validate
 * @param {string} trailerLink - The link to the movie trailer to validate
 * @param {string} videoFile - The movie video file to validate
 * @param {string} language - The language of the movie to validate
 * @param {Date} releaseDate - The release date to validate

 * @throws {BadRequestError} - If any validation fails
 */
export const validateMovieData = (
  title,
  genre,
  director,
  releaseYear,
  description,
  cast,
  duration,
  coverImageUri,
  trailerLink,
  videoFileUri,
  language,
  releaseDate
) => {
  // Collecting validation checks for required fields
  const validations = [
    { value: title, message: ERROR_MESSAGES.INVALID_TITLE },
    { value: genre, message: ERROR_MESSAGES.INVALID_GENRE },
    { value: director, message: ERROR_MESSAGES.INVALID_DIRECTOR },
    { value: releaseYear, message: ERROR_MESSAGES.INVALID_RELEASE_YEAR },
    { value: description, message: ERROR_MESSAGES.INVALID_DESCRIPTION },
    { value: cast, message: ERROR_MESSAGES.INVALID_CAST },
    { value: duration, message: ERROR_MESSAGES.INVALID_DURATION },
    { value: coverImageUri, message: ERROR_MESSAGES.INVALID_COVER_IMAGE },
    { value: trailerLink, message: ERROR_MESSAGES.INVALID_TRAILER },
    { value: videoFileUri, message: ERROR_MESSAGES.INVALID_VIDEO },
    { value: language, message: ERROR_MESSAGES.INVALID_LANGUAGE },
    { value: releaseDate, message: ERROR_MESSAGES.INVALID_RELEASE_DATE },
  ];

  // Validate the inputs using the generic validation function
  validateInputs(validations);

  // Additional validation logic that requires custom checks

  // Description length validation (between 10 and 500 characters)
  if (description && (description.length < 10 || description.length > 500)) {
    throw new BadRequestError(ERROR_MESSAGES.INVALID_DESCRIPTION_LENGTH);
  }

  // Duration validation (positive integer only)
  if (duration && duration <= 0) {
    throw new BadRequestError(ERROR_MESSAGES.INVALID_DURATION);
  }

  // Release Date validation (should not be in the future)
  if (releaseDate && new Date(releaseDate) > new Date()) {
    throw new BadRequestError(ERROR_MESSAGES.INVALID_RELEASE_DATE);
  }
};

/**
 * Generic validation function that checks if the value is present and valid.
 * @param {Array} validations - List of validations to perform
 * @throws {BadRequestError} - If any validation fails
 */
export const validateInputs = (validations) => {
  validations.forEach(({ value, message }) => {
    if (!value) {
      throw new BadRequestError(message);
    }
  });
};
