import User from '../models/User.js';
import Score from '../models/Score.js';

export const getScores = async (req, res) => {
  try {
    let getScores = await Score.find();
    res.json(getScores);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const createScore = async (req, res) => {
  try {
    const { dollars, game, username } = req.body;
    const score = new Score({
      dollars,
      game,
      username
    })
    await score.save()
    
  } catch {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
}