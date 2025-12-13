import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSummaryAndImageUrlToBeach1757528544185 implements MigrationInterface {
    name = 'AddSummaryAndImageUrlToBeach1734099500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "beach" ADD "summary" text`);
        await queryRunner.query(`ALTER TABLE "beach" ADD "imageUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "beach" DROP COLUMN "imageUrl"`);
        await queryRunner.query(`ALTER TABLE "beach" DROP COLUMN "summary"`);
    }
}
