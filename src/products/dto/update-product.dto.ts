import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsNotEmpty()
  clave?: string;

  @IsOptional()
  @IsNotEmpty()
  nombre?: string;

  @IsOptional()
  @IsNotEmpty()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  precioVenta?: number;

  @IsOptional()
  @IsNumber()
  costoCompra?: number;

  @IsOptional()
  @IsNumber()
  existencia?: number;
}
