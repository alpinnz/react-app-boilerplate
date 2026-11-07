import type { AccountProfile } from '../../domain/entities/account-profile'
import type { AccountProfileInput } from '../../domain/repositories/account.repository'
import type { AccountProfileDto, AccountProfileUpdateDto } from '../dto/account-profile.dto'

/** Maps a validated API profile DTO into the account domain entity. */
export function mapAccountProfile(dto: AccountProfileDto): AccountProfile {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    phoneNumber: dto.phone_number,
    countryCode: dto.country_code,
    role: { id: dto.role.id, name: dto.role.name, level: dto.role.level },
  }
}

/** Maps the API update response into the domain repository result. */
export function mapAccountProfileUpdate(dto: AccountProfileUpdateDto): AccountProfileInput {
  return {
    name: dto.name,
    phoneNumber: dto.phone_number,
    countryCode: dto.country_code,
  }
}
