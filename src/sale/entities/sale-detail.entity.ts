import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Sale } from './sale.entity';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class SaleDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  salePrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  purchasePrice: number;

  @Column('decimal', { precision: 5, scale: 2 })
  profitPercentage: number;

  @Column('decimal', { precision: 5, scale: 2 })
  discount: number;

  @ManyToOne(() => Sale, (sale) => sale.details)
  sale: Sale;

  @ManyToOne(() => Product, (product) => product.saleDetails)
  product: Product;
}
