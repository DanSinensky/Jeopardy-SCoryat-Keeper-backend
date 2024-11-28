import mongoose from "mongoose";
const { Schema } = mongoose;

const GameSessionSchema = new Schema({
  game: { type: Schema.Types.ObjectId, ref: 'Game' },
  players: [{ 
    player: { type: Schema.Types.ObjectId, ref: 'User' },
    gameCompleted: { type: Boolean, default: false }
  }],
  scores: [{ type: Schema.Types.ObjectId, ref: 'Score' }]
})
  
export default mongoose.model("GameSession", GameSessionSchema);