// edge.entity.ts
import { Entity, PrimaryKey, Property, Index, ManyToOne } from '@mikro-orm/core';
import { Graph } from './graph.entity';

@Entity()
export class Edge {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Graph)
  graph!: Graph;

  @Index()
  @Property({ columnType: 'varchar(3)' })
  node!: string;

  @Index()
  @Property({ columnType: 'varchar(3)' })
  connectedNode!: string;

  @Property()
  weight!: number;
}