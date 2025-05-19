import { Movie, Rating } from "../models/index.js";

class MovieRepository {
  async getAllMovies(page = 1, limit = 10, genre = null) {
    const query = {
      isDeleted: false,
      ...(genre && { genre: { $in: genre } }),
    };
    // console.log("query", genre);

    // console.log("final query", query);
    const skip = (page - 1) * limit;
    const totalMovies = await Movie.countDocuments(query);

    const movies = await Movie.find(query)
      .skip(skip)
      .limit(limit)
      .lean()
      .select(
        "title description releaseDate genre rating coverImageUri videoFileUri comment"
      );
    return {
      movies,
      totalMovies,
    };
  }

  async getMovieById(movieId) {
    return await Movie.findById(movieId).lean();
  }
  async findMovie(filter) {
    return await Movie.findOne(filter);
  }

  async findMovieById(movieId) {
    return await Movie.findById(movieId).lean();
  }

  async createMovie(movieData) {
    const movie = new Movie(movieData);
    return await movie.save();
  }

  async updateMovie(movieId, movieData) {
    return await Movie.findByIdAndUpdate(movieId, movieData, {
      new: true, // Return the updated document
    }).lean();
  }

  // Soft delete a movie (set 'isDeleted' to true)
  async softDeleteMovie(movieId) {
    const movie = await Movie.findById(movieId);

    movie.isDeleted = true;
    await movie.save();
  }

  // Hard delete a movie from the database
  async hardDeleteMovie(movieId) {
    return await Movie.findByIdAndDelete(movieId);
  }

  async searchMovies(query) {
    // const searchTerm = query.q;
    const regex = new RegExp(query, "i");
    // Case-insensitive search
    console.log("Searching movies", regex);
    return await Movie.find({
      $or: [
        { title: { $regex: regex } },
        { genre: { $regex: regex } },
        { description: { $regex: regex } },
        { "cast.name": { $regex: regex } },
        { "cast.role": { $regex: regex } },
      ],
    }).lean();
  }

  /* MOVIE RATING */

  async addMovieRating(movieId, userId, rating, comment) {
    const result = await Rating.create({
      movieId,
      userId,
      rating,
      comment,
    });
    // console.log("result", result);
    return result;
  }

  async findUserRating(movieId, userId) {
    const rating = await Rating.findOne({ movieId, userId }).lean();

    if (!rating) {
      return null;
    }

    return rating.rating;
  }

  async updateMovieRating(movieId, userId, updatedFields) {
    return await Rating.findOneAndUpdate(
      { movieId, userId },
      { $set: updatedFields },
      { new: true }
    );
  }

  async updateRatingPartial(movieId, userId, unsetFields) {
    return await Rating.findOneAndUpdate(
      { movieId, userId },
      { $unset: unsetFields },
      { new: true }
    );
  }

  async deleteUserRating(movieId, userId) {
    return await Rating.findOneAndDelete({ movieId, userId });
  }

  async calculateAverageRating(movieId) {
    const ratings = await Rating.find({
      movieId,
      rating: { $exists: true },
    }).lean();
    if (!ratings || ratings.length === 0) {
      return 0;
    }
    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    return totalRating / ratings.length;
  }

  async calculateComment(movieId) {
    const commentCount = await Rating.countDocuments({
      movieId,
      comment: { $exists: true },
    });

    return commentCount;
  }
}
export default new MovieRepository();
