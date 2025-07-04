import { createFileRoute } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { getLastUpdate } from "~/serverFunctions/getLastUpdate";
import { getCompetitions } from "~/serverFunctions/getCompetitions";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { getDistance } from "geolib";
import { getUserLocation } from "~/serverFunctions/getUserLocation";
import Cookies from "js-cookie";
import { LOCATION_COOKIE } from "~/constants";
import { Input } from "~/components/ui/input";
import { CompetitionWithDistance } from "~/types";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => {
    const [competitions, lastUpdate, userLocation] = await Promise.all([
      getCompetitions(),
      getLastUpdate(),
      getUserLocation(),
    ]);

    return {
      competitions,
      lastUpdate,
      userLocation,
    };
  },
});

function Home() {
  const {
    competitions,
    lastUpdate,
    userLocation: initialUserLocation,
  } = Route.useLoaderData();

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(initialUserLocation);

  useEffect(() => {
    if (typeof window !== "undefined") {
      navigator.geolocation.getCurrentPosition((position) => {
        const newPos = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };

        setUserLocation(newPos);
        Cookies.set(LOCATION_COOKIE, JSON.stringify(newPos));
      });
    }
  }, []);

  const [filters, setFilters] = useState({
    search: "",
  });

  const filterCompetitions = (filters: { search: string }) => {
    const lowerCaseValue = filters.search.toLowerCase();

    const filtered: CompetitionWithDistance[] = competitions
      .map((competition) => {
        const distance = userLocation
          ? getDistance(
              {
                latitude: userLocation.lat,
                longitude: userLocation.lon,
              },
              { latitude: competition.lat, longitude: competition.lon },
            )
          : 0;

        return {
          ...competition,
          distance,
        };
      })
      .filter((competition) => {
        if (
          filters.search &&
          !competition.name.toLowerCase().includes(lowerCaseValue) &&
          !competition.courseName.toLowerCase().includes(lowerCaseValue) &&
          !competition.description.toLowerCase().includes(lowerCaseValue)
        ) {
          return false;
        }

        return competition.distance <= 50000; // 50km
      });

    return filtered;
  };

  const [filteredCompetitions, setFilteredCompetitions] = useState<
    CompetitionWithDistance[]
  >(filterCompetitions({ search: "" }));

  const updateFilters = (filters: { search: string }) => {
    setFilters(filters);
    setFilteredCompetitions(filterCompetitions(filters));
  };

  return (
    <div className="p-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-background">
        <div className="flex flex-col p-2 gap-2">
          <h1 className="sm:text-3xl text-2xl font-bold">
            Disc golf competitions near you
          </h1>
          <span className="text-xs font-bold tracking-widest">
            Last update {lastUpdate}
          </span>
        </div>
        <div className="flex flex-col p-2 gap-2 w-full sm:w-auto">
          <Input
            className="w-full max-w-md"
            placeholder="Filter"
            onChange={(e) =>
              updateFilters({ ...filters, search: e.target.value })
            }
          />
        </div>
      </div>
      <Table className="border-separate border-spacing-y-0 relative">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Starts</TableHead>
            <TableHead>Distance</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCompetitions.map((competition, i) => (
            <TableRow key={i}>
              <TableCell>
                <span dangerouslySetInnerHTML={{ __html: competition.name }} />
              </TableCell>
              <TableCell>
                <span
                  dangerouslySetInnerHTML={{ __html: competition.courseName }}
                />
              </TableCell>
              <TableCell>
                {format(competition.startsAt, "yyyy-MM-dd HH:mm")}
              </TableCell>
              <TableCell>
                {userLocation
                  ? `${(competition.distance / 1000).toFixed(0)} km`
                  : "Unknown"}
              </TableCell>
              <TableCell>
                <span
                  dangerouslySetInnerHTML={{
                    __html: competition.description,
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
