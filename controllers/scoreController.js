import Score from '../models/Score.js';
import Game from '../models/Game.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

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
    const { id } = req.params;
    const score = await Score.findById(id);
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
    const scores = await Score.find({ gameId });
    if (!scores.length) {
      return res.status(404).json({ error: 'Scores not found' });
    }
    res.status(200).json(scores);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getScoresByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid User ID' });
    }

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

// export const createOrUpdateScore = async (req, res) => {
//   const { userId, gameId, dollars } = req.body;

//   try {
//     let existingScore = await Score.findOne({ userId, gameId });

//     if (existingScore) {
//       existingScore.dollars = dollars;
//       await existingScore.save();
//       await User.findByIdAndUpdate(userId, { $push: { scores: score._id } });
//       await Game.findByIdAndUpdate(gameId, { $push: { scores: score._id } });
//       return res.status(200).json({ message: 'Score updated successfully', score: existingScore });
//     } else {
//       const newScoreEntry = new Score({
//         userId,
//         gameId,
//         dollars: dollars
//       });

//       await newScoreEntry.save();
//       return res.status(201).json({ message: 'Score created successfully', score: newScoreEntry });
//     }
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };


export const createScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { dollars, user, game } = req.body;

    if (!dollars || !user || !game) {
      return res.status(400).json({ error: 'dollars, user, and game are required' });
    }

    const score = await Score.findByIdAndUpdate(
      id,
      { dollars, user, game },
      { new: true, runValidators: true } // Ensure validators run on update
    );

    if (!score) {
      return res.status(404).json({ error: 'Score not found' });
    }

    await score.save();

    await User.findByIdAndUpdate(user, { $push: { scores: score._id } });
    await Game.findByIdAndUpdate(game, { $push: { scores: score._id } });

    res.status(200).json(score);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateScore = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Invalid or missing score ID' });
    }
    
    const { dollars, user, game  } = req.body;
    if (!dollars || !user || !game) {
      return res.status(400).json({ error: 'dollars, user, and game are required' });
    }

    const score = await Score.findByIdAndUpdate(id, { dollars, user, game }, { new: true });
    if (!score) {
      return res.status(404).json({ error: 'Score not found' });
    }

    score.dollars = dollars;
    await score.save();

    await User.findByIdAndUpdate(user, { $addToSet: { scores: score._id } });
    await Game.findByIdAndUpdate(game, { $addToSet: { scores: score._id } });

    return res.status(200).json(score);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteScore = async (req, res) => {
  try {
    const { id } = req.params;

    const score = await Score.findByIdAndDelete(id);

    if (!score) {
      return res.status(404).json({ error: 'Score not found' });
    }

    await User.updateMany({ scores: id }, { $pull: { scores: scoreId } });
    await Game.updateMany({ scores: id }, { $pull: { scores: scoreId } });

    res.status(200).json({ message: 'Score deleted successfully' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};