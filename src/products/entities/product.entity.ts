import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { SaleDetail } from 'src/sale/entities/sale-detail.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  salePrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  purchaseCost: number;

  @Column('int', { default: 0 })
  stock: number;

  @OneToMany(() => SaleDetail, (saleDetail) => saleDetail.product)
  saleDetails: SaleDetail[];
}
