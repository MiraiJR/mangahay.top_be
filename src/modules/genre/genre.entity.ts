import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Genre {
  @PrimaryColumn()
  slug: string;

  @Column()
  name: string;
}
