import mongoose from "mongoose";
const { Schema } = mongoose;

const ScoreSchema = new Schema({
  dollars: { type: Number },
  userId: { type: String, required: true },
  gameId: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model("Score", ScoreSchema);