import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  code: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsPositive()
  salePrice: number;

  @IsNumber()
  @IsPositive()
  purchaseCost: number;

  @IsNumber()
  @IsPositive()
  stock: number;

  @IsNumber()
  @IsPositive()
  quantity: number;
}
