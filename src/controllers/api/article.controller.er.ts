import { Body, Controller, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Crud } from "@nestjsx/crud";
import { AddArticleDto } from "src/dtos/article/add.article.dto";
import { Article } from "src/entities/article.entity";
import { ArticleService } from "src/services/article/article.service";
import { diskStorage } from "multer"
import { StorageConfig } from "config/storage.config";
import { PhotoService } from "src/services/photo/photo.service";
import { Photo } from "src/entities/photo.entity";
import { ApiResponse } from "src/misc/api.response";

@Controller('/api/article')
@Crud({
    model: {
        type: Article
    },
    params: {
        id: {
            field: 'articleId',
            type: 'number',
            primary: true,
        }
    },
    query: {
        join: {
            category: {
                eager: true
            },
            articleFeatures: {
                eager: true
            },
            articlePrices: {
                eager : true
            },
            photos: {
                eager : true
            },
            features: {
                eager: true
            }
        },
    }
})
export class ArticleController {
    constructor(
        public service: ArticleService,
        public photoService: PhotoService,
    ) {}

    @Post('createFull') //POST http://localhost:3000/api/article/createFull
     createFullArticle(@Body() data: AddArticleDto) {
        return this.service.createFullArticle(data);
    }

    @Post(':id/uploadPhoto/') //POST http://localhost:3000/api/article/:id/uploadPhoto/
    @UseInterceptors(
        FileInterceptor('photo', {
            storage: diskStorage({
                destination: StorageConfig.photoDestination,
                // Ovo je inline array funkcja i mora da sadrži tri argumenta
                filename: (req, file, callback) => {
                    let original: string = file.originalname;

                    let normalized = original.replace(/\s+/g, '-');
                    normalized = normalized.replace(/[^A-z0-9\.\-]/g, '')
                    let sada = new Date();
                    let datePart = '';
                    datePart += sada.getFullYear().toString();
                    datePart += (sada.getMonth() + 1).toString();
                    datePart += sada.getDate().toString();

                    let randomPart: string = 
                    new Array(10)
                        .fill(0)
                        .map(e => (Math.random() * 9).toFixed(0).toString())
                        .join('')
                    
                    let fileName = datePart + '-' + randomPart + '-' + normalized;
                    
                    fileName = fileName.toLowerCase();

                    callback(null, fileName);
                } 
            }),
            fileFilter: (req, file, callback) => {
                //Provera ekstenzije JPG, PNG
                if (!file.originalname.toLowerCase().match(/\.(jpg|png)$/)) {
                    callback(new Error('Bad file extension!'), false);
                    return;
                }

                // Provera tima sadržaja: jpeg, png (mimetype)
                if (!(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))) {
                    callback(new Error('Bad file content!'), false);
                    return;
                }

                callback(null, true);
            },

            limits: {
                files: 1,
                fileSize: StorageConfig.photoMaxFileSize,
            }
        })
    )
    async uploadPhoto(@Param('id') articleId: number, @UploadedFile() photo): Promise<Photo | ApiResponse> {
        //Zapis u bazu podataka
        const newPhoto: Photo = new Photo();
        newPhoto.articleId = articleId;
        newPhoto.imagePath = photo.filename;

        const savedPhoto = await this.photoService.add(newPhoto);

        if (!savedPhoto) {
            return new ApiResponse('error', -4001, 'No file found');
        }

        return savedPhoto
    }
}