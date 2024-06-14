import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';

@Injectable()
export class AppService {
  constructor(private readonly em: EntityManager) {}

  getHello(): string {
    return 'Hello World!';
  }

  getTomek(): string {
    const connection = this.em.getConnection();
    let kwerenda = connection.execute(
      `select * from testowa`
    )

    for(let key in kwerenda){ console.log(key); }

    return 'Tomek';
  }
}
