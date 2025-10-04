"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddLastResetAndExpirationToCredits1698765432100 = void 0;
const typeorm_1 = require("typeorm");
class AddLastResetAndExpirationToCredits1698765432100 {
    async up(queryRunner) {
        await queryRunner.addColumns('credits', [
            new typeorm_1.TableColumn({
                name: 'lastReset',
                type: 'timestamp',
                isNullable: true,
            }),
            new typeorm_1.TableColumn({
                name: 'expirationDate',
                type: 'timestamp',
                isNullable: true,
            }),
        ]);
    }
    async down(queryRunner) {
        await queryRunner.dropColumns('credits', ['lastReset', 'expirationDate']);
    }
}
exports.AddLastResetAndExpirationToCredits1698765432100 = AddLastResetAndExpirationToCredits1698765432100;
