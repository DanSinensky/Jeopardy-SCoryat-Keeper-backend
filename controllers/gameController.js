import Game from '../models/Game.js';
import Score from '../models/Score.js';

export const getGames = async (req, res) => {
  try {
    const games = await Game.find().populate('scores').exec();
    res.json(games);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const createGame = async (req, res) => {
  try {
    const { name, scrapedID, date, scores } = req.body;

    const game = new Game({
      name,
      scrapedID,
      date,
      scores
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
    const { name, scrapedID, date, scores } = req.body;

    const updatedFields = { name, scrapedID, date, scores };

    const game = await Game.findByIdAndUpdate(gameId, updatedFields, { new: true });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.status(200).json(game);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteGame = async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await Game.findByIdAndDelete(gameId);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    await Score.deleteMany({ _id: { $in: game.scores } });

    res.status(200).json({ message: 'Game and associated scores deleted successfully' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};
