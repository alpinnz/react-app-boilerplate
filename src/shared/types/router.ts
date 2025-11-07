import * as React from "react";
import type { RouteObject } from "react-router-dom";

export type Handle = {
  title?: string;
  ns?: string;
};

export interface IndexAppRoute {
  index: true;
  element: React.ReactNode;
  handle?: Handle;
  path?: never;
  children?: never;
}

export interface PathAppRoute {
  path: string;
  element: React.ReactNode;
  handle?: Handle;
  index?: false;
  children?: AppRoute[];
}

export type AppRoute = IndexAppRoute | PathAppRoute;

export function toRouteObjects(routes: AppRoute[]): RouteObject[] {
  return routes.map((route) => {
    if ("children" in route && route.children) {
      return {
        ...route,
        children: toRouteObjects(route.children),
      };
    }
    return route;
  });
}
