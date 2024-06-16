import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiGamesUrl = "https://jeopardy-scoryat-webscraper-464ba2509006.herokuapp.com/api/games";
const pageSize = 100; 

async function fetchGamesDataFromApi(page) {
  try {
    const response = await axios.get(apiGamesUrl, {
      params: {
        page: page,
        size: pageSize
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch data from API on page ${page}: ${error.message}`);
  }
}

function filterGamesData(data) {
  return data.filter(game => game.hasOwnProperty('game_date') && !game.hasOwnProperty('error'));
}

function writeGamesDataToJsonFile(data) {
  const gamesJsonData = JSON.stringify(data, null, 2);

  const filePath = path.join(__dirname, "gameData.json");

  fs.writeFile(filePath, gamesJsonData, (err) => {
    if (err) {
      throw new Error(`Failed to write data to JSON file: ${err.message}`);
    }
    console.log("Data written to gameData.json successfully");
  });
}

async function main() {
  let allGamesData = [];
  let page = 1;
  let totalPages;

  try {
    do {
      const response = await fetchGamesDataFromApi(page);
      totalPages = response.total_pages;
      console.log(`Fetching page ${page} of ${totalPages}`);
      const filteredGames = filterGamesData(response.games);
      allGamesData = allGamesData.concat(filteredGames);
      page++;
    } while (page <= totalPages);

    writeGamesDataToJsonFile(allGamesData);
  } catch (error) {
    console.error(error.message);
  }
}

main();
