"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.send = void 0;
const lodash_1 = require("lodash");
const helper_1 = require("../utils/helper");
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
                txtImport.add(`import { ${(0, helper_1.pascalCase)(p.referencedTableName)}Entity } from './${p.referencedTableName.replace(/_/g, '-')}.entity';`);
            importBelongsTo = true;
            let hasManyTemp = '';
            if (p.referencedTableName === tableItem.tableName) {
                importHasManyTo = true;
                hasManyTemp = `
  @HasMany(() => ${(0, helper_1.pascalCase)(p.tableName)}Entity, '${p.columnName}')
  ${(0, lodash_1.camelCase)(p.tableName)}${(0, helper_1.pascalCase)(p.columnName)}: Array<${(0, helper_1.pascalCase)(p.tableName)}>;
`;
            }
            return `
  @BelongsTo(() => ${(0, helper_1.pascalCase)(p.referencedTableName)}Entity, '${p.columnName}')
  ${(0, helper_1.pascalCase)(p.columnName)}Obj: ${(0, helper_1.pascalCase)(p.referencedTableName)}Entity;
${hasManyTemp}`;
        }
        else {
            p.referencedTableName !== p.tableName &&
                txtImport.add(`import { ${(0, helper_1.pascalCase)(p.tableName)}Entity } from './${p.tableName.replace(/_/g, '-')}.entity';`);
            importHasManyTo = true;
            return `
  @HasMany(() => ${(0, helper_1.pascalCase)(p.tableName)}Entity, '${p.columnName}')
  ${(0, lodash_1.camelCase)(p.tableName)}${(0, helper_1.pascalCase)(p.columnName)}: Array<${(0, helper_1.pascalCase)(p.tableName)}Entity>;
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
  @ForeignKey(() => ${(0, helper_1.pascalCase)(foreignKey.referencedTableName)}Entity)`
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
    const constTxt = columnList
        .filter((p) => !notColumn.includes(p.columnName))
        .map((p) => {
        return `
  /**
   * ${p.columnComment}
   */
  public static readonly ${(0, lodash_1.toUpper)(p.columnName)} = '${(0, lodash_1.camelCase)(p.columnName)}';
`;
    });
    const [columns, txtImport, importBelongsTo, importHasManyTo] = findForeignKey(tableItem, keyColumnList);
    return [
        [...normal, columns].join(''),
        txtImport,
        importBelongsTo,
        importHasManyTo,
        importForeignKeyTo,
        constTxt.join(''),
    ];
};
const send = ({ columnList, tableItem, keyColumnList }) => {
    const [columns, txtImport, importBelongsTo, importHasManyTo, importForeignKeyTo, constTxt] = findColumn(columnList, tableItem, keyColumnList);
    const seuqliezeTypeImport = new Set(['Column']);
    importBelongsTo && seuqliezeTypeImport.add('BelongsTo');
    importHasManyTo && seuqliezeTypeImport.add('HasMany');
    importForeignKeyTo && seuqliezeTypeImport.add('ForeignKey');
    return modelTemplate({
        tableName: tableItem.tableName,
        className: (0, helper_1.pascalCase)(tableItem.tableName),
        columns: (0, lodash_1.toString)(columns),
        txtImport: Array.from(txtImport).join(''),
        seuqliezeTypeImport: Array.from(seuqliezeTypeImport).join(','),
        constTxt: constTxt,
    });
};
exports.send = send;
const modelTemplate = ({ tableName, className, columns, txtImport, seuqliezeTypeImport, constTxt, }) => {
    const txt = `import { ${seuqliezeTypeImport} } from 'sequelize-typescript';
import { EntityBase, ENTITY_BASE } from '../base/entity.base';
import { BaseTable } from '@midwayjs/sequelize';${txtImport}

@BaseTable({ tableName: '${tableName}' })
export class ${className}Entity extends EntityBase {
${columns}
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
export class ${(0, lodash_1.toUpper)(tableName)} extends ENTITY_BASE {
${constTxt}
}
`;
    return txt;
};
//# sourceMappingURL=code-entity.js.map