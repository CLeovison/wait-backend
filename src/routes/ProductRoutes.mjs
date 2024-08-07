import { Router } from "express";
import { ProductController } from "../controllers/ProductController.mjs";

export const ProductRouter = Router();

ProductRouter.post("/create", ProductController.createProduct);
ProductRouter.get("/", ProductController.paginatedProducts);
ProductRouter.get("/:id", ProductController.getProductID);
ProductRouter.put("/:id", ProductController.updateProduct);
ProductRouter.delete("/:id", ProductController.deleteProduct);
