import mongoose from "mongoose";
const { Schema } = mongoose;

const ScoreSchema = new Schema({
  dollars: { type: Number, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true }
}, { timestamps: true });

export default mongoose.model("Score", ScoreSchema);