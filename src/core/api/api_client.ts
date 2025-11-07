import axios, { type AxiosInstance } from "axios";
import { env } from "@/core/config/env/env.ts";
import {
  handleRequestInterceptor,
  handleResponseInterceptor,
  rejectResponseInterceptor,
} from "./api_interceptors.ts";

export class ApiClient {
  public static reqV1Json(): AxiosInstance {
    const client: AxiosInstance = axios.create({
      baseURL: env.VITE_API_URL,
      timeout: env.VITE_API_TIMEOUT ?? 60000,
      validateStatus: () => true,
    });

    client.interceptors.request.use(handleRequestInterceptor);
    client.interceptors.response.use(handleResponseInterceptor, rejectResponseInterceptor);

    return client;
  }
}
