import mongoose from "mongoose";
const { Schema } = mongoose;

const ScoreSchema = new Schema(
  {
    dollars: { type: Number, required: true },
    game: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true}
  },
  { timestamps: true }
)

export default mongoose.model("scores", ScoreSchema);