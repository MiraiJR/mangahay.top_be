import { IsArray, IsNotEmpty, IsNumber, ArrayNotEmpty, Validate } from 'class-validator';
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'IsValidPermission', async: false })
class IsValidPermissionConstraint implements ValidatorConstraintInterface {
  validate(permissions: number[]) {
    const validValues = [1, 2, 3, 4];
    return permissions.every((value) => validValues.includes(value));
  }

  defaultMessage() {
    return 'Each permission must be one of the following values: 1, 2, 3, 4';
  }
}

export class SinglePrivilegeRequest {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsArray()
  @ArrayNotEmpty()
  @Validate(IsValidPermissionConstraint)
  permissions: number[];
}
