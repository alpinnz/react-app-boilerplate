export type ExceptionType =
  | "ServerException"
  | "ClientException"
  | "DatabaseException"
  | "ConnectionException"
  | "ValidationException"
  | "UnauthorizedException"
  | "BaseException";

export class BaseException extends Error {
  public readonly name: ExceptionType;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    {
      name = "BaseException",
      code,
      details,
    }: { name?: ExceptionType; code?: string; details?: unknown } = {}
  ) {
    super(message);
    this.name = name;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
  }
}

export class ServerException extends BaseException {
  constructor(message: string, code?: string, details?: unknown) {
    super(message, { name: "ServerException", code, details });
  }
}

export class ClientException extends BaseException {
  constructor(message: string, code?: string, details?: unknown) {
    super(message, { name: "ClientException", code, details });
  }
}

export class DatabaseException extends BaseException {
  constructor(message: string, code?: string, details?: unknown) {
    super(message, { name: "DatabaseException", code, details });
  }
}

export class ConnectionException extends BaseException {
  constructor(message: string, code?: string, details?: unknown) {
    super(message, { name: "ConnectionException", code, details });
  }
}

export class ValidationException extends BaseException {
  constructor(message: string, code?: string, details?: unknown) {
    super(message, { name: "ValidationException", code, details });
  }
}

export class UnauthorizedException extends BaseException {
  constructor(message: string, code?: string, details?: unknown) {
    super(message, { name: "UnauthorizedException", code, details });
  }
}
