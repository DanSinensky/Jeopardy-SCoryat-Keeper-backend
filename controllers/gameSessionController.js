import GameSession from '../models/GameSession.js';
import Game from '../models/Game.js';
import Score from '../models/Score.js';
import User from '../models/User.js';

export const createGameSession = async (req, res) => {
  const { gameId, userId } = req.body;
  
  try {
      const game = await Game.findById(gameId);
      if (!game) return res.status(404).json({ message: 'Game not found' });

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const gameSession = new GameSession({ gameId, userId });
      await gameSession.save();

      return res.status(201).json({ message: 'Game session created', gameSession });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error', error });
  }
};

export const getGameSession = async (req, res) => {
  const { sessionId } = req.params;

  try {
      const gameSession = await GameSession.findById(sessionId)
          .populate('gameId', 'title')
          .populate('userId', 'username');

      if (!gameSession) {
          return res.status(404).json({ message: 'Game session not found' });
      }

      return res.status(200).json(gameSession);
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error', error });
  }
};

export const updateGameSession = async (req, res) => {
  const { sessionId } = req.params;
  const { score } = req.body;

  try {
      const gameSession = await GameSession.findById(sessionId);
      
      if (!gameSession) {
          return res.status(404).json({ message: 'Game session not found' });
      }

      if (score !== undefined) gameSession.score = score;
      
      gameSession.updatedAt = Date.now();
      await gameSession.save();

      return res.status(200).json({ message: 'Game session updated', gameSession });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteGameSession = async (req, res) => {
  const { sessionId } = req.params;

  try {
      const gameSession = await GameSession.findByIdAndDelete(sessionId);
      
      if (!gameSession) {
          return res.status(404).json({ message: 'Game session not found' });
      }

      return res.status(200).json({ message: 'Game session deleted' });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error', error });
  }
};

export const getUserGameSessions = async (req, res) => {
  const { userId } = req.params;

  try {
      const gameSessions = await GameSession.find({ userId })
          .populate('gameId', 'title')
          .sort({ createdAt: -1 });

      return res.status(200).json(gameSessions);
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error', error });
  }
};