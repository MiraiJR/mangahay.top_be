import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'system_data' })
export class SystemDataEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: string;

  @Column({ type: 'text' })
  value: string;
}
