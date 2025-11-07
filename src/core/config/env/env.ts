type Env = {
  VITE_APP_NAME: string;
  VITE_APP_VERSION: string;
  VITE_ENVIRONMENT: "development" | "staging" | "production";

  VITE_API_URL: string;
  VITE_API_KEY: string;
  VITE_API_TIMEOUT: number;
};

export const env: Env = {
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,
  VITE_ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT as "development" | "staging" | "production",

  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_API_KEY: import.meta.env.VITE_API_KEY,
  VITE_API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT || 10000),
};
