import db from "../db/connection.js";
import GameSchema from "../models/Game.js";
import ScoreSchema from "../models/Score.js";
import UserSchema from "../models/User.js";
import fs from "fs";
import _ from "lodash";

const gameData = JSON.parse(fs.readFileSync("./seed/gameData.json", "utf8"));

const seedData = async () => {
  try {
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
      userScores[user._id] = user.scores.map(score => ({
        score_id: score._id,
        dollars: score.dollars
      }));
    });

    for (const game of gameData) {
      let existingGame = await GameSchema.findOne({ game_id: game.game_id }).exec();
      if (existingGame) {
        if (!_.isEqual(existingGame.categories, game.categories)) {
          existingGame.categories = game.categories;
        }
        if (!_.isEqual(existingGame.category_comments, game.category_comments)) {
          existingGame.category_comments = game.category_comments;
        }
        if (!_.isEqual(existingGame.jeopardy_round, game.jeopardy_round)) {
          existingGame.jeopardy_round = game.jeopardy_round;
        }
        if (!_.isEqual(existingGame.double_jeopardy_round, game.double_jeopardy_round)) {
          existingGame.double_jeopardy_round = game.double_jeopardy_round;
        }
        if (!_.isEqual(existingGame.final_jeopardy, game.final_jeopardy)) {
          existingGame.final_jeopardy = game.final_jeopardy;
        }

        for (const score of game.scores) {
          let existingScore = existingGame.scores.find(s => s._id.equals(score._id));
          if (existingScore) {
            existingScore.dollars = score.dollars;
            await existingScore.save();
          } else {
            const newScore = await ScoreSchema.create({ dollars: score.dollars });
            existingGame.scores.push(newScore._id);
          }
        }

        await existingGame.save();
      } else {
        const newScores = await ScoreSchema.insertMany(game.scores.map(score => ({ dollars: score.dollars })));
        const newGame = new GameSchema({
          ...game,
          scores: newScores.map(score => score._id)
        });
        await newGame.save();
      }
    }

    for (const [userId, scores] of Object.entries(userScores)) {
      const user = await UserSchema.findById(userId);
      if (user) {
        user.scores = [];
        for (const score of scores) {
          const scoreDoc = await ScoreSchema.findById(score.score_id);
          if (scoreDoc) {
            scoreDoc.dollars = score.dollars;
            await scoreDoc.save();
            user.scores.push(scoreDoc._id);
          }
        }
        await user.save();
      }
    }

    console.log("Games and users seeded to database");

  } catch (error) {
    console.error("Error seeding data: ", error);
  } finally {
    await db.close();
  }
};

seedData();