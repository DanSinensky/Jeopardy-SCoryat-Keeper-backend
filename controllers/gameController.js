import Game from '../models/Game.js';
import Score from '../models/Score.js';

export const getGames = async (req, res) => {
  try {
    const games = await Game.find().populate('scores');
    res.json(games);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const createGame = async (req, res) => {
  try {
    const { name, date } = req.body;

    const game = new Game({
      name,
      date,
      scores: []
    });

    await game.save();

    res.status(201).json(game);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
};

export const updateGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { name, date } = req.body;

    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (name) game.name = name;
    if (date) game.date = date;

    await game.save();

    res.status(200).json(game);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
};

export const deleteGame = async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await Game.findByIdAndDelete(gameId);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    await Score.deleteMany({ game: game._id });

    res.status(200).json({ message: 'Game and associated scores deleted successfully' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};
