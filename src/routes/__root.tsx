/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import * as React from "react";
import { MotionConfig } from "motion/react";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import { ThemeProvider, useTheme } from "~/components/ui/theme-provider";
import { getTheme } from "~/serverFunctions/theme";
import appCss from "~/styles/app.css?url";

const HOST = "https://disc.kaarel.dev";
const DESCRIPTION =
  "Weekly rounds and tournaments near you, from Disc Golf Metrix.";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { title: "Disc golf near you | disc.kaarel.dev" },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "disc.kaarel.dev" },
      { property: "og:url", content: HOST },
      { property: "og:title", content: "Disc golf near you" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: `${HOST}/og-image.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Disc golf near you" },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: `${HOST}/og-image.png` },
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,300..900&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  beforeLoad: async () => {
    const theme = await getTheme();

    return { theme };
  },
  headers: () => ({
    "Accept-CH": "Sec-CH-Prefers-Color-Scheme",
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  const { theme } = Route.useRouteContext();

  return (
    <ThemeProvider defaultTheme={theme}>
      <RootDocument>
        <MotionConfig reducedMotion="user">
          <Outlet />
        </MotionConfig>
      </RootDocument>
    </ThemeProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <html className={theme} lang="en">
      <head>
        <HeadContent />
        <meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#111113" media="(prefers-color-scheme: dark)" />
      </head>
      <body className="min-h-screen overflow-y-scroll">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
