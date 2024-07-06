import mongoose from "mongoose";
import chalk from "chalk";

const connectionString = process.env.MONGO_DB_URL || "mongodb://127.0.0.1:27017/Jeopardy-SCoryat-Keeper-backend";

mongoose.set("returnOriginal", false);

const connectToDB = async () => {
  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
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

const db = mongoose.connection;

export { connectToDB, db };