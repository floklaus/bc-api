import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1757528544182 implements MigrationInterface {
    name = 'Migration1757528544182'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "county" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "code" character varying NOT NULL, CONSTRAINT "UQ_43252ec2f3b60ff73077a18ef7c" UNIQUE ("name"), CONSTRAINT "UQ_7173be2c5b2ff6434042412edd1" UNIQUE ("code"), CONSTRAINT "county_name_code" UNIQUE ("name", "code"), CONSTRAINT "PK_e64ba58a034afb0e3d15b329351" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."measurement_reason_enum" AS ENUM('E. Coli', 'Enterococci')`);
        await queryRunner.query(`CREATE TABLE "measurement" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "asOf" date NOT NULL, "year" integer NOT NULL, "reason" "public"."measurement_reason_enum" NOT NULL, "indicatorLevel" integer NOT NULL, "viloation" boolean NOT NULL, "beachId" integer, CONSTRAINT "measurement_asOf_beach" UNIQUE ("asOf", "beachId", "indicatorLevel"), CONSTRAINT "PK_742ff3cc0dcbbd34533a9071dfd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ae1ff0ef48616f021bdded4590" ON "measurement" ("year") `);
        await queryRunner.query(`CREATE TYPE "public"."beach_type_enum" AS ENUM('Fresh', 'Marine')`);
        await queryRunner.query(`CREATE TABLE "beach" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "latitude" numeric(10,6) NOT NULL, "longitude" numeric(10,6) NOT NULL, "type" "public"."beach_type_enum" NOT NULL, "cityId" integer, CONSTRAINT "UQ_e76dc20b0f850792da1f67c8157" UNIQUE ("name"), CONSTRAINT "PK_7697203810f1a1c5f1528fd32a6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "city" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "code" character varying NOT NULL, "stateId" integer, "countyId" integer, CONSTRAINT "UQ_f8c0858628830a35f19efdc0ecf" UNIQUE ("name"), CONSTRAINT "UQ_b94ae715aad0d13e62f585ff11b" UNIQUE ("code"), CONSTRAINT "city_name_code" UNIQUE ("name", "code"), CONSTRAINT "PK_b222f51ce26f7e5ca86944a6739" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "state" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "code" character varying NOT NULL, CONSTRAINT "UQ_b2c4aef5929860729007ac32f6f" UNIQUE ("name"), CONSTRAINT "UQ_674a683ae959c1416104d17d20e" UNIQUE ("code"), CONSTRAINT "state_name_code" UNIQUE ("name", "code"), CONSTRAINT "PK_549ffd046ebab1336c3a8030a12" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "measurement" ADD CONSTRAINT "FK_780e744499b8216e79daac77cc5" FOREIGN KEY ("beachId") REFERENCES "beach"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "beach" ADD CONSTRAINT "FK_eaae5d21954e78ea780b92b4c3c" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "city" ADD CONSTRAINT "FK_e99de556ee56afe72154f3ed04a" FOREIGN KEY ("stateId") REFERENCES "state"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "city" ADD CONSTRAINT "FK_473f9ba4b3863bf5356a05f0930" FOREIGN KEY ("countyId") REFERENCES "county"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "city" DROP CONSTRAINT "FK_473f9ba4b3863bf5356a05f0930"`);
        await queryRunner.query(`ALTER TABLE "city" DROP CONSTRAINT "FK_e99de556ee56afe72154f3ed04a"`);
        await queryRunner.query(`ALTER TABLE "beach" DROP CONSTRAINT "FK_eaae5d21954e78ea780b92b4c3c"`);
        await queryRunner.query(`ALTER TABLE "measurement" DROP CONSTRAINT "FK_780e744499b8216e79daac77cc5"`);
        await queryRunner.query(`DROP TABLE "state"`);
        await queryRunner.query(`DROP TABLE "city"`);
        await queryRunner.query(`DROP TABLE "beach"`);
        await queryRunner.query(`DROP TYPE "public"."beach_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ae1ff0ef48616f021bdded4590"`);
        await queryRunner.query(`DROP TABLE "measurement"`);
        await queryRunner.query(`DROP TYPE "public"."measurement_reason_enum"`);
        await queryRunner.query(`DROP TABLE "county"`);
    }

}
