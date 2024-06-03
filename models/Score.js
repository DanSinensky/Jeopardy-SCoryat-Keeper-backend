import mongoose from "mongoose";
const { Schema } = mongoose;

const ScoreSchema = new Schema({
  dollars: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model("Score", ScoreSchema);
