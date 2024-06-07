import mongoose from "mongoose";
const { Schema } = mongoose;

const GameSchema = new Schema({
  title: { type: String, required: true },
  scrapedID: {type: Number, required: true},
  date: { type: Date, required: true },
  scores: [{ type: Schema.Types.ObjectId, ref: 'Score' }],
  game_comments: { type: String },
  categories: [{ type: String }],
  category_comments: [{ type: String }],
  jeopardy_round: 
}, { timestamps: true });

export default mongoose.model("Game", GameSchema);
