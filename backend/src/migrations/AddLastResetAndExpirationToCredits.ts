import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddLastResetAndExpirationToCredits1698765432100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('credits', [
      new TableColumn({
        name: 'lastReset',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'expirationDate',
        type: 'timestamp',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('credits', ['lastReset', 'expirationDate']);
  }
}
