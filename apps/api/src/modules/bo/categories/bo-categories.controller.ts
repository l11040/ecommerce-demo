import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoryService } from '../../category/category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateMainExposureDto } from './dto/update-main-exposure.dto';
import {
  BoCategoriesCreateDocs,
  BoCategoriesDeleteDocs,
  BoCategoriesListDocs,
  BoCategoriesMainExposureDocs,
  BoCategoriesUpdateDocs,
} from './bo-categories.swagger';

@ApiTags('BO Categories')
@Controller('bo/categories')
export class BoCategoriesController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @BoCategoriesListDocs()
  list(@Query() query: ListCategoriesQueryDto) {
    return this.categoryService.list({
      ...(query.parentId !== undefined
        ? { parentId: Number(query.parentId) }
        : {}),
      ...(query.depth !== undefined ? { depth: Number(query.depth) } : {}),
      ...(query.isActive !== undefined
        ? { isActive: query.isActive === 'true' }
        : {}),
      ...(query.isVisible !== undefined
        ? { isVisible: query.isVisible === 'true' }
        : {}),
      ...(query.isMainExposed !== undefined
        ? { isMainExposed: query.isMainExposed === 'true' }
        : {}),
    });
  }

  @Post()
  @BoCategoriesCreateDocs()
  create(@Body() body: CreateCategoryDto) {
    return this.categoryService.create(body);
  }

  @Patch(':id')
  @BoCategoriesUpdateDocs()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, body);
  }

  @Patch(':id/main-exposure')
  @BoCategoriesMainExposureDocs()
  setMainExposure(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMainExposureDto,
  ) {
    return this.categoryService.setMainExposure(id, body.isMainExposed);
  }

  @Delete(':id')
  @BoCategoriesDeleteDocs()
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.delete(id);
  }
}
