import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { LOCATION_COOKIE } from "~/constants";

export const getUserLocation = createServerFn().handler(async () => {
  const cookieValue = getCookie(LOCATION_COOKIE);

  if (cookieValue) {
    return JSON.parse(cookieValue);
  }

  return null;
});
