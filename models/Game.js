import mongoose from "mongoose";
const { Schema } = mongoose;

const GameSchema = new Schema({
  game_title: { type: String, required: true },
  game_id: { type: Number, required: true },
  game_date: { type: Date, required: true },
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  scores: [{ type: Schema.Types.ObjectId, ref: 'Score' }],
  game_comments: { type: String },
  categories: [{ type: String, required: true }],
  category_comments: [{ type: String }],
  jeopardy_round: {
    clues: [{ type: String, required: true }],
    responses: [{ type: String, required: true }],
    cells: [{ type: String, required: true }]
  },
  double_jeopardy_round: {
    clues: [{ type: String, required: true }],
    responses: [{ type: String, required: true }],
    cells: [{ type: String, required: true }]
  },
  final_jeopardy: {
    clue: { type: String, required: true },
    response: { type: String, required: true }
  }
}, { timestamps: true });

export default mongoose.model("Game", GameSchema);