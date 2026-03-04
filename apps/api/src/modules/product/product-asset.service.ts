import {
  BadRequestException,
  Injectable,
  PayloadTooLargeException,
} from '@nestjs/common';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';

const MAX_IMAGE_FILE_BYTES = 10 * 1024 * 1024;

type UploadedImageFile = {
  mimetype: string;
  size: number;
  originalname: string;
  buffer: Buffer;
};

@Injectable()
export class ProductAssetService {
  async uploadImage(file: UploadedImageFile) {
    if (!file) {
      throw new BadRequestException({
        code: 'PRODUCT_IMAGE_FILE_REQUIRED',
        message: 'Image file is required',
      });
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException({
        code: 'PRODUCT_IMAGE_INVALID_TYPE',
        message: 'Only image files are allowed',
      });
    }

    if (file.size > MAX_IMAGE_FILE_BYTES) {
      throw new PayloadTooLargeException({
        code: 'PRODUCT_IMAGE_TOO_LARGE',
        message: 'Image file size must be less than 10MB',
      });
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const datePath = `${year}/${month}/${day}`;

    const uploadDir = join(process.cwd(), 'uploads', 'products', datePath);
    await mkdir(uploadDir, { recursive: true });

    const sourceExt = extname(file.originalname).trim();
    const ext = sourceExt.length > 0 ? sourceExt.toLowerCase() : '.bin';
    const filename = `${Date.now()}-${randomUUID()}${ext}`;

    const absoluteFilePath = join(uploadDir, filename);
    await writeFile(absoluteFilePath, file.buffer);

    const relativePath = `/uploads/products/${datePath}/${filename}`;

    return {
      path: relativePath,
      url: relativePath,
      filename,
      mimeType: file.mimetype,
      size: file.size,
    };
  }
}
