import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Testowa {

  @PrimaryKey({ unsigned: false })
  id!: number;

  @Property({ length: 32, nullable: true })
  dane?: string;

  @Property({ columnType: 'double', nullable: true })
  liczba?: number;

}
