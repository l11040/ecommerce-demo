import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoryService } from '../../category/category.service';
import {
  FoCategoriesMainDocs,
  FoCategoriesTreeDocs,
} from './fo-categories.swagger';

@ApiTags('FO Categories')
@Controller('fo/categories')
export class FoCategoriesController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('tree')
  @FoCategoriesTreeDocs()
  tree() {
    return this.categoryService.getTree();
  }

  @Get('main')
  @FoCategoriesMainDocs()
  main() {
    return this.categoryService.getMainCategories();
  }
}
