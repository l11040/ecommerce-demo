import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from '../../product/product.service';
import { ProductAssetService } from '../../product/product-asset.service';
import { BoAuthService } from '../auth/bo-auth.service';
import {
  boCookieNames,
  getBearerTokenFromRequest,
  getCookieFromRequest,
} from '../../auth/auth-cookie.util';
import { BoQuotePreviewDto } from './dto/bo-quote-preview.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { ReplaceProductOptionsDto } from './dto/replace-product-options.dto';
import { ReplaceProductPriceTiersDto } from './dto/replace-product-price-tiers.dto';
import { ReplaceProductShippingTiersDto } from './dto/replace-product-shipping-tiers.dto';
import { ReplaceProductSpecsDto } from './dto/replace-product-specs.dto';
import { ReplaceProductMediaDto } from './dto/replace-product-media.dto';
import { ReplaceProductTagsDto } from './dto/replace-product-tags.dto';
import { ReplaceProductSearchAliasesDto } from './dto/replace-product-search-aliases.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';
import { UpsertProductDescriptionDto } from './dto/upsert-product-description.dto';
import { UpsertProductSeoDto } from './dto/upsert-product-seo.dto';
import {
  BoProductsCreateDocs,
  BoProductsDetailDocs,
  BoProductsListDocs,
  BoProductsReplaceDescriptionDocs,
  BoProductsReplaceOptionsDocs,
  BoProductsReplacePriceTiersDocs,
  BoProductsReplaceSeoDocs,
  BoProductsReplaceShippingTiersDocs,
  BoProductsReplaceSpecsDocs,
  BoProductsReplaceMediaDocs,
  BoProductsReplaceTagsDocs,
  BoProductsReplaceSearchAliasesDocs,
  BoProductsUpdateDocs,
  BoProductsUpdateStatusDocs,
  BoProductsQuotePreviewDocs,
  BoProductsUploadImageDocs,
} from './bo-products.swagger';

type UploadedImageFile = {
  mimetype: string;
  size: number;
  originalname: string;
  buffer: Buffer;
};

@ApiTags('BO Products')
@Controller('bo/products')
export class BoProductsController {
  constructor(
    private readonly productService: ProductService,
    private readonly productAssetService: ProductAssetService,
    private readonly boAuthService: BoAuthService,
  ) {}

  @Get()
  @BoProductsListDocs()
  async listProducts(
    @Req() request: Request,
    @Query() query: ListProductsQueryDto,
  ) {
    const adminId = await this.getCurrentBoAdminId(request);

    return this.productService.listForBo(adminId, {
      ...(query.storeId !== undefined
        ? { storeId: Number(query.storeId) }
        : {}),
      ...(query.categoryId !== undefined
        ? { categoryId: Number(query.categoryId) }
        : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.isVisible !== undefined
        ? { isVisible: query.isVisible === 'true' }
        : {}),
      ...(query.keyword ? { keyword: query.keyword } : {}),
      ...(query.minMoq !== undefined ? { minMoq: Number(query.minMoq) } : {}),
      ...(query.maxMoq !== undefined ? { maxMoq: Number(query.maxMoq) } : {}),
    });
  }

  @Get(':id')
  @BoProductsDetailDocs()
  async detailProduct(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const adminId = await this.getCurrentBoAdminId(request);
    return this.productService.getBoDetail(id, adminId);
  }

  @Post()
  @BoProductsCreateDocs()
  async createProduct(@Req() request: Request, @Body() body: CreateProductDto) {
    const adminId = await this.getCurrentBoAdminId(request);
    return this.productService.create({ ...body, actorAdminId: adminId });
  }

  @Patch(':id')
  @BoProductsUpdateDocs()
  async updateProduct(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
  ) {
    const adminId = await this.getCurrentBoAdminId(request);
    return this.productService.updateProduct(id, body, adminId);
  }

  @Patch(':id/status')
  @BoProductsUpdateStatusDocs()
  async updateProductStatus(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductStatusDto,
  ) {
    const adminId = await this.getCurrentBoAdminId(request);
    return this.productService.updateProductStatus(id, body.status, adminId);
  }

  @Post(':id/quote-preview')
  @BoProductsQuotePreviewDocs()
  async quotePreviewProduct(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: BoQuotePreviewDto,
  ) {
    const adminId = await this.getCurrentBoAdminId(request);
    return this.productService.quotePreviewForBo(id, body, adminId);
  }

  @Put(':id/options')
  @BoProductsReplaceOptionsDocs()
  async replaceProductOptions(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ReplaceProductOptionsDto,
  ) {
    const adminId = await this.getCurrentBoAdminId(request);
    return this.productService.replaceOptions(id, body, adminId);
  }

  @Put(':id/price-tiers')
  @BoProductsReplacePriceTiersDocs()
  async replaceProductPriceTiers(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ReplaceProductPriceTiersDto,
  ) {
    const adminId = await this.getCurrentBoAdminId(request);
    return this.productService.replacePriceTiers(id, body, adminId);
  }

  @Put(':id/specs')
  @BoProductsReplaceSpecsDocs()
  async replaceProductSpecs(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ReplaceProductSpecsDto,
  ) {
    const adminId = await this.getCurrentBoAdminId(request);
    return this.productService.replaceSpecs(id, body, adminId);
  }

  @Put(':id/shipping-tiers')
  @BoProductsReplaceShippingTiersDocs()
  async replaceProductShippingTiers(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ReplaceProductShippingTiersDto,
  ) {
    const adminId = await this.getCurrentBoAdminId(request);
    return this.productService.replaceShippingTiers(id, body, adminId);
  }

  @Put(':id/media')
  @BoProductsReplaceMediaDocs()
  async replaceProductMedia(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ReplaceProductMediaDto,
  ) {
    const adminId = await this.getCurrentBoAdminId(request);
    return this.productService.replaceMedia(id, body, adminId);
  }

  @Put(':id/tags')
  @BoProductsReplaceTagsDocs()
  async replaceProductTags(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ReplaceProductTagsDto,
  ) {
    const adminId = await this.getCurrentBoAdminId(request);
    return this.productService.replaceTags(id, body, adminId);
  }

  @Put(':id/search-aliases')
  @BoProductsReplaceSearchAliasesDocs()
  async replaceProductSearchAliases(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ReplaceProductSearchAliasesDto,
  ) {
    const adminId = await this.getCurrentBoAdminId(request);
    return this.productService.replaceSearchAliases(id, body, adminId);
  }

  @Put(':id/description')
  @BoProductsReplaceDescriptionDocs()
  async upsertProductDescription(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpsertProductDescriptionDto,
  ) {
    const adminId = await this.getCurrentBoAdminId(request);
    return this.productService.upsertDescription(id, body, adminId);
  }

  @Put(':id/seo')
  @BoProductsReplaceSeoDocs()
  async upsertProductSeo(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpsertProductSeoDto,
  ) {
    const adminId = await this.getCurrentBoAdminId(request);
    return this.productService.upsertSeo(id, body, adminId);
  }

  @Post('images')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  @BoProductsUploadImageDocs()
  async uploadProductImage(
    @Req() request: Request,
    @UploadedFile() file: UploadedImageFile,
  ) {
    await this.getCurrentBoAdminId(request);
    return this.productAssetService.uploadImage(file);
  }

  private async getCurrentBoAdminId(request: Request): Promise<number> {
    const accessToken =
      getCookieFromRequest(request, boCookieNames.access) ??
      getBearerTokenFromRequest(request);
    const me = await this.boAuthService.me(accessToken);
    return me.id;
  }
}
