import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dayjs from "dayjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const previousDay = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

const apiGameByDateUrl = `https://jeopardy-scoryat-webscraper-464ba2509006.herokuapp.com/api/games/date/${previousDay}`;
const filePath = path.join(__dirname, "gameData.json");

async function fetchGameByDate() {
  try {
    const response = await axios.get(apiGameByDateUrl);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch data from API for date ${previousDay}: ${error.message}`);
  }
}

function appendGamesDataToJsonFile(newData) {
  const gameJsonData = JSON.stringify(newData, null, 2).slice(1, -1); // Remove the brackets

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        const jsonData = `[${gameJsonData}]`;
        fs.writeFile(filePath, jsonData, 'utf8', writeErr => {
          if (writeErr) throw new Error(`Failed to write data to JSON file: ${writeErr.message}`);
          console.log("Data written to gameData.json successfully");
        });
      } else {
        throw new Error(`Failed to read existing JSON file: ${err.message}`);
      }
    } else {
      let updatedData;
      if (data.trim().endsWith(']')) {
        updatedData = data.trim().slice(0, -1) + `,${gameJsonData}]`;
      } else {
        throw new Error('Invalid JSON format in existing file');
      }

      fs.writeFile(filePath, updatedData, 'utf8', writeErr => {
        if (writeErr) throw new Error(`Failed to write data to JSON file: ${writeErr.message}`);
        console.log("Data appended to gameData.json successfully");
      });
    }
  });
}

async function main() {
  try {
    const newGameData = await fetchGameByDate();
    appendGamesDataToJsonFile(newGameData);
  } catch (error) {
    console.error(error.message);
  }
}

main();