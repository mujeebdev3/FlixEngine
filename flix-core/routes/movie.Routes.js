import e from "express";

import movieController from "../controllers/movie.controller.js";

import { authMiddleware, upload } from "../middlewares/index.js";

const movieRouter = e.Router();

movieRouter.post(
  "/create-movie",
  authMiddleware("admin"),
  upload.fields([
    { name: "coverImageUri", maxCount: 5 },
    { name: "videoFileUri", maxCount: 1 },
  ]),
  movieController.creteMovie
);

movieRouter.put(
  "/update-movie/:id",
  upload.fields([
    { name: "coverImageUri", maxCount: 5 },
    { name: "videoFileUri", maxCount: 1 },
  ]),
  authMiddleware(["admin"]),
  movieController.updateMovie
);

movieRouter.get(
  "/:id",
  authMiddleware(["user", "admin"]),
  movieController.getMovieById
);
movieRouter.patch(
  "/soft-delete-movie/:id",
  authMiddleware("admin"),
  movieController.softDeleteMovie
);

movieRouter.delete(
  "/hard-delete-movie/:id",
  authMiddleware("admin"),
  movieController.hardDeleteMovie
);

movieRouter.post(
  "/ratings/:id",
  authMiddleware(["user", "admin"]),
  movieController.addRating
);

movieRouter.delete(
  "/delete-rating/:id/rating",
  authMiddleware(["user", "admin"]),
  movieController.deleteRating
);

movieRouter.get(
  "/",
  authMiddleware(["admin", "user"]),
  movieController.getAllMovies
);

movieRouter.get("/search", movieController.searchMovies);
export default movieRouter;
