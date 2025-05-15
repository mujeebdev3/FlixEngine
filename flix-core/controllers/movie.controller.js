import { MovieService } from "../services/index.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../config/index.js";

class movieController {
  async creteMovie(req, res, next) {
    try {
      const movieData = req.body;
      // const videoFileUri = req.files ? req.files.map((file) => file.path) : [];
      // console.log("req", req.files);
      const coverImageUri =
        req.files?.coverImageUri?.map((file) => file.path) || [];

      // console.log("coverImageUri", coverImageUri);
      const videoFileUri =
        req.files && req.files.videoFileUri
          ? req.files.videoFileUri.map((file) => file.path)
          : [];

      // console.log("creating movie");
      // console.log("req", req.body);
      const movie = await MovieService.createMovie1(
        movieData,
        coverImageUri,
        videoFileUri
      );

      res.status(STATUS_CODES.CREATED).json({
        message: SUCCESS_MESSAGES.MOVIE_ADDED,
        data: movie,
        success: true,
        error: false,
      });
    } catch (err) {
      next(err);
      // console.log("error1", err.code);
      // console.log("error2", err.message);
    }
  }

  async updateMovie(req, res, next) {
    try {
      const movieId = req.params.id;
      // console.log("movieId", req.params);
      const movieData = req.body;
      const updatedMovie = await MovieService.updateMovie(movieId, movieData);
      res.status(STATUS_CODES.CREATED).json({
        message: SUCCESS_MESSAGES.MOVIE_UPDATED,
        data: updatedMovie,
        success: true,
        error: false,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteMovie(req, res, next) {
    try {
      const movieId = req.params.id;
      // console.log("movieId", req.params);
      const deletedMovie = await MovieService.deleteMovie(movieId);
      res.status(STATUS_CODES.SUCCESS).json({
        message: SUCCESS_MESSAGES.MOVIE_DELETED,
        data: deletedMovie,
        success: true,
        error: false,
      });
    } catch (err) {
      next(err);
    }
  }

  async addRating(req, res, next) {
    try {
      const movieId = req.params.id;

      const { rating, comment } = req.body;
      const userId = req.userId;
      // console.log("rating", rating);
      // console.log("userId", userId);
      const ratedMovie = await MovieService.rateMovie(
        movieId,
        userId,
        rating,
        comment
      );
      res.status(STATUS_CODES.SUCCESS).json({
        message: SUCCESS_MESSAGES.MOVIE_RATED,
        data: ratedMovie,
      });
    } catch (err) {
      next(err);
    }
  }

  async searchMovies(req, res, next) {
    try {
      const query = req.query.q;
      // console.log("query", req.query.q);
      const movies = await MovieService.searchMovie(query);

      res.status(STATUS_CODES.SUCCESS).json({
        message: SUCCESS_MESSAGES.MOVIE_SEARCH_SUCCESS,
        data: movies,
      });
    } catch (err) {
      next(err);
    }
  }

  async getAllMovies(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const genre = req.query.genre ? [].concat(req.query.genre) : null;
      // console.log("genre", genre);
      const { movies, totalMovies } = await MovieService.getAllMovies(
        page,
        limit,
        genre
      );

      // console.log("movies ", movies);
      res.status(STATUS_CODES.SUCCESS).json({
        message: SUCCESS_MESSAGES.OPERATION_SUCCESSFUL,
        totalMovies,
        currentPage: page,
        totalPages: Math.ceil(totalMovies / limit),
        movies,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new movieController();
