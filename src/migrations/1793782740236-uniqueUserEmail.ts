import { MigrationInterface, QueryRunner } from "typeorm";

export class UniqueUserEmail1793782740236 implements MigrationInterface {
    name = 'UniqueUserEmail1793782740236'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_users_email" ON "users" ("email")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "UQ_users_email"`);
    }

}
