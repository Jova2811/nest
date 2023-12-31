import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  maxPrice?: number;

  @IsOptional()
  orderBy?: string;

  @IsOptional()
  order?: 'asc' | 'desc';
}
