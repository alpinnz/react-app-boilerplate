import type { RelativeRoutingType } from "react-router-dom";

export interface NavigateOptions {
  replace?: boolean;
  state?: unknown;
  preventScrollReset?: boolean;
  relative?: RelativeRoutingType;
  flushSync?: boolean;
  viewTransition?: boolean;
}

export type NavigateFn = (to: string, options?: NavigateOptions) => void;

let _navigate: NavigateFn = () => {};

export const NavigateEffect = {
  set(navigate: NavigateFn) {
    _navigate = navigate;
  },
  navigate: (...args: Parameters<NavigateFn>) => _navigate(...args),
};
