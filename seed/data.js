import db from "../db/connection.js";
import GameSchema from "../models/Game.js";
import ScoreSchema from "../models/Score.js";
import UserSchema from "../models/User.js";
import fs from "fs";

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

    await db.dropDatabase();

    const scorePromises = gameData.map(game => {
      const scoreDocs = game.scores ? game.scores.map(score => ({ dollars: score.dollars })) : [];
      return ScoreSchema.insertMany(scoreDocs);
    });

    const allScores = await Promise.all(scorePromises);

    const newGameData = gameData.map((game, index) => {
      const gameScores = allScores[index].map(scoreDoc => scoreDoc._id);

      return {
        game_title: game.game_title,
        game_id: game.game_id,
        game_date: game.game_date,
        scores: gameScores,
        game_comments: game.game_comments,
        categories: game.categories,
        category_comments: game.category_comments,
        jeopardy_round: {
          clues: game.jeopardy_round?.clues || [],
          responses: game.jeopardy_round?.responses || [],
          cells: game.jeopardy_round?.cells || []
        },
        double_jeopardy_round: {
          clues: game.double_jeopardy_round?.clues || [],
          responses: game.double_jeopardy_round?.responses || [],
          cells: game.double_jeopardy_round?.cells || []
        },
        final_jeopardy: {
          clue: game.final_jeopardy?.clue || "",
          response: game.final_jeopardy?.response || ""
        }
      };
    });

    const newGames = await GameSchema.create(newGameData);

    for (const newGame of newGames) {
      const gameScores = existingScores.filter(score => score.game_id === newGame.game_id);
      for (const gameScore of gameScores) {
        const scoreDoc = await ScoreSchema.findById(gameScore.score_id);
        if (scoreDoc) {
          scoreDoc.dollars = gameScore.dollars;
          await scoreDoc.save();
          newGame.scores.push(scoreDoc._id);
        }
      }
      await newGame.save();
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