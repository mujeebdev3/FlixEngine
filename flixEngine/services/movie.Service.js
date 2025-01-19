import { MovieRepository } from "../repositories/index.js";
import { validateMovieData } from "../validations/index.js";

import {
  BadRequestError,
  ConflictError,
  // InternalServerError,
  NotFoundError,
} from "../utils/index.js";
import CloudinaryUploader from "./cloudinaryuploader.js";
import { ERROR_MESSAGES } from "../config/constants.js";

class MovieService {
  static async getAllMovies(page, limit, genre) {
    const { movies, totalMovies } = await MovieRepository.getAllMovies(
      page,
      limit,
      genre
    );
    // console.log("movies:", movies);

    if (!movies || movies.length === 0) {
      // console.log("No movies");
      return {
        message: ERROR_MESSAGES.MOVIE_NOT_FOUND,
        movies: [],
        totalMovies,
        currentPage: page,
        totalPages: Math.ceil(totalMovies / limit),
      };
    }

    const formattedMovies = movies.map((movie, index) => ({
      movie: index + 1 + (page - 1) * limit,
      ...movie,
    }));

    return {
      totalMovies,
      movies: formattedMovies,
    };
  }

  static async getMovieById(movieId) {
    const movie = await MovieRepository.getMovieById(movieId);
    if (!movie) {
      throw new NotFoundError("Movie not found");
    }
    return movie;
  }

  static async createMovie1(movieData, coverImageUri, videoFileUri) {
    const {
      title,
      genre,
      director,
      releaseYear,
      description,
      cast,
      duration,

      trailerLink,

      language,
      releaseDate,
    } = movieData;

    // console.log("cover image uri", coverImageUri);
    // console.log("video file uri", videoFileUri);
    validateMovieData(
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
    );

    const existingMovie = await MovieRepository.findMovie({
      title,
      releaseYear,
      language,
    });
    if (existingMovie) {
      await CloudinaryUploader.deleteLocalFiles(coverImageUri);
      await CloudinaryUploader.deleteLocalFiles(videoFileUri);
      throw new ConflictError(
        `Movie with title "${title}", release year "${releaseYear}", and language "${language}" already exists.`
      );
    }

    // Generic function to handle file uploads
    const uploadFiles = async (filePaths, folderName) => {
      return Promise.all(
        filePaths.map(async (filepath) => {
          const result = await CloudinaryUploader.uploadFile(
            filepath,
            folderName
          );

          return result ? result.secure_url : null;
        })
      );
    };
    const start = Date.now();
    const uploadedCoverImages = await uploadFiles(coverImageUri, "CoverImage");

    const Duration = Date.now() - start;
    console.log("Duration for image  ", Duration);
    const startV = Date.now();
    const uploadedVideos = await uploadFiles(videoFileUri, "VideoFile");
    const DurationV = Date.now() - startV;
    console.log("Duration for Video  ", DurationV);

    /**   xxxxxxxxxxxxxxxxxxxxxxxxxx    */
    // const start = Date.now();
    // const uploadedImages = await Promise.all(
    //   coverImageUri.map(async (filepath) => {
    //     const uploadedImage = CloudinaryUploader.uploadFile(
    //       filepath,
    //       "coverImages"
    //     );
    //     const duration = Date.now() - start;
    //     console.log("duration", duration);
    //     return (await uploadedImage).secure_url;
    //   })
    // );
    // // console.log("uploaded image testing ");
    // // console.log("uploaded images", uploadedImages);
    /**   xxxxxxxxxxxxxxxxxxxxxxxxxx    */

    const newMovie = await MovieRepository.createMovie({
      ...movieData,
      coverImageUri: uploadedCoverImages,
      videoFileUri: uploadedVideos,
    });
    if (!newMovie) {
      throw new BadRequestError();
    }
    return newMovie;
  }

  static async rateMovie(movieId, userId, rating, comment) {
    // Convert the rating to a number
    const numericRating = parseInt(rating, 10);
    // console.log("Converted rating:", numericRating);

    // Validate the rating
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      throw new BadRequestError(
        "Not a valid rating. It must be a number between 1 and 5."
      );
    }

    // Find the movie by ID
    const movie = await MovieRepository.findMovieById(movieId);

    if (!movie) {
      throw new NotFoundError("Movie not found");
    }

    // Check if the user has already rated the movie
    const existingRating = await MovieRepository.findUserRating(
      movieId,
      userId
    );
    if (comment && comment.length > 500) {
      throw new BadRequestError(
        "Comment is too long.It should not exceed 500 characters."
      );
    }
    const sanitizedComment = comment ? comment.replace(/<[^>]+>/g, "") : null;

    let result;
    if (existingRating) {
      // If a rating exists, update it
      result = await MovieRepository.updateMovieRating(
        movieId,
        userId,
        numericRating,
        sanitizedComment
      );
    } else {
      // If no rating exists, create a new one
      result = await MovieRepository.addMovieRating(
        movieId,
        userId,
        numericRating,
        sanitizedComment
      );
    }

    // Calculate the new average rating for the movie
    const averageRating = await MovieRepository.calculateAverageRating(movieId);
    const averageComment = await MovieRepository.calculateComment(movieId);

    await MovieRepository.updateMovie(movieId, {
      rating: averageRating,
      comment: averageComment,
    });
    // console.log("result1", result);
    return {
      rating: result.rating,
      comment: result.comment,
    };
  }

  static async updateMovie(movieId, movieData) {
    if (!movieData) {
      throw new BadRequestError("Movie data is required");
    }
    // console.log("moviedata", movieData);
    const movie = await MovieRepository.updateMovie(movieId, movieData);

    if (!movie) {
      throw new NotFoundError(ERROR_MESSAGES.MOVIE_NOT_FOUND);
    }
    return movie;
  }

  static async searchMovie(query) {
    if (!query) {
      throw new BadRequestError("Search query parameter is required");
    }
    const movies = await MovieRepository.searchMovies(query);
    if (movies.length === 0) {
      throw new NotFoundError("No movies found matching the search criteria");
    }
    return movies;
  }

  static async deleteMovie(movieId) {
    return await MovieRepository.deleteMovie(movieId);
  }
}
export default MovieService;
