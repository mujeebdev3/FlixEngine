import { MovieRepository } from "../repositories/index.js";
import { validateMovieData } from "../validations/index.js";

import {
  BadRequestError,
  ConflictError,
  // InternalServerError,
  NotFoundError,
} from "../utils/index.js";
import CloudinaryUploader from "./cloudinaryuploader.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../config/constants.js";

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

    // const formattedMovies = movies.map((movie, index) => ({
    //   movie: index + 1 + (page - 1) * limit,
    //   ...movie,
    // }));

    // return {
    //   totalMovies,
    //   movies: formattedMovies,
    // };

    const formattedMovies = await Promise.all(
      movies.map(async (movie, index) => {
        const averageRating = await MovieRepository.calculateAverageRating(
          movie._id
        );
        const averageComment = await MovieRepository.calculateComment(
          movie._id
        );

        return {
          movie: index + 1 + (page - 1) * limit,
          ...movie,
          rating: averageRating ?? null, // assign calculated average rating or null
          comment: averageComment ?? null, // assign calculated average comment or null
        };
      })
    );

    return {
      totalMovies,
      movies: formattedMovies,
      currentPage: page,
      totalPages: Math.ceil(totalMovies / limit),
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

      duration,

      trailerLink,

      language,
      releaseDate,
    } = movieData;
    let cast = movieData.cast;
    console.log("cast", cast);
    console.log("cast", typeof cast);
    if (typeof cast === "string") {
      try {
        cast = JSON.parse(cast);
      } catch (err) {
        console.log("err", err);
        throw new BadRequestError("Cast should be an array of objects");
      }
    }
    movieData.cast = cast;

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
    const uploadFiles = async (filePaths, folderName, resource_type) => {
      return Promise.all(
        filePaths.map(async (filepath) => {
          const result = await CloudinaryUploader.uploadFile(
            filepath,
            folderName,
            resource_type,
            title
          );

          return result ? result.secure_url : null;
        })
      );
    };

    let uploadedCoverImages;
    let uploadedVideos;

    try {
      const start = Date.now();
      uploadedCoverImages = await uploadFiles(
        coverImageUri,
        "CoverImage",
        "image"
      );

      const Duration = Date.now() - start;
      console.log("Duration for image  ", Duration);
      const startV = Date.now();
      uploadedVideos = await uploadFiles(videoFileUri, "VideoFile", "video");
      console.log("uploaded videos", uploadedVideos);

      const DurationV = Date.now() - startV;
      console.log("Duration for Video  ", DurationV);

      const newMovie = await MovieRepository.createMovie({
        ...movieData,
        coverImageUri: uploadedCoverImages,
        videoFileUri: uploadedVideos,
      });
      if (!newMovie) {
        throw new BadRequestError();
      }

      return newMovie;
    } catch (err) {
      console.error("Error uploading files:", err);
      await CloudinaryUploader.deleteLocalFiles(coverImageUri);
      await CloudinaryUploader.deleteLocalFiles(videoFileUri);

      if (uploadedCoverImages?.length) {
        for (const url of uploadedCoverImages) {
          // console.log("url", url);
          const public_id = await CloudinaryUploader.getPublicIdFromUrl(url);
          // console.log("public_id", public_id);

          await CloudinaryUploader.deleteUploadedFile(public_id);
        }
      }

      if (uploadedVideos?.length) {
        for (const url of uploadedVideos) {
          // console.log("url", url);
          const public_id = await CloudinaryUploader.getPublicIdFromUrl(url);
          // console.log("public_id", public_id);

          await CloudinaryUploader.deleteUploadedFile(public_id);
        }
      }

      throw err;
    }

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
  }

  static async updateMovie(movieId, movieData, coverImageUri, videoFileUri) {
    if (!movieData) {
      throw new BadRequestError("Movie data is required");
    }
    const uploadFiles = async (filePaths, folderName, resource_type, title) => {
      return Promise.all(
        filePaths.map(async (filepath) => {
          const result = await CloudinaryUploader.uploadFile(
            filepath,
            folderName,
            resource_type,
            title
          );

          return result ? result.secure_url : null;
        })
      );
    };

    const movie = await MovieRepository.findMovieById(movieId);
    if (!movie) {
      throw new NotFoundError(ERROR_MESSAGES.MOVIE_NOT_FOUND);
    }
    console.log("movie", movie);

    const oldCoverImageUri = movie.coverImageUri || [];
    const oldVideoFileUri = movie.videoFileUri || [];

    let uploadedCoverImages;
    let uploadedVideos;

    try {
      uploadedCoverImages = await uploadFiles(
        coverImageUri,
        "CoverImage",
        "image",
        movieData?.title || movie.title
      );

      uploadedVideos = await uploadFiles(
        videoFileUri,
        "VideoFile",
        "video",
        movieData?.title || movie.title
      );

      const updatedMovie = await MovieRepository.updateMovie(movieId, {
        ...movieData,
        coverImageUri: uploadedCoverImages,
        videoFileUri: uploadedVideos,
      });

      if (!updatedMovie) {
        await CloudinaryUploader.deleteLocalFiles(coverImageUri);
        await CloudinaryUploader.deleteLocalFiles(videoFileUri);

        if (uploadedCoverImages?.length) {
          for (const url of uploadedCoverImages) {
            const public_id = await CloudinaryUploader.getPublicIdFromUrl(url);

            await CloudinaryUploader.deleteUploadedFile(public_id);
          }
        }
        if (uploadedVideos?.length) {
          for (const url of uploadedVideos) {
            const public_id = await CloudinaryUploader.getPublicIdFromUrl(url);

            await CloudinaryUploader.deleteUploadedFile(public_id);
          }
        }

        throw new NotFoundError(ERROR_MESSAGES.MOVIE_ERROR);
      }

      // safely delete old cloudinary files
      if (coverImageUri.length > 0) {
        for (const url of oldCoverImageUri) {
          const public_id = await CloudinaryUploader.getPublicIdFromUrl(url);

          await CloudinaryUploader.deleteUploadedFile(public_id);
        }
      }
      if (videoFileUri.length > 0) {
        for (const url of oldVideoFileUri) {
          const public_id = await CloudinaryUploader.getPublicIdFromUrl(url);

          await CloudinaryUploader.deleteUploadedFile(public_id);
        }
      }

      return SUCCESS_MESSAGES.MOVIE_UPDATED;
    } catch (error) {
      console.error("Error uploading files:", error);
      await CloudinaryUploader.deleteLocalFiles(coverImageUri);
      await CloudinaryUploader.deleteLocalFiles(videoFileUri);

      if (uploadedCoverImages?.length) {
        for (const url of uploadedCoverImages) {
          const public_id = await CloudinaryUploader.getPublicIdFromUrl(url);

          await CloudinaryUploader.deleteUploadedFile(public_id);
        }
      }

      if (uploadedVideos?.length) {
        for (const url of uploadedVideos) {
          const public_id = await CloudinaryUploader.getPublicIdFromUrl(url);

          await CloudinaryUploader.deleteUploadedFile(public_id);
        }
      }

      throw error;
    }

    // console.log("moviedata", movieData);
  }

  static async rateMovie(movieId, userId, rating, comment) {
    // Convert the rating to a number
    const numericRating = parseInt(rating, 10);
    console.log("Converted rating:", numericRating);

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
      result = await MovieRepository.updateMovieRating(movieId, userId, {
        rating: numericRating,
        comment: sanitizedComment,
      });
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

  static async deleteUserRating(movieId, userId, deleteType) {
    const existingRating = await MovieRepository.findUserRating(
      movieId,
      userId
    );
    console.log("existingRating", existingRating);
    if (!existingRating) {
      throw new NotFoundError("Rating not found");
    }
    if (!deleteType) {
      return await MovieRepository.deleteUserRating(movieId, userId);
    }

    const unsetFields = {};

    if (deleteType === "rating") {
      unsetFields.rating = "";
    } else if (deleteType === "comment") {
      unsetFields.comment = "";
    } else {
      throw new BadRequestError("Invalid deleteType");
    }
    console.log("updatedField", unsetFields);

    const updateRating = await MovieRepository.updateRatingPartial(
      movieId,
      userId,
      unsetFields
    );

    // Calculate the new average rating for the movie
    const averageRating = await MovieRepository.calculateAverageRating(movieId);
    const averageComment = await MovieRepository.calculateComment(movieId);

    console.log("avr ", averageComment, averageRating);

    await MovieRepository.updateMovie(movieId, {
      rating: averageRating,
      comment: averageComment,
    });

    return updateRating;
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

  static async softDeleteMovie(movieId) {
    return await MovieRepository.softDeleteMovie(movieId);
  }

  static async hardDeleteMovie(movieId) {
    return await MovieRepository.hardDeleteMovie(movieId);
  }
}
export default MovieService;
