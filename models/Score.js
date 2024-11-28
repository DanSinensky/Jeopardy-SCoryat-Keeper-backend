import mongoose from "mongoose";
const { Schema } = mongoose;

const ScoreSchema = new Schema({
  dollars: { type: Number, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  game: { type: Schema.Types.ObjectId, ref: 'Game', required: true }
}, { timestamps: true });

export default mongoose.model("Score", ScoreSchema);