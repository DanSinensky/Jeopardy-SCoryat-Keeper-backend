import db from "../db/connection.js";
import GameSchema from "../models/Game.js";
import ScoreSchema from "../models/Score.js";
import fs from "fs";

const gameData = JSON.parse(fs.readFileSync("./seed/gameData.json", "utf8"));

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
      clues: game.jeopardy_round.clues,
      responses: game.jeopardy_round.responses,
      cells: game.jeopardy_round.cells
    },
    double_jeopardy_round: {
      clues: game.double_jeopardy_round.clues,
      responses: game.double_jeopardy_round.responses,
      cells: game.double_jeopardy_round.cells
    },
    final_jeopardy: {
      clue: game.final_jeopardy.clue,
      response: game.final_jeopardy.response
    }
  };
});

const seedData = async () => {
  await db.dropDatabase();
  await GameSchema.create(newGameData);
  console.log("Games seeded to database");
  await db.close();
};

seedData();
