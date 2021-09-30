import { IQueryColumnOut, IQueryKeyColumnOut, IQueryTableOut } from '../code-generator';
import { capitalize, camelCase, toString } from 'lodash';

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

const findTypeTxt = (p: IQueryColumnOut): string => {
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

/**
 * 根据key生成主外建对象 增加 import
 * @param {*} typeString
 * @param {*} enumTypeName
 * @param {*} sequelizeType
 * @param {*} columnRow
 */
const findForeignKey = (tableItem: IQueryTableOut, keyColumnList: IQueryKeyColumnOut[]) => {
  const txtImport = new Set();
  let importBelongsTo = false;
  let importHasManyTo = false;
  const columns = keyColumnList
    .map((p) => {
      if (p.tableName === tableItem.tableName) {
        p.referencedTableName !== p.tableName &&
          txtImport.add(
            `import { ${capitalize(
              p.referencedTableName
            )} } from './${p.referencedTableName.replace(/_/g, '-')}.entity';`
          );
        importBelongsTo = true;
        let hasManyTemp = '';
        // 自我关联
        if (p.referencedTableName === tableItem.tableName) {
          importHasManyTo = true;
          hasManyTemp = `
  @HasMany(() => ${capitalize(p.tableName)}, '${p.columnName}')
  ${camelCase(p.tableName)}${capitalize(p.columnName)}: Array<${capitalize(p.tableName)}>;
`;
        }
        // 子表 外键 BelongsTo
        return `
  @BelongsTo(() => ${capitalize(p.referencedTableName)}, '${p.columnName}')
  ${capitalize(p.columnName)}Obj: ${capitalize(p.referencedTableName)};
${hasManyTemp}`;
      } else {
        p.referencedTableName !== p.tableName &&
          txtImport.add(
            `import { ${capitalize(p.tableName)} } from './${p.tableName.replace(
              /_/g,
              '-'
            )}.entity';`
          );
        importHasManyTo = true;
        // 主表 主键 Hasmany
        return `
  @HasMany(() => ${capitalize(p.tableName)}, '${p.columnName}')
  ${camelCase(p.tableName)}${capitalize(p.columnName)}: Array<${capitalize(p.tableName)}>;
`;
      }
    })
    .join(``);
  return [columns, txtImport, importBelongsTo, importHasManyTo];
};

const findColumn = (
  columnList: IQueryColumnOut[],
  tableItem: IQueryTableOut,
  keyColumnList: IQueryKeyColumnOut[]
) => {
  let importForeignKeyTo = false;
  const normal = columnList
    .filter((p) => !notColumn.includes(p.columnName))
    .map((p) => {
      const type = findTypeTxt(p);
      const propertyName = camelCase(p.columnName);
      const comment = p.columnComment || p.columnName;

      const nullable = p.isNullable === 'YES' ? '?' : '';

      const foreignKey = keyColumnList.find(
        (columnRow) =>
          columnRow.tableName === tableItem.tableName && columnRow.columnName === p.columnName
      );
      // 不需要引入 因为obj 时候会单独处理
      const foreignKeyTxt = foreignKey
        ? `
  @ForeignKey(() => ${capitalize(foreignKey.referencedTableName)})`
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
  const [columns, txtImport, importBelongsTo, importHasManyTo] = findForeignKey(
    tableItem,
    keyColumnList
  );
  return [
    [...normal, columns].join(''),
    txtImport,
    importBelongsTo,
    importHasManyTo,
    importForeignKeyTo,
  ];
};

export const send = (
  columnList: Array<IQueryColumnOut>,
  tableItem: IQueryTableOut,
  keyColumnList: Array<IQueryKeyColumnOut>
) => {
  const [columns, txtImport, importBelongsTo, importHasManyTo, importForeignKeyTo] = findColumn(
    columnList,
    tableItem,
    keyColumnList
  );

  const seuqliezeTypeImport = new Set(['Column', 'Model']);
  importBelongsTo && seuqliezeTypeImport.add('BelongsTo');
  importHasManyTo && seuqliezeTypeImport.add('HasMany');
  importForeignKeyTo && seuqliezeTypeImport.add('ForeignKey');

  return modelTemplate({
    className: capitalize(tableItem.tableName),
    columns: toString(columns),
    txtImport: Array.from(txtImport as Set<string>).join(''),
    seuqliezeTypeImport: Array.from(seuqliezeTypeImport).join(','),
  });
};

const modelTemplate = ({
  className,
  columns,
  txtImport,
  seuqliezeTypeImport,
}: {
  className: string;
  columns: string;
  txtImport: string;
  seuqliezeTypeImport: string;
}): string => {
  const txt = `import { ${seuqliezeTypeImport} } from 'sequelize-typescript';
import { BaseTable } from '@midwayjs/sequelize';${txtImport}

@BaseTable
export class ${className} extends Model {
${columns}
}

`;
  return txt;
};
