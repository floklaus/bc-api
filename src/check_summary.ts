import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const ds = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
});

async function run() {
    await ds.initialize();
    const res = await ds.query('SELECT count(*) FROM beach WHERE summary IS NOT NULL');
    console.log(`Beaches with summary: ${res[0].count}`);

    const sample = await ds.query('SELECT name, summary FROM beach WHERE summary IS NOT NULL LIMIT 1');
    if (sample.length > 0) {
        console.log('Sample Summary:');
        console.log(sample[0]);
    }
    await ds.destroy();
}
run().catch(console.error);
