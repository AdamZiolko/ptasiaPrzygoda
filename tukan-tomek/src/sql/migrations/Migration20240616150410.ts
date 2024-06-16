import { Migration } from '@mikro-orm/migrations';

export class Migration20240616150410 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `graph` (`id` int unsigned not null auto_increment primary key, `created_at` datetime not null, `hash` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `edge` (`id` int unsigned not null auto_increment primary key, `graph_id` int unsigned not null, `node` int not null, `connected_node` int not null, `weight` int not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `edge` add index `edge_graph_id_index`(`graph_id`);');
    this.addSql('alter table `edge` add index `edge_node_index`(`node`);');
    this.addSql('alter table `edge` add index `edge_connected_node_index`(`connected_node`);');

    this.addSql('alter table `edge` add constraint `edge_graph_id_foreign` foreign key (`graph_id`) references `graph` (`id`) on update cascade;');

    this.addSql('alter table `testowa` modify `id` int unsigned not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `edge` drop foreign key `edge_graph_id_foreign`;');

    this.addSql('drop table if exists `graph`;');

    this.addSql('drop table if exists `edge`;');

    this.addSql('alter table `testowa` modify `id` int not null;');
  }

}
