import { MigrationInterface, QueryRunner } from "typeorm";

export class AddActiveToState1733101000000 implements MigrationInterface {
    name = 'AddActiveToState1733101000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add active column with default false
        await queryRunner.query(`ALTER TABLE "state" ADD "active" boolean NOT NULL DEFAULT false`);

        // Set Massachusetts (MA) to active
        await queryRunner.query(`UPDATE "state" SET "active" = true WHERE "code" = 'MA'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove active column
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "active"`);
    }
}
