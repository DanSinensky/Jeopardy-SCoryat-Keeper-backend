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
    const { value, game, username } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const score = new Score({
      value,
      game,
      user: user._id
    });

    await score.save();

    user.scores.push(score._id);
    await user.save();

    res.status(201).json(score);

  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
};