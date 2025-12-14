import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1765668708187 implements MigrationInterface {
    name = 'InitSchema1765668708187'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "beach_action" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "actionType" character varying NOT NULL, "actionReasons" character varying, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "year" integer NOT NULL, "beachId" integer, CONSTRAINT "PK_dc4a456e464ee8f9172a2c86412" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "county" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "stateId" integer, CONSTRAINT "county_name_state" UNIQUE ("name", "stateId"), CONSTRAINT "PK_e64ba58a034afb0e3d15b329351" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "state" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, CONSTRAINT "UQ_b2c4aef5929860729007ac32f6f" UNIQUE ("name"), CONSTRAINT "PK_549ffd046ebab1336c3a8030a12" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "access" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, CONSTRAINT "UQ_8a974ab8bdb6b87311cd79cb8b3" UNIQUE ("name"), CONSTRAINT "PK_e386259e6046c45ab06811584ed" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "beach_image" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "url" character varying NOT NULL, "primary" boolean NOT NULL DEFAULT false, "description" character varying, "beachId" integer, CONSTRAINT "PK_3cb9eebecb60949acd3e8969c88" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."beach_type_enum" AS ENUM('Fresh', 'Marine')`);
        await queryRunner.query(`CREATE TABLE "beach" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "external_id" character varying NOT NULL, "tier" integer, "beachLength" numeric(10,3), "owner" character varying, "latitude" numeric(10,6), "longitude" numeric(10,6), "summary" text, "type" "public"."beach_type_enum", "stateId" integer, "countyId" integer, "waterbodyId" integer, "accessId" integer, CONSTRAINT "UQ_d5c90e92680ca860caa86f16839" UNIQUE ("external_id"), CONSTRAINT "PK_7697203810f1a1c5f1528fd32a6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "waterbody" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "type" character varying, CONSTRAINT "UQ_08a2d86832a16b586bf2aa3f970" UNIQUE ("name"), CONSTRAINT "PK_468f8736461d48343c420585ce3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "monitoring_frequency" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, CONSTRAINT "UQ_6813eb5f65377644732294ae3d3" UNIQUE ("name"), CONSTRAINT "PK_e33300f69882641b5a22f1f2fb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "beach_history" ("beachId" integer NOT NULL, "year" integer NOT NULL, "tier" integer, "beachLength" numeric(10,3), "daysInSeason" integer, "hoursInSeason" integer, "seasonStart" date, "seasonEnd" date, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "monitorFrequencyAmount" integer, "monitorFrequencyOffSeasonAmount" integer, "monitorFrequencyId" integer, "monitorFrequencyOffSeasonId" integer, CONSTRAINT "PK_195fb7c736311f5216e5ea4e636" PRIMARY KEY ("beachId", "year"))`);
        await queryRunner.query(`ALTER TABLE "beach_action" ADD CONSTRAINT "FK_4dea70794146d82f46ae6d8bb80" FOREIGN KEY ("beachId") REFERENCES "beach"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "county" ADD CONSTRAINT "FK_4c13926e067e17762475723eabf" FOREIGN KEY ("stateId") REFERENCES "state"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "beach_image" ADD CONSTRAINT "FK_782a5831d3a4df4d976b07ccd9d" FOREIGN KEY ("beachId") REFERENCES "beach"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "beach" ADD CONSTRAINT "FK_01ba00d8310c5d24c03e5633879" FOREIGN KEY ("stateId") REFERENCES "state"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "beach" ADD CONSTRAINT "FK_1fa022b7744b6764d06bd359be7" FOREIGN KEY ("countyId") REFERENCES "county"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "beach" ADD CONSTRAINT "FK_74fd18aac6db5b3ae186207af3d" FOREIGN KEY ("waterbodyId") REFERENCES "waterbody"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "beach" ADD CONSTRAINT "FK_8491b151611f89346b0d17a43ff" FOREIGN KEY ("accessId") REFERENCES "access"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "beach_history" ADD CONSTRAINT "FK_97693f34099e0b63653ad1cf358" FOREIGN KEY ("beachId") REFERENCES "beach"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "beach_history" ADD CONSTRAINT "FK_7d9b4ca3e0328c508745d7d7772" FOREIGN KEY ("monitorFrequencyId") REFERENCES "monitoring_frequency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "beach_history" ADD CONSTRAINT "FK_8d73db322c9f025656849e6d28e" FOREIGN KEY ("monitorFrequencyOffSeasonId") REFERENCES "monitoring_frequency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "beach_history" DROP CONSTRAINT "FK_8d73db322c9f025656849e6d28e"`);
        await queryRunner.query(`ALTER TABLE "beach_history" DROP CONSTRAINT "FK_7d9b4ca3e0328c508745d7d7772"`);
        await queryRunner.query(`ALTER TABLE "beach_history" DROP CONSTRAINT "FK_97693f34099e0b63653ad1cf358"`);
        await queryRunner.query(`ALTER TABLE "beach" DROP CONSTRAINT "FK_8491b151611f89346b0d17a43ff"`);
        await queryRunner.query(`ALTER TABLE "beach" DROP CONSTRAINT "FK_74fd18aac6db5b3ae186207af3d"`);
        await queryRunner.query(`ALTER TABLE "beach" DROP CONSTRAINT "FK_1fa022b7744b6764d06bd359be7"`);
        await queryRunner.query(`ALTER TABLE "beach" DROP CONSTRAINT "FK_01ba00d8310c5d24c03e5633879"`);
        await queryRunner.query(`ALTER TABLE "beach_image" DROP CONSTRAINT "FK_782a5831d3a4df4d976b07ccd9d"`);
        await queryRunner.query(`ALTER TABLE "county" DROP CONSTRAINT "FK_4c13926e067e17762475723eabf"`);
        await queryRunner.query(`ALTER TABLE "beach_action" DROP CONSTRAINT "FK_4dea70794146d82f46ae6d8bb80"`);
        await queryRunner.query(`DROP TABLE "beach_history"`);
        await queryRunner.query(`DROP TABLE "monitoring_frequency"`);
        await queryRunner.query(`DROP TABLE "waterbody"`);
        await queryRunner.query(`DROP TABLE "beach"`);
        await queryRunner.query(`DROP TYPE "public"."beach_type_enum"`);
        await queryRunner.query(`DROP TABLE "beach_image"`);
        await queryRunner.query(`DROP TABLE "access"`);
        await queryRunner.query(`DROP TABLE "state"`);
        await queryRunner.query(`DROP TABLE "county"`);
        await queryRunner.query(`DROP TABLE "beach_action"`);
    }

}
