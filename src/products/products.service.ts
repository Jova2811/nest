import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findByIds(ids: string[]): Promise<Product[]> {
    return this.productRepository.findByIds(ids);
  }

  calculateSalePrice(purchaseCost: number, profitPercentage: number): number {
    const markup = 1 + profitPercentage / 100;
    return purchaseCost * markup;
  }

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto); //Solo se crea la instancia del producto con las propiedades
      await this.productRepository.save(product);

      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //Todo: paginar
  findAll(paginationDto: PaginationDto): Promise<Product[]> {
    const {
      limit = 10,
      offset = 0,
      minPrice,
      maxPrice,
      orderBy,
      order,
    } = paginationDto;

    const where: any = {};

    if (minPrice && maxPrice) {
      where.salePrice = Between(minPrice, maxPrice);
    } else if (minPrice) {
      where.salePrice = Between(minPrice, Infinity);
    } else if (maxPrice) {
      where.salePrice = Between(0, maxPrice);
    }

    const orderOptions: any = {};
    if (orderBy && order) {
      orderOptions[orderBy] = order.toUpperCase();
    }

    return this.productRepository.find({
      where,
      take: limit,
      skip: offset,
      order: orderOptions,
    });
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where('UPPER(code) =:code or UPPER(name) =:name', {
          code: term,
          name: term.toUpperCase(),
        })
        .getOne();
    }

    if (!product) throw new NotFoundException(`Product with ${term} not found`); //Par evaluar si un id se encuentra
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    //Preparar para la actualizacion
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
    });

    if (!product)
      throw new NotFoundException(`Product with id: ${id} no found`);

    try {
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    await this.productRepository.remove(product);
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    //console.log(error);
    throw new InternalServerErrorException(
      'Unexpected error,  check server log',
    );
  }
}
