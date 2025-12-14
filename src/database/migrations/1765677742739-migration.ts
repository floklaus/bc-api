import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1765677742739 implements MigrationInterface {
    name = 'Migration1765677742739'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "beach_indicator" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "code" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_142505f379a843901d7452b39a6" UNIQUE ("code"), CONSTRAINT "PK_36cdd177eac7d0974f6e15828d0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "beach_action" ADD "durationDays" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "beach_action" ADD "indicatorId" integer`);
        await queryRunner.query(`ALTER TABLE "beach_action" ADD CONSTRAINT "FK_2bdc6c494e02d713ff2934a5b64" FOREIGN KEY ("indicatorId") REFERENCES "beach_indicator"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "beach_action" DROP CONSTRAINT "FK_2bdc6c494e02d713ff2934a5b64"`);
        await queryRunner.query(`ALTER TABLE "beach_action" DROP COLUMN "indicatorId"`);
        await queryRunner.query(`ALTER TABLE "beach_action" DROP COLUMN "durationDays"`);
        await queryRunner.query(`DROP TABLE "beach_indicator"`);
    }

}
