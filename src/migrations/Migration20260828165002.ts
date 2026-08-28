import { Migration } from '@mikro-orm/migrations';

export class Migration20260828165002 extends Migration {

  override name = 'Migration20260828165002';

  override up(): void | Promise<void> {
    this.addSql(`create table "navigator_categories" ("id" serial primary key, "name" text not null);`);

    this.addSql(`create table "users" ("id" serial primary key, "username" text not null, "look" text not null, "gender" text not null, "auth_token" text null);`);
    this.addSql(`alter table "users" add constraint "users_gender_check" check ("gender" in ('M', 'F'));`);

    this.addSql(`create table "rooms" ("id" serial primary key, "name" text not null, "owner_id" int null, "category_id" int not null);`);

    this.addSql(`create table "user_stats" ("id" serial primary key, "respect_received" int not null, "user_id" int not null);`);
    this.addSql(`alter table "user_stats" add constraint "user_stats_user_id_unique" unique ("user_id");`);

    this.addSql(`alter table "rooms" add constraint "rooms_owner_id_foreign" foreign key ("owner_id") references "users" ("id") on delete set null;`);
    this.addSql(`alter table "rooms" add constraint "rooms_category_id_foreign" foreign key ("category_id") references "navigator_categories" ("id");`);

    this.addSql(`alter table "user_stats" add constraint "user_stats_user_id_foreign" foreign key ("user_id") references "users" ("id");`);
  }

}
