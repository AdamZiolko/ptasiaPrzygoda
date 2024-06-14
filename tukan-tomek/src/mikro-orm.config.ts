import { MySqlDriver, Options  } from "@mikro-orm/mysql";
import { Migrator } from '@mikro-orm/migrations'
import { EntityGenerator } from '@mikro-orm/entity-generator';
import { MikroORM } from '@mikro-orm/core';

const config: Options = {
    entities: ['dist/sql/entities/'],
    entitiesTs: ['src/sql/entities/'],
    dbName: 'bazaTukana',
    password: 'root',
    user: 'root',
    driver: MySqlDriver,
    migrations: {
      path: 'dist/sql/migrations/',
      pathTs: 'src/sql/migrations/',
    },
    extensions: [Migrator, EntityGenerator],
// wymagany jest nest cli do generowania na podstawie danych z bazy
};

export default config;