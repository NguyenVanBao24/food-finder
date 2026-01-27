import { Module } from '@nestjs/common';
import { LocationsModule } from './modules/locations/locations.module';
import { TagsModule } from './modules/tags/tags.module';
import { CommentsModule } from './modules/comments/comments.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { LocationTagsModule } from './modules/location-tags/location-tags.module';
import { PhotosModule } from './modules/photos/photos.module';

import { CategoriesModule } from './modules/categories/categories.module';

@Module({
  imports: [
    LocationsModule,
    TagsModule,
    CommentsModule,
    FavoritesModule,
    LocationTagsModule,
    PhotosModule,
    CategoriesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
