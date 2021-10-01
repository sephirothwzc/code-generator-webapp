"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.send = void 0;
const lodash_1 = require("lodash");
const notColumn = [
    'id',
    'created_at',
    'updated_at',
    'deleted_at',
    'created_user',
    'updated_user',
    'created_id',
    'updated_id',
    'deleted_id',
    'i18n',
];
const findTypeTxt = (p) => {
    switch (p.dataType) {
        case 'bigint':
        case 'nvarchar':
        case 'varchar':
            return 'string';
        case 'timestamp':
        case 'int':
        case 'decimal':
        case 'double':
            return `number`;
        case 'datetime':
            return `Date`;
        case 'boolean':
        case 'tinyint':
            return 'boolean';
        case 'json':
            return 'Record<string, any>';
        default:
            return 'string';
    }
};
const findForeignKey = (tableItem, keyColumnList) => {
    const txtImport = new Set();
    let importBelongsTo = false;
    let importHasManyTo = false;
    const columns = keyColumnList
        .map((p) => {
        if (p.tableName === tableItem.tableName) {
            p.referencedTableName !== p.tableName &&
                txtImport.add(`import { ${(0, lodash_1.capitalize)(p.referencedTableName)} } from './${p.referencedTableName.replace(/_/g, '-')}.entity';`);
            importBelongsTo = true;
            let hasManyTemp = '';
            if (p.referencedTableName === tableItem.tableName) {
                importHasManyTo = true;
                hasManyTemp = `
  @HasMany(() => ${(0, lodash_1.capitalize)(p.tableName)}, '${p.columnName}')
  ${(0, lodash_1.camelCase)(p.tableName)}${(0, lodash_1.capitalize)(p.columnName)}: Array<${(0, lodash_1.capitalize)(p.tableName)}>;
`;
            }
            return `
  @BelongsTo(() => ${(0, lodash_1.capitalize)(p.referencedTableName)}, '${p.columnName}')
  ${(0, lodash_1.capitalize)(p.columnName)}Obj: ${(0, lodash_1.capitalize)(p.referencedTableName)};
${hasManyTemp}`;
        }
        else {
            p.referencedTableName !== p.tableName &&
                txtImport.add(`import { ${(0, lodash_1.capitalize)(p.tableName)} } from './${p.tableName.replace(/_/g, '-')}.entity';`);
            importHasManyTo = true;
            return `
  @HasMany(() => ${(0, lodash_1.capitalize)(p.tableName)}, '${p.columnName}')
  ${(0, lodash_1.camelCase)(p.tableName)}${(0, lodash_1.capitalize)(p.columnName)}: Array<${(0, lodash_1.capitalize)(p.tableName)}>;
`;
        }
    })
        .join(``);
    return [columns, txtImport, importBelongsTo, importHasManyTo];
};
const findColumn = (columnList, tableItem, keyColumnList) => {
    let importForeignKeyTo = false;
    const normal = columnList
        .filter((p) => !notColumn.includes(p.columnName))
        .map((p) => {
        const type = findTypeTxt(p);
        const propertyName = (0, lodash_1.camelCase)(p.columnName);
        const comment = p.columnComment || p.columnName;
        const nullable = p.isNullable === 'YES' ? '?' : '';
        const foreignKey = keyColumnList.find((columnRow) => columnRow.tableName === tableItem.tableName && columnRow.columnName === p.columnName);
        const foreignKeyTxt = foreignKey
            ? `
  @ForeignKey(() => ${(0, lodash_1.capitalize)(foreignKey.referencedTableName)})`
            : '';
        foreignKeyTxt && (importForeignKeyTo = true);
        return `  /**
   * ${comment}
   */${foreignKeyTxt}
   @Column({
    comment: '${comment}',
  })
  ${propertyName}${nullable}: ${type};
`;
    });
    const [columns, txtImport, importBelongsTo, importHasManyTo] = findForeignKey(tableItem, keyColumnList);
    const idColumn = `@Column({
    primaryKey: true,
    autoIncrement: false,
    defaultValue: () => StaticSnowFlake.next(),
  })
  id: string;
`;
    return [
        [idColumn, ...normal, columns].join(''),
        txtImport,
        importBelongsTo,
        importHasManyTo,
        importForeignKeyTo,
    ];
};
const send = (columnList, tableItem, keyColumnList) => {
    const [columns, txtImport, importBelongsTo, importHasManyTo, importForeignKeyTo] = findColumn(columnList, tableItem, keyColumnList);
    const seuqliezeTypeImport = new Set(['Column', 'Model']);
    importBelongsTo && seuqliezeTypeImport.add('BelongsTo');
    importHasManyTo && seuqliezeTypeImport.add('HasMany');
    importForeignKeyTo && seuqliezeTypeImport.add('ForeignKey');
    return modelTemplate({
        className: (0, lodash_1.capitalize)(tableItem.tableName),
        columns: (0, lodash_1.toString)(columns),
        txtImport: Array.from(txtImport).join(''),
        seuqliezeTypeImport: Array.from(seuqliezeTypeImport).join(','),
    });
};
exports.send = send;
const modelTemplate = ({ className, columns, txtImport, seuqliezeTypeImport, }) => {
    const txt = `import { ${seuqliezeTypeImport} } from 'sequelize-typescript';
import { StaticSnowFlake } from '../utils/flake-id';
import { BaseTable } from '@midwayjs/sequelize';${txtImport}

@BaseTable
export class ${className} extends Model {
${columns}
}

`;
    return txt;
};
//# sourceMappingURL=code-entity.js.map