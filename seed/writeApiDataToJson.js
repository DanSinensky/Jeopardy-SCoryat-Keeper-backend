import axios from "axios";
import fs from "fs";

const apiGamesUrl = "https://jeopardy-scoryat-webscraper-464ba2509006.herokuapp.com/api/games";

async function fetchGamesDataFromApi() {
  try {
    const response = await axios.get(apiGamesUrl);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch data from API", error.message);
  }
}

function writeGamesDataToJsonFile(data) {
  const gamesJsonData = JSON.stringify(data, null, 2);

  fs.writeFile("a.json", gamesJsonData, (err) => {
    if (err) {
      throw new Error("Failed to write data to JSON file:", err.message);
    }
    console.log("Data written to charData.json successfully");
  });
}

async function main() {
  try {
    const data = await fetchGamesDataFromApi();
    writeGamesDataToJsonFile(data)
  } catch (error) {
    console.log(error)
  }
}

main()