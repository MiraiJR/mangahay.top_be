/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Genres {
  @PrimaryColumn()
  slug: string;

  @Column()
  genre: string;
}
