import e from "express";

import movieController from "../controllers/movie.controller.js";

import { authMiddleware, upload } from "../middlewares/index.js";

const movieRouter = e.Router();

movieRouter.post(
  "/create-movie",
  authMiddleware("admin"),
  upload.fields([
    { name: "coverImageUri", maxCount: 5 },
    { name: "videoFileUri", maxCount: 2 },
  ]),
  movieController.creteMovie
);

movieRouter.put(
  "/update-movie/:id",
  authMiddleware(["admin", "user"]),
  movieController.updateMovie
);

movieRouter.delete(
  "/delete-movie/:id",
  authMiddleware("admin"),
  movieController.deleteMovie
);

movieRouter.post(
  "/ratings/:id",
  authMiddleware(["user", "admin"]),
  movieController.addRating
);

movieRouter.get("/", authMiddleware("admin"), movieController.getAllMovies);

movieRouter.get("/search", movieController.searchMovies);
export default movieRouter;
