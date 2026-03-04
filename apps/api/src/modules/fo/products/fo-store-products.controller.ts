import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductService } from '../../product/product.service';
import { FoListStoreProductsQueryDto } from './dto/list-store-products-query.dto';
import { FoStoreProductsListDocs } from './fo-products.swagger';

@ApiTags('FO Products')
@Controller('fo/stores/:storeId/products')
export class FoStoreProductsController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @FoStoreProductsListDocs()
  listStoreProducts(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Query() query: FoListStoreProductsQueryDto,
  ) {
    return this.productService.listForFo({
      storeId,
      ...(query.categoryId !== undefined
        ? { categoryId: Number(query.categoryId) }
        : {}),
      ...(query.keyword ? { keyword: query.keyword } : {}),
      ...(query.minMoq !== undefined ? { minMoq: Number(query.minMoq) } : {}),
      ...(query.maxMoq !== undefined ? { maxMoq: Number(query.maxMoq) } : {}),
    });
  }
}
