import { Logger } from '@nestjs/common';
import { Resolver, Query } from '@nestjs/graphql';
import { AdminService } from './admin.service';
import { SlideImageDTO } from './DTO/Slide-Image';

@Resolver()
export class AdminResolver {
  constructor(
    private logger: Logger = new Logger(AdminResolver.name),
    private adminService: AdminService,
  ) {}

  @Query(() => [SlideImageDTO])
  async getSlideImages() {
    try {
      return await this.adminService.getSlideImages();
    } catch (error) {
      this.logger.error(error);
    }
  }
}
