import { ApiError, BaseError, ClientError, DatabaseError } from "@/core/errors/errors.ts";

export function handleError(err: unknown) {
  if (err instanceof ApiError) {
    console.error("API error occurred:", err.message);
    return err;
  } else if (err instanceof BaseError) {
    console.error("Base error occurred:", err.message);
    return err;
  } else if (err instanceof DatabaseError) {
    console.error("Database error occurred:", err.message);
    return err;
  } else if (err instanceof ClientError) {
    console.error("Client error occurred:", err.message);
    return err;
  } else if (err instanceof Error) {
    console.error("An error occurred:", err.message);
    return err;
  } else {
    console.error("An unknown error occurred");
    return Error(String(err));
  }
}
