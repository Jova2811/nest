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
  findAll(paginationDto: PaginationDto) {
    const {
      limit = 10,
      offset = 0,
      precioMin,
      precioMax,
      orderBy,
      order,
    } = paginationDto;

    const where: any = {};

    if (precioMin && precioMax) {
      where.precioVenta = Between(precioMin, precioMax);
    } else if (precioMin) {
      where.precioVenta = Between(precioMin, Infinity);
    } else if (precioMax) {
      where.precioVenta = Between(0, precioMax);
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
    // const { limit = 10, offset = 0 } = paginationDto;

    // return this.productRepository.find({
    //   take: limit,
    //   skip: offset,
    //   //Todo: relaciones
    // });
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where('UPPER(clave) =:clave or UPPER(nombre) =:nombre', {
          clave: term,
          nombre: term.toUpperCase(),
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
