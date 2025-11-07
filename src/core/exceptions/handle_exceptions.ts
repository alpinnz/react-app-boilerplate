import {
  BaseException,
  ClientException,
  ConnectionException,
  DatabaseException,
  ServerException,
  UnauthorizedException,
  ValidationException,
} from "@/core/exceptions/exceptions.ts";

export function handleException(error: unknown): BaseException {
  if (error instanceof BaseException) {
    const message = getMessage(error.name, error.message);
    const { code, details } = error;

    switch (error.name) {
      case "ValidationException":
        console.warn(`[${error.name}]`, message, details);
        return new ValidationException(message, code, details);

      case "UnauthorizedException":
        console.warn(`[${error.name}]`, message);
        return new UnauthorizedException(message, code, details);

      case "ClientException":
        console.warn(`[${error.name}]`, message, code);
        return new ClientException(message, code, details);

      case "ServerException":
        console.error(`[${error.name}]`, message, details);
        return new ServerException(message, code, details);

      case "DatabaseException":
        console.error(`[${error.name}]`, message, details);
        return new DatabaseException(message, code, details);

      case "ConnectionException":
        console.error(`[${error.name}]`, message, details);
        return new ConnectionException(message, code, details);

      default:
        console.error(`[${error.name}]`, message);
        return new BaseException(message, { name: error.name, code, details });
    }
  }

  // Native Error
  if (error instanceof Error) {
    console.error("[Native JS Error]", error.message);
    return new BaseException(error.message || "Terjadi kesalahan sistem.", {
      name: "BaseException",
    });
  }

  // Non-error
  console.error("[Non-Error Thrown]", error);
  return new BaseException(
    typeof error === "string" ? error.toString() : "Terjadi kesalahan tak terduga.",
    {
      name: "BaseException",
      details: error,
    }
  );
}

function getMessage(name: string, message?: string): string {
  if (message && message.trim() !== "") return message;

  switch (name) {
    case "ValidationException":
      return "Data yang Anda masukkan tidak valid. Mohon periksa kembali.";

    case "UnauthorizedException":
      return "Sesi Anda telah berakhir atau tidak memiliki akses. Silakan login kembali.";

    case "ClientException":
      return "Permintaan tidak dapat diproses. Coba periksa data Anda.";

    case "ServerException":
      return "Terjadi kesalahan pada server. Kami sedang memperbaikinya.";

    case "DatabaseException":
      return "Kesalahan saat mengakses data. Silakan coba beberapa saat lagi.";

    case "ConnectionException":
      return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";

    case "BaseException":
      return "Terjadi kesalahan yang tidak diketahui. Silakan coba lagi nanti.";

    default:
      return "Terjadi kesalahan yang tidak diketahui. Silakan coba lagi nanti.";
  }
}
