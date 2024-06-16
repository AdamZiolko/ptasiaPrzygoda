import { Entity, PrimaryKey, Property, Index, ManyToOne } from '@mikro-orm/core';
import { Graph } from './graph.entity';

@Entity()
export class Edge {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Graph)
  graph!: Graph;

  @Index()
  @Property()
  node!: number;

  @Index()
  @Property()
  connectedNode!: number;

  @Property()
  weight!: number;
}