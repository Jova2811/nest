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
import { Sale } from '../sale/entities/sale.entity';
import { SaleDetail } from '../sale/entities/sale-detail.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);

      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

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
      product = await this.productRepository.findOne({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where('UPPER(code) = :code OR UPPER(name) = :name', {
          code: term,
          name: term.toUpperCase(),
        })
        .getOne();
    }

    if (!product) throw new NotFoundException(`Product with ${term} not found`);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
    });

    if (!product)
      throw new NotFoundException(`Product with id: ${id} not found`);

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
    throw new InternalServerErrorException(
      'Unexpected error, check server log',
    );
  }

  async calculateSale(sale: Sale): Promise<number> {
    let total = 0;

    for (const saleDetail of sale.details) {
      const subtotal = saleDetail.totalPrice;
      const discount = saleDetail.discount;

      total += subtotal - (subtotal * discount) / 100;
    }

    return total;
  }
}
