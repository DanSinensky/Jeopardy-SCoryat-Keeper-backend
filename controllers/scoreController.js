import User from '../models/User.js';
import Game from '../models/Game.js';
import Score from '../models/Score.js';

export const getScores = async (req, res) => {
  try {
    const scores = await Score.find().populate('user game');
    res.json(scores);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const createScore = async (req, res) => {
  try {
    const { dollars, userId, gameId } = req.body;
    const user = await User.findById(userId);
    const game = await Game.findById(gameId);

    if (!user || !game) {
      return res.status(404).json({ error: 'User or Game not found' });
    }

    const score = new Score({
      dollars,
      user: user._id,
      game: game._id
    });

    await score.save();

    game.scores.push(score._id);
    await game.save();

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

    const score = await Score.findById(scoreId);

    if (!score) {
      return res.status(404).json({ error: 'Score not found' });
    }

    if (dollars !== undefined) score.dollars = dollars;

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

    await Game.findByIdAndUpdate(score.game, { $pull: { scores: scoreId } });
    await User.findByIdAndUpdate(score.user, { $pull: { scores: scoreId } });

    res.status(200).json({ message: 'Score deleted successfully' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};
