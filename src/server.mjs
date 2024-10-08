import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { UserRouter } from "./routes/UserRoutes.mjs";
import { ProductRouter } from "./routes/ProductRoutes.mjs";
import { CartRouter } from "./routes/CartRoutes.mjs";
import { WishListRouter } from "./routes/WishListRoutes.mjs";
import path from "path";
import { cwd } from "process";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.set("view engine", "ejs");
app.set("views", "src/views/");

app.use(cors());
app.use(express.json());
app.use('/api/uploads', express.static(path.join(cwd(), './uploads')))

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Database Connectd"))
  .catch((err) => console.log(err));

app.use("/api/", UserRouter);
app.use("/api/products", ProductRouter);
app.use("/api/carts", CartRouter);
app.use("/api/wishlist", WishListRouter);

app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});
