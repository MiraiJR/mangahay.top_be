import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SlideImage } from './entity/SlideImage.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(SlideImage)
    private slideImageRepository: Repository<SlideImage>,
  ) {}

  async changeSlideImage(index: number, link_image: string) {
    return await this.slideImageRepository.save({
      id: index,
      link_image: link_image,
    });
  }

  async createSlideImage(link_image: string) {
    return await this.slideImageRepository.save({
      link_image: link_image,
    });
  }

  async getSlideImages() {
    return await this.slideImageRepository.find({
      take: 5,
      order: {
        id: 'ASC',
      },
    });
  }
}
