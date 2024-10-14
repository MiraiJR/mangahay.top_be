import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/modules/user/user.role';
import { Injectable, Dependencies } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
@Dependencies(Reflector)
export class RoleGuard {
  reflector: any;

  constructor(reflector: any) {
    this.reflector = reflector;
  }

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
