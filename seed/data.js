import db from "../db/connection.js";
import GameSchema from "../models/Game.js";
import gameData from "./gameData.json" assert {type: "json"};

let newGameData = gameData.map((game) => {
  const gameData = {
    game_title: game.game_title,
    game_id: game.game_id,
    game_date: game.game_date,
    scores: game.scores,
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

  return gameData;
});

const seedData = async () => {
  await db.dropDatabase();
  await GameSchema.create(newGameData);
  console.log("Games seeded to  Database");
  await db.close();
};

seedData();