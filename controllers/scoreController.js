import Score from '../models/Score.js';
import Game from '../models/Game.js';
import User from '../models/User.js';

export const getScores = async (req, res) => {
  try {
    const scores = await Score.find();
    res.json(scores);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const createScore = async (req, res) => {
  try {
    const { dollars, userId, gameId } = req.body;

    const score = new Score({
      dollars
    });

    await score.save();

    await User.findByIdAndUpdate(userId, { $push: { scores: score._id } });
    await Game.findByIdAndUpdate(gameId, { $push: { scores: score._id } });

    res.status(201).json(score);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
};

export const updateScore = async (req, res) => {
  try {
    const { scoreId } = req.params;
    const { dollars } = req.body;

    const score = await Score.findByIdAndUpdate(scoreId, { dollars }, { new: true });

    if (!score) {
      return res.status(404).json({ error: 'Score not found' });
    }

    res.status(200).json(score);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteScore = async (req, res) => {
  try {
    const { scoreId } = req.params;

    const score = await Score.findByIdAndDelete(scoreId);

    if (!score) {
      return res.status(404).json({ error: 'Score not found' });
    }

    await User.updateMany({ scores: scoreId }, { $pull: { scores: scoreId } });
    await Game.updateMany({ scores: scoreId }, { $pull: { scores: scoreId } });

    res.status(200).json({ message: 'Score deleted successfully' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};
