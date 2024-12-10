import { ComicPrivilegePermission } from '@modules/comic/comic-privilege/comic-privilege.enum';
import { ComicRepository } from '@modules/comic/comic.repository';
import { Dependencies, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const PERMISSIONS_KEY = 'comicPermissions';
export const ComicPermissions = (...permissions: ComicPrivilegePermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

@Injectable()
@Dependencies(Reflector)
export class ComicPermissionGuard {
  constructor(
    private readonly reflector: Reflector,
    private readonly comicRepository: ComicRepository,
    private readonly comicPrivilegeRepository: ComicPrivilegePermission,
  ) {}

  async canActivate(context: ExecutionContext) {
    const requiredPermissions = this.reflector.getAllAndOverride(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log(requiredPermissions);
  }
}
