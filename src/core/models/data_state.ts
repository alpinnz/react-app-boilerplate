type StatusType = "initial" | "loading" | "failure" | "success" | "loadingMore" | "empty";

export class DataState<T> {
  status: StatusType;
  data: T | null;
  error?: string;

  private constructor(status: StatusType, data: T | null = null, error?: string) {
    this.status = status;
    this.data = data;
    this.error = error;
  }

  // Factory methods
  static initial<T>(): DataState<T> {
    return new DataState("initial");
  }

  static loading<T>(prevData: T | null = null): DataState<T> {
    return new DataState("loading", prevData);
  }

  static loadingMore<T>(prevData: T): DataState<T> {
    return new DataState("loadingMore", prevData);
  }

  static success<T>(data: T): DataState<T> {
    return new DataState("success", data);
  }

  static empty<T>(): DataState<T> {
    return new DataState("empty");
  }

  static failure<T>(error: string, prevData: T | null = null): DataState<T> {
    return new DataState("failure", prevData, error);
  }

  // Optional: helper methods
  isLoading() {
    return this.status === "loading" || this.status === "loadingMore";
  }

  hasError() {
    return this.status === "failure";
  }

  isEmpty() {
    return this.status === "empty";
  }

  isSuccess() {
    return this.status === "success";
  }
}
