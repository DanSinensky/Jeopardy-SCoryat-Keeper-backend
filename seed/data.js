import mongoose from "mongoose";
import { connectToDB } from "../db/connection.js";
import GameSchema from "../models/Game.js";
import ScoreSchema from "../models/Score.js";
import UserSchema from "../models/User.js";
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

    const gameData = await fetchGameDataFromS3();

    const existingGames = await GameSchema.find().populate('scores').exec();
    const existingUsers = await UserSchema.find().populate('scores').exec();
    const existingScores = [];

    existingGames.forEach(game => {
      game.scores.forEach(score => {
        existingScores.push({
          game_id: game.game_id,
          score_id: score._id,
          dollars: score.dollars
        });
      });
    });

    const userScores = {};
    existingUsers.forEach(user => {
      userScores[user._id] = (user.scores || []).map(score => ({
        score_id: score._id,
        dollars: score.dollars
      }));
    });

    for (const game of gameData) {
      let existingGame = await GameSchema.findOne({ game_id: game.game_id }).exec();
      if (existingGame) {
        let updated = false;

        if (!_.isEqual(existingGame.categories, game.categories)) {
          existingGame.categories = game.categories;
          updated = true;
        }
        if (!_.isEqual(existingGame.category_comments, game.category_comments)) {
          existingGame.category_comments = game.category_comments;
          updated = true;
        }
        if (!_.isEqual(existingGame.jeopardy_round, game.jeopardy_round)) {
          existingGame.jeopardy_round = game.jeopardy_round;
          updated = true;
        }
        if (!_.isEqual(existingGame.double_jeopardy_round, game.double_jeopardy_round)) {
          existingGame.double_jeopardy_round = game.double_jeopardy_round;
          updated = true;
        }
        if (!_.isEqual(existingGame.final_jeopardy, game.final_jeopardy)) {
          existingGame.final_jeopardy = game.final_jeopardy;
          updated = true;
        }

        for (const score of game.scores || []) {
          let existingScore = existingGame.scores.find(s => s._id.equals(score._id));
          if (existingScore) {
            existingScore.dollars = score.dollars;
            await existingScore.save();
          } else {
            const newScore = await ScoreSchema.create({ dollars: score.dollars });
            existingGame.scores.push(newScore._id);
            updated = true;
          }
        }

        if (updated) {
          await existingGame.save();
          console.log(`Game with ID ${game.game_id} updated.`);
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

    for (const [userId, scores] of Object.entries(userScores)) {
      const user = await UserSchema.findById(userId);
      if (user) {
        user.scores = [];
        for (const score of scores || []) {
          const scoreDoc = await ScoreSchema.findById(score.score_id);
          if (scoreDoc) {
            scoreDoc.dollars = score.dollars;
            await scoreDoc.save();
            user.scores.push(scoreDoc._id);
          }
        }
        await user.save();
        console.log(`User with ID ${userId} updated.`);
      }
    }

    console.log("Games and users seeded to database");

  } catch (error) {
    console.error("Error seeding data: ", error);
  } finally {
    mongoose.connection.close(() => {
      console.log('MongoDB connection closed');
    });
  }
};

seedData();