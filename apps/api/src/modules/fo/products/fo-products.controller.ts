import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductService } from '../../product/product.service';
import { FoQuoteDto } from './dto/fo-quote.dto';
import { FoListProductsQueryDto } from './dto/list-products-query.dto';
import {
  FoProductsDetailDocs,
  FoProductsListDocs,
  FoProductsQuoteDocs,
} from './fo-products.swagger';

@ApiTags('FO Products')
@Controller('fo/products')
export class FoProductsController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @FoProductsListDocs()
  listProducts(@Query() query: FoListProductsQueryDto) {
    return this.productService.listForFo({
      ...(query.storeId !== undefined
        ? { storeId: Number(query.storeId) }
        : {}),
      ...(query.categoryId !== undefined
        ? { categoryId: Number(query.categoryId) }
        : {}),
      ...(query.keyword ? { keyword: query.keyword } : {}),
      ...(query.minMoq !== undefined ? { minMoq: Number(query.minMoq) } : {}),
      ...(query.maxMoq !== undefined ? { maxMoq: Number(query.maxMoq) } : {}),
    });
  }

  @Get(':slug')
  @FoProductsDetailDocs()
  detailProduct(@Param('slug') slug: string) {
    return this.productService.getFoDetailBySlug(slug);
  }

  @Post(':id/quote')
  @FoProductsQuoteDocs()
  quoteProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: FoQuoteDto,
  ) {
    return this.productService.quoteForFo(id, body);
  }
}
