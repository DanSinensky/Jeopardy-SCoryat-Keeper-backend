import mongoose from "mongoose";
import chalk from "chalk";

const connectionString =
  process.env.MONGO_DB_URL || "mongodb://127.0.0.1:27017/cocktail-backend-api";
mongoose.set("returnOriginal", false);

mongoose.connect(connectionString).catch((err) => {
  console.log(chalk.red("Error connecting to MongoDB: ", err.message));
});

mongoose.connection.on("disconnected", () => {
  console.log(chalk.bold("disconnected from MongoDB"));
});

mongoose.connection.on("error", () => {
  console.log(chalk.red(`Error with mongoDb `));
});

export default mongoose.connection;
