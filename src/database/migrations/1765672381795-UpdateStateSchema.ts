import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateStateSchema1765672381795 implements MigrationInterface {
    name = 'UpdateStateSchema1765672381795'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Rename 'name' to 'code' to preserve existing data (e.g. 'AL', 'AK')
        await queryRunner.query(`ALTER TABLE "state" RENAME COLUMN "name" TO "code"`);
        await queryRunner.query(`ALTER TABLE "state" RENAME CONSTRAINT "UQ_b2c4aef5929860729007ac32f6f" TO "UQ_674a683ae959c1416104d17d20e"`);

        // Add new 'name' column for full name (e.g. 'Alabama')
        await queryRunner.query(`ALTER TABLE "state" ADD "name" character varying`);

        // Add 'active' column
        await queryRunner.query(`ALTER TABLE "state" ADD "active" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "state" RENAME CONSTRAINT "UQ_674a683ae959c1416104d17d20e" TO "UQ_b2c4aef5929860729007ac32f6f"`);
        await queryRunner.query(`ALTER TABLE "state" RENAME COLUMN "code" TO "name"`);
    }

}
