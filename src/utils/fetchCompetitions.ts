import { LAST_FETCH_FILE, DATA_FILE } from "~/constants";
import fs from "fs";
import { add, differenceInHours } from "date-fns";
import { parseData } from "./parseData";

export async function fetchCompetitions() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "{}");
  }

  if (!fs.existsSync(LAST_FETCH_FILE)) {
    fs.writeFileSync(LAST_FETCH_FILE, "2000-01-01T00:00:00.000Z");
  }

  const lastFetchDate = fs.readFileSync(LAST_FETCH_FILE, "utf-8").trim();

  if (
    lastFetchDate &&
    differenceInHours(new Date(), new Date(lastFetchDate)) <= 1
  ) {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    return parseData(data);
  }

  const today = new Date().toISOString().split("T")[0];
  const in30Days = add(new Date(), { days: 30 }).toISOString().split("T")[0];

  try {
    const data = await fetch(
      `https://discgolfmetrix.com/competitions_map_server.php?view=3&date1=${today}&date2=${in30Days}&view=3&sort_name=date&sort_order=desc&page=all`,
    ).then((res) => res.json());

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    fs.writeFileSync(LAST_FETCH_FILE, new Date().toISOString());

    return parseData(data);
  } catch (error) {
    try {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      return parseData(data);
    } catch (error) {
      //
    }

    console.error("Error fetching or parsing data:", error);
    return [];
  }
}
