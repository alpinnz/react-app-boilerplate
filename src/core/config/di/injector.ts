import { asClass, createContainer, Lifetime } from "awilix/browser";
import type { AuthRepository } from "@/features/auth/repositories/auth_repository/auth_repository.ts";
import { AuthRepositoryImpl } from "@/features/auth/repositories/auth_repository/auth_repository_impl.ts";

const injector = createContainer({
  injectionMode: "CLASSIC",
  strict: true,
});

injector.register({
  authRepository: asClass<AuthRepository>(AuthRepositoryImpl, { lifetime: Lifetime.SINGLETON }),
});

export { injector };
