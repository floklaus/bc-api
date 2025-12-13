import { MigrationInterface, QueryRunner } from "typeorm";

export class FixMeasurementUniqueConstraint1734098400000 implements MigrationInterface {
    name = 'FixMeasurementUniqueConstraint1734098400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the old constraint. We use queryRunner to inspect or just try dropping it.
        // The previous constraint was explicitly named "measurement_asOf_beach" in the entity, but let's confirm.
        // If created by TypeORM sync/migration, it might have a generated name if not named explicitly previously.
        // But the previous file showed @Unique("measurement_asOf_beach", ...) so it should be named that.

        // However, sometimes TypeORM names unique constraints on tables differently than indices.
        // Let's assume the name "measurement_asOf_beach" is the constraint name.

        await queryRunner.query(`ALTER TABLE "measurement" DROP CONSTRAINT "measurement_asOf_beach"`);
        await queryRunner.query(`ALTER TABLE "measurement" ADD CONSTRAINT "measurement_asOf_beach" UNIQUE ("asOf", "beachId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "measurement" DROP CONSTRAINT "measurement_asOf_beach"`);
        await queryRunner.query(`ALTER TABLE "measurement" ADD CONSTRAINT "measurement_asOf_beach" UNIQUE ("asOf", "beachId", "indicatorLevel")`);
    }
}
