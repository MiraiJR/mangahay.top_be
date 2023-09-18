import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SlideImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  link_image: string;
}
