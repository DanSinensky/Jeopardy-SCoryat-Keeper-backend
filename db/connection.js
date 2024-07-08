import mongoose from "mongoose";
import chalk from "chalk";

const connectionString = process.env.MONGO_DB_URL || "mongodb://127.0.0.1:27017/Jeopardy-SCoryat-Keeper-backend";

mongoose.set("returnOriginal", false);

export const connectToDB = async () => {
  try {
    await mongoose.connect(connectionString, {});
    console.log(chalk.green("Connected to MongoDB"));
  } catch (err) {
    console.error(chalk.red("Error connecting to MongoDB:", err.message));
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.log(chalk.bold("Disconnected from MongoDB"));
  });

  mongoose.connection.on("error", (err) => {
    console.error(chalk.red(`Error with MongoDB: ${err.message}`));
  });
};

export const db = mongoose.connection;