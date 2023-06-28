import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  clave: string;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precioVenta: number;

  @Column('decimal', { precision: 10, scale: 2 })
  costoCompra: number;

  @Column('int', { default: 0 })
  existencia: number;
}
