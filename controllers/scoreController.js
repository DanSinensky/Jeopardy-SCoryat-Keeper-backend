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
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const score = new Score({
      dollars,
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

export const updateScore = async (req, res) => {
  try {
    const { scoreId } = req.params;
    const { dollars, game } = req.body;

    const score = await Score.findById(scoreId);

    if (!score) {
      return res.status(404).json({ error: 'Score not found' });
    }

    if (dollars !== undefined) score.dollars = dollars;
    if (game) score.game = game;

    await score.save();

    res.status(200).json(score);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
};

export const deleteScore = async (req, res) => {
  try {
    const { scoreId } = req.params;

    const score = await Score.findByIdAndDelete(scoreId);

    if (!score) {
      return res.status(404).json({ error: 'Score not found' });
    }

    await User.findByIdAndUpdate(score.user, { $pull: { scores: scoreId } });

    res.status(200).json({ message: 'Score deleted successfully' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};