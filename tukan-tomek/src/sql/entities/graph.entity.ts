import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Graph {
  @PrimaryKey()
  id!: number;

  @Property({ type: 'Date' })
  createdAt = new Date();

  @Property()
  hash!: string;
}