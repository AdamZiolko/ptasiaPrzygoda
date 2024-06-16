import { Controller, Get, Param, Query , Post, Body } from '@nestjs/common';
import { DijkstraService } from './dijkstra.service';






@Controller('dijkstra')
export class DijkstraController {
    constructor(private readonly dijkstraServicey: DijkstraService) {}

    @Post('dijkstraGraph')
    saveGraph(@Body() graph: Record<string, Record<string, number>>): Promise<string> {
        console.log(graph);
        return this.dijkstraServicey.saveGraph(graph);
    }

    @Get('dijkstraGraph/:graphHash')
    getGraph(@Param('graphHash') graphHash: string): Promise<Record<string, object>> {
        return this.dijkstraServicey.findGraph(graphHash);
    }


    @Post('findPath')
    findPath(@Body() graph: Record<string, Record<string, number>>): Promise<Record<string, any>> {
        return this.dijkstraServicey.algorithm(graph);
    }


}
