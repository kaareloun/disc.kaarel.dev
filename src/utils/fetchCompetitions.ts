import {
  LAST_FETCH_FILE,
  DATA_FILE,
  TIMEZONE,
  FETCH_INTERVAL_IN_HOURS,
} from "~/constants";
import fs from "fs";
import { add, differenceInHours } from "date-fns";
import { parseData } from "./parseData";
import { TZDate } from "@date-fns/tz";

export async function fetchCompetitions() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, "{}");
    }

    if (!fs.existsSync(LAST_FETCH_FILE)) {
      fs.writeFileSync(LAST_FETCH_FILE, "2000-01-01T00:00:00.000Z");
    }

    const lastFetchDate = fs.readFileSync(LAST_FETCH_FILE, "utf-8").trim();

    if (
      lastFetchDate &&
      differenceInHours(new Date(), new Date(lastFetchDate)) <=
        FETCH_INTERVAL_IN_HOURS
    ) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      return parseData(data);
    }

    const today = new TZDate(new Date(), TIMEZONE);
    const data = [];

    for (let i = 0; i < 3; i++) {
      const startDate = add(today, { days: i * 10 })
        .toISOString()
        .split("T")[0];
      const endDate = add(today, { days: i * 10 + 10 })
        .toISOString()
        .split("T")[0];

      const params = new URLSearchParams({
        view: "3",
        date1: startDate,
        date2: endDate,
        sort_name: "date",
        sort_order: "desc",
        page: "all",
      });

      const chunkData = await fetch(
        `https://discgolfmetrix.com/competitions_map_server.php?${params}`,
      ).then((res) => res.json());

      if (Array.isArray(chunkData)) {
        data.push(...chunkData);
      }
    }

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
