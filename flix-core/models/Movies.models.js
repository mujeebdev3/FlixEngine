import mongoose from "mongoose";

const CastSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
});
// Movie Schema
const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    genre: {
      type: [String],
      required: true,
    },
    cast: [CastSchema],
    director: { type: String, required: true },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    comment: {
      type: String,
    },

    duration: {
      type: Number,
      required: true,
      set: (value) => parseDuration(value), // Call helper function to parse duration
    },
    coverImageUri: { type: [String], required: true }, // URL for cover image
    trailerLink: { type: String, required: true },
    videoFileUri: {
      type: [String],
      required: true,
    },
    isFeatured: { type: Boolean, default: false, index: true },
    language: {
      type: String,
      required: true,
    },
    releaseYear: {
      type: Number,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

movieSchema.index({ title: 1, releaseYear: 1, language: 1 }, { unique: true });

// Helper function to parse and convert the duration
export const parseDuration = (duration) => {
  // Remove spaces and make it lowercase for consistency
  const trimmedDuration = duration.trim().toLowerCase();

  // Check for minutes (e.g., 120 mins, 35 minutes)
  if (trimmedDuration.includes("min") || trimmedDuration.includes("minute")) {
    const minutes = parseInt(trimmedDuration.replace(/\D/g, "")); // Remove non-numeric characters
    return isNaN(minutes) ? 0 : minutes;
  }

  // Check for hours (e.g., 2 hours, 1 hr)
  if (
    trimmedDuration.includes("hr") ||
    trimmedDuration.includes("hrs") ||
    trimmedDuration.includes("hours")
  ) {
    const hours = parseInt(trimmedDuration.replace(/\D/g, ""));
    return isNaN(hours) ? 0 : hours * 60; // Convert hours to minutes
  }

  // Default to 0 if no valid format is found
  return 0;
};

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;
