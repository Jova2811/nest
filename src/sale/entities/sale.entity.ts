import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { SaleDetail } from './sale-detail.entity';

@Entity()
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  totalProducts: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalOperation: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateTime: Date;

  @OneToMany(() => SaleDetail, (saleDetail) => saleDetail.sale, {
    cascade: true,
  })
  details: SaleDetail[];
}
