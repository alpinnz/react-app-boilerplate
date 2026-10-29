import type { User } from '../../domain/entities/user'
import type { UserDto } from '../dto/user.dto'

/** Mengubah nama field DTO backend menjadi entity pengguna domain. */
export function mapUser(dto: UserDto): User {
  return {
    id: dto.id,
    roleId: dto.role_id,
    name: dto.name,
    email: dto.email,
    phoneNumber: dto.phone_number,
    countryCode: dto.country_code,
  }
}
