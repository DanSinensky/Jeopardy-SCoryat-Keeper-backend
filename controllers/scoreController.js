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

export const getScoreById = async (req, res) => {
  try {
    const { scoreId } = req.params;
    const score = await Score.findById(scoreId);
    if (!score) {
      return res.status(404).json({ error: 'Score not found' });
    }
    res.json(score);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getScoresByGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await Game.findById(gameId).populate('scores').exec();
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game.scores);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getScoresByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('scores').exec();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.scores);
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

    res.status(201).json({
      _id: score._id,
      dollars: score.dollars,
      createdAt: score.createdAt,
      updatedAt: score.updatedAt
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateScore = async (req, res) => {
  try {
    const { scoreId } = req.params;
    const { dollars } = req.body;

    const score = await Score.findByIdAndUpdate(
      scoreId, 
      { dollars }, 
      { new: true, runValidators: true }
    );

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