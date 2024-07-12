import mongoose from "mongoose";
import { connectToDB } from "../db/connection.js";
import GameSchema from "../models/Game.js";
import ScoreSchema from "../models/Score.js";
import AWS from 'aws-sdk';
import _ from "lodash";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const bucketName = process.env.S3_BUCKET_NAME;
const fileName = 'gameData.json';

async function fetchGameDataFromS3() {
  const params = {
    Bucket: bucketName,
    Key: fileName,
  };

  try {
    console.log('Fetching game data from S3');
    const data = await s3.getObject(params).promise();
    return JSON.parse(data.Body.toString('utf-8'));
  } catch (error) {
    throw new Error(`Failed to fetch data from S3: ${error.message}`);
  }
}

const seedData = async () => {
  try {
    await connectToDB();
    console.log('Connected to MongoDB');

    const gameData = await fetchGameDataFromS3();
    console.log('Game data fetched from S3');

    for (const game of gameData) {
      let existingGame = await GameSchema.findOne({ game_id: game.game_id }).exec();
      if (existingGame) {
        let updated = false;

        const fieldsToCompare = [
          'categories',
          'category_comments',
          'jeopardy_round',
          'double_jeopardy_round',
          'final_jeopardy'
        ];

        for (const field of fieldsToCompare) {
          if (!_.isEqual(JSON.stringify(existingGame[field], null, 2), JSON.stringify(game[field], null, 2))) {
            console.log(`Field ${field} is different.`);
            existingGame[field] = game[field];
            updated = true;
          }
        }

        for (const score of game.scores || []) {
          let existingScore = existingGame.scores.find(s => s.equals(score._id));
          if (existingScore) {
            if (existingScore.dollars !== score.dollars) {
              existingScore.dollars = score.dollars;
              await existingScore.save();
              updated = true;
            }
          } else {
            const newScore = await ScoreSchema.create({ dollars: score.dollars });
            existingGame.scores.push(newScore._id);
            updated = true;
          }
        }

        if (updated) {
          await existingGame.save();
          //console.log(`Game with ID ${game.game_id} updated.`);
        }
      } else {
        const newScores = await ScoreSchema.insertMany((game.scores || []).map(score => ({ dollars: score.dollars })));
        const newGame = new GameSchema({
          ...game,
          scores: newScores.map(score => score._id)
        });
        await newGame.save();
        console.log(`Game with ID ${game.game_id} created.`);
      }
    }

    console.log("Games seeded to database");

  } catch (error) {
    console.error("Error seeding data: ", error);
  } finally {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    } catch (closeError) {
      console.error('Error closing MongoDB connection:', closeError);
    }
  }
};

seedData();