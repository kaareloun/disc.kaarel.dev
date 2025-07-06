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
import { LOCATION_COOKIE, SEARCH_RADIUS } from "~/constants";
import { Input } from "~/components/ui/input";
import type { CompetitionWithDistance, Filters } from "~/types";
import { Alert, AlertDescription } from "~/components/ui/alert";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => {
    const [competitions, userLocation] = await Promise.all([
      getCompetitions(),
      getUserLocation(),
    ]);

    const lastUpdate = await getLastUpdate();

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

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };

          Cookies.set(LOCATION_COOKIE, JSON.stringify(newPos));
          updateFilters({
            ...filters,
            location: newPos,
          });
          setNotification(null);
        },
        () =>
          setNotification(
            filters.location
              ? "Couldn't refresh your location, using the last saved one."
              : "Couldn't get your location. Showing all available competitions for now.",
          ),
      );
    }
  }, []);

  const [filters, setFilters] = useState<Filters>({
    search: "",
    location: initialUserLocation,
  });

  const filterCompetitions = (filters: Filters) => {
    const lowerCaseValue = filters.search.toLowerCase();

    const filtered: CompetitionWithDistance[] = competitions
      .map((competition) => {
        const distance = filters.location
          ? getDistance(
              {
                latitude: filters.location.lat,
                longitude: filters.location.lon,
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
          !competition.layoutName?.toLowerCase().includes(lowerCaseValue) &&
          !competition.description.toLowerCase().includes(lowerCaseValue)
        ) {
          return false;
        }

        return competition.distance <= SEARCH_RADIUS;
      });

    return filtered;
  };

  const [filteredCompetitions, setFilteredCompetitions] = useState<
    CompetitionWithDistance[]
  >(filterCompetitions(filters));

  const updateFilters = (filters: Filters) => {
    setFilters(filters);
    setFilteredCompetitions(filterCompetitions(filters));
  };

  return (
    <>
      {notification && (
        <Alert variant="info">
          <AlertDescription>{notification}</AlertDescription>
        </Alert>
      )}
      <div className="p-2 flex flex-col h-screen">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-background">
          <div className="flex flex-col p-2 gap-2">
            <h1 className="sm:text-3xl text-2xl font-bold">
              Nearby Disc golf competitions
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
        <div className="flex-1">
          <Table className="border-separate border-spacing-y-0 relative">
            <TableHeader>
              <TableRow>
                <TableHead>Start</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompetitions.map((competition, i) => (
                <TableRow key={i}>
                  <TableCell>
                    {format(competition.startsAt, "yyyy-MM-dd HH:mm")}
                  </TableCell>

                  <TableCell>
                    <a
                      className="font-bold hover:underline"
                      href={`https://discgolfmetrix.com/${competition.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: competition.name }}
                      />
                    </a>
                  </TableCell>
                  <TableCell>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: competition.courseName,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {filters.location
                      ? `${(competition.distance / 1000).toFixed(0)} km`
                      : "Unknown"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
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
      </div>
    </>
  );
}
