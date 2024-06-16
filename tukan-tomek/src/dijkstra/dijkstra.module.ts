import { Module } from '@nestjs/common';
import { DijkstraController } from './dijkstra.controller';
import { DijkstraService } from './dijkstra.service';

@Module({
  controllers: [DijkstraController],
  providers: [DijkstraService]
})
export class DijkstraModule {}
