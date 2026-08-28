import { defineConfig } from '@mikro-orm/postgresql';
import config from './config.json';
import { UserStats } from './core/database/entities/UserStats';
import { User } from './core/database/entities/User';
import { Room } from './core/database/entities/Room';
import { NavigatorCategory } from './core/database/entities/NavigatorCategory';
import { Migrator } from '@mikro-orm/migrations';

export default defineConfig({
    dbName: config.database.name,
    host: config.database.host,
    port: config.database.port,
    user: config.database.username,
    password: config.database.password,
    entities: [UserStats, User, Room, NavigatorCategory],
    extensions: [Migrator],
    migrations: {
        tableName: 'migrations',
    },
    debug: config.debug,
})