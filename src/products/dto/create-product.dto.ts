import {
  IsNumber,
  IsPositive,
  IsString,
  MinLength,
  IsInt,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(1) //Minimo un caracter
  nombre: string;

  @IsNumber()
  @IsPositive()
  clave: string;

  @IsString()
  descripcion: string;

  @IsNumber()
  @IsPositive()
  precioVenta: number;

  @IsNumber()
  costoCompra: number;

  @IsInt()
  @IsPositive()
  existencia: number;
}
