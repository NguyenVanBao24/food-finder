import { Module } from '@nestjs/common';
import { LocationsModule } from './modules/locations/locations.module';
import { TagsModule } from './modules/tags/tags.module';
import { CommentsModule } from './modules/comments/comments.module';
import { FavoritesModule } from './modules/favorites/favorites.module';

@Module({
  imports: [LocationsModule, TagsModule, CommentsModule, FavoritesModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
