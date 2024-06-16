import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MySqlDriver } from '@mikro-orm/mysql';
import { Migrator } from '@mikro-orm/migrations';
import { EntityGenerator } from '@mikro-orm/entity-generator';
import { DijkstraModule } from './dijkstra/dijkstra.module';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      entities: ['./dist/sql/entities'],
      entitiesTs: ['./src/sql/entities'],
      dbName: 'bazaTukana',
      driver: MySqlDriver,
      user: 'root',
      password: 'root',
      migrations: {
        path: 'dist/sql/migrations',
        pathTs: 'src/sql/migrations',
      },
      debug: true,
      extensions: [Migrator, EntityGenerator],

    }),
    DijkstraModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
