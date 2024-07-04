import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import AWS from 'aws-sdk';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

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
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: 'gameData.json',
    Body: gamesJsonData,
    ContentType: 'application/json'
  };

  s3.upload(params, (err, data) => {
    if (err) {
      throw new Error(`Failed to upload data to S3: ${err.message}`);
    }
    console.log(`Data uploaded to S3 successfully: ${data.Location}`);
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
