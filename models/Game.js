import mongoose from "mongoose";
const { Schema } = mongoose;

const GameSchema = new Schema({
  name: { type: String, required: true },
  scrapedID: {type: Number, required: true},
  date: { type: Date, required: true },
  scores: [{ type: Schema.Types.ObjectId, ref: 'Score' }]
}, { timestamps: true });

export default mongoose.model("Game", GameSchema);
