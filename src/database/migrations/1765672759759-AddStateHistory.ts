import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStateHistory1765672759759 implements MigrationInterface {
    name = 'AddStateHistory1765672759759'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "state_history" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "year" integer NOT NULL, "stateId" integer, CONSTRAINT "UQ_510a8437bfb3b78fb22ba16dc4d" UNIQUE ("stateId", "year"), CONSTRAINT "PK_07c8cef5a83e4f337ebb87ed58e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "state_history" ADD CONSTRAINT "FK_db6e0a6712dc32e2a7e3a83264d" FOREIGN KEY ("stateId") REFERENCES "state"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "state_history" DROP CONSTRAINT "FK_db6e0a6712dc32e2a7e3a83264d"`);
        await queryRunner.query(`DROP TABLE "state_history"`);
    }

}
