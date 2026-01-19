import { PartialType } from '@nestjs/mapped-types';
import { CreateLocationDto } from './create-location.dto';

/**
 * DTO for updating an existing location
 * All fields are optional (partial of CreateLocationDto)
 * Used by location owners or admins to update location details
 */
export class UpdateLocationDto extends PartialType(CreateLocationDto) { }
