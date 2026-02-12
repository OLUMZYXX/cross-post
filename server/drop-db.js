import mongoose from "mongoose";
import { MONGO_URI } from "./src/config/env.js";

async function dropDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    await mongoose.connection.db.dropDatabase();
    console.log("Database dropped successfully");
  } catch (error) {
    console.error("Error dropping database:", error);
  } finally {
    await mongoose.disconnect();
  }
}

dropDatabase();
