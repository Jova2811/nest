import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleDetail } from './entities/sale-detail.entity';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(SaleDetail)
    private readonly saleDetailRepository: Repository<SaleDetail>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async processSale(products: any[]): Promise<Sale> {
    const sale = new Sale();
    sale.totalProducts = 0;
    sale.totalOperation = 0;

    for (const product of products) {
      const { productId, quantity } = product;
      const dbProduct = await this.productRepository.findOne(productId);

      if (dbProduct && dbProduct.stock >= quantity) {
        const saleDetail = new SaleDetail();
        saleDetail.description = dbProduct.name;
        saleDetail.quantity = quantity;
        saleDetail.salePrice = dbProduct.salePrice;
        saleDetail.totalPrice = dbProduct.salePrice * quantity;
        saleDetail.purchasePrice = dbProduct.purchaseCost;
        saleDetail.profitPercentage =
          ((dbProduct.salePrice - dbProduct.purchaseCost) /
            dbProduct.purchaseCost) *
          100;
        saleDetail.discount = 0;

        sale.details.push(saleDetail);

        sale.totalProducts += quantity;
        sale.totalOperation += saleDetail.totalPrice;

        dbProduct.stock -= quantity;
        await this.productRepository.save(dbProduct);
      }
    }

    return this.saleRepository.save(sale);
  }
}
