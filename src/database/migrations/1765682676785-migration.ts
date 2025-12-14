import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1765682676785 implements MigrationInterface {
    name = 'Migration1765682676785'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "beach_action" DROP CONSTRAINT "FK_2bdc6c494e02d713ff2934a5b64"`);
        await queryRunner.query(`CREATE TABLE "beach_action_indicators_beach_indicator" ("beachActionId" integer NOT NULL, "beachIndicatorId" integer NOT NULL, CONSTRAINT "PK_804db549265e8d4b73eeccd11b6" PRIMARY KEY ("beachActionId", "beachIndicatorId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d55694afae71dac7458a80ce17" ON "beach_action_indicators_beach_indicator" ("beachActionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8e56b36bd795735bb1d1bce0fd" ON "beach_action_indicators_beach_indicator" ("beachIndicatorId") `);
        await queryRunner.query(`ALTER TABLE "beach_action" DROP COLUMN "indicatorId"`);
        await queryRunner.query(`ALTER TABLE "beach_action_indicators_beach_indicator" ADD CONSTRAINT "FK_d55694afae71dac7458a80ce173" FOREIGN KEY ("beachActionId") REFERENCES "beach_action"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "beach_action_indicators_beach_indicator" ADD CONSTRAINT "FK_8e56b36bd795735bb1d1bce0fdf" FOREIGN KEY ("beachIndicatorId") REFERENCES "beach_indicator"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "beach_action_indicators_beach_indicator" DROP CONSTRAINT "FK_8e56b36bd795735bb1d1bce0fdf"`);
        await queryRunner.query(`ALTER TABLE "beach_action_indicators_beach_indicator" DROP CONSTRAINT "FK_d55694afae71dac7458a80ce173"`);
        await queryRunner.query(`ALTER TABLE "beach_action" ADD "indicatorId" integer`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8e56b36bd795735bb1d1bce0fd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d55694afae71dac7458a80ce17"`);
        await queryRunner.query(`DROP TABLE "beach_action_indicators_beach_indicator"`);
        await queryRunner.query(`ALTER TABLE "beach_action" ADD CONSTRAINT "FK_2bdc6c494e02d713ff2934a5b64" FOREIGN KEY ("indicatorId") REFERENCES "beach_indicator"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
