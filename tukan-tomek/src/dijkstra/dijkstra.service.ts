import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Graph } from 'src/sql/entities/graph.entity';
import { Edge } from 'src/sql/entities/edge.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DijkstraService {
    constructor(
        private em: EntityManager,
      ) { }
    
      async saveGraph(graphData: Record<string, Record<string, number>>): Promise<string> {
        const graph = new Graph();
        graph.hash = uuidv4();
        await this.em.persistAndFlush(graph);
    
        for (const [node, connections] of Object.entries(graphData)) {
            for (const [connectedNode, weight] of Object.entries(connections)) {
                const edge = new Edge();
                edge.graph = graph;
                edge.node = node;
                edge.connectedNode = connectedNode;
                edge.weight = weight;
                await this.em.persistAndFlush(edge);
            }
        }
    
        return graph.hash;
    }

    async findGraph(graphHash: string): Promise<Record<string, Record<string, number>>> {
        const graph = await this.em.findOne(Graph, { hash: graphHash });
        if (!graph) {
            throw new Error('Graph not found');
        }
    
        const edges = await this.em.find(Edge, { graph });
    
        const edgeData: Record<string, Record<string, number>> = {};
        for (const edge of edges) {
            if (!edgeData[edge.node]) {
                edgeData[edge.node] = {};
            }
            edgeData[edge.node][edge.connectedNode] = edge.weight;
        }
    
        return edgeData;
    }

    async algorithm(data: Record<string, Record<string, number>>): Promise<Record<string, any>> {
        const graphData = data;
    
        const nodes = Object.keys(graphData).sort();
        const startNode = nodes[0];
        const endNode = nodes[nodes.length - 1];
    
        const distances: Record<string, number> = {};
        for (const node of nodes) {
            distances[node] = Infinity;
        }
        distances[startNode] = 0;
    
        const previousNodes: Record<string, string | null> = {};
    
        const queue: string[] = [...nodes];
    
        while (queue.length > 0) {
            queue.sort((nodeA, nodeB) => distances[nodeA] - distances[nodeB]);
    
            const currentNode = queue.shift() as string;
    
            for (const [neighbor, weight] of Object.entries(graphData[currentNode])) {
                const distance = distances[currentNode] + weight;
    
                if (distance < distances[neighbor]) {
                    distances[neighbor] = distance;
                    previousNodes[neighbor] = currentNode;
                }
            }
    
            for (const node of nodes) {
                if (graphData[node][currentNode] !== undefined) {
                    const distance = distances[currentNode] + graphData[node][currentNode];
    
                    if (distance < distances[node]) {
                        distances[node] = distance;
                        previousNodes[node] = currentNode;
                    }
                }
            }
        }
    
        const path: string[] = [];
        let currentNode = endNode;
        while (currentNode != null) {
            path.unshift(currentNode);
            currentNode = previousNodes[currentNode] || null;
        }
    
        return {
            distance: distances[endNode],
            path,
        };
    }


    



}
