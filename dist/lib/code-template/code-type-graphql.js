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
let hasColJson = '';
const findTypeTxt = (p) => {
    switch (p.dataType) {
        case 'bigint':
        case 'nvarchar':
        case 'varchar':
            return [
                'String',
                'string',
                ['@IsString()', `@MaxLength(${p.characterMaximumLength})`],
                ['IsString', 'MaxLength'],
            ];
        case 'timestamp':
            return ['GraphQLTimestamp', 'string', ['@IsDate()'], ['IsDate']];
        case 'int':
            return ['Int', 'number', ['@IsInt()'], ['IsInt']];
        case 'decimal':
        case 'double':
            return ['Float', 'number', ['@IsNumber()'], ['IsNumber']];
        case 'datetime':
            return ['GraphQLISODateTime', 'Date', ['@IsDate()'], ['IsDate']];
        case 'boolean':
        case 'tinyint':
            return ['Boolean', 'boolean', ['@IsBoolean()'], ['IsBoolean']];
        case 'json':
            hasColJson = `import { GraphQLJSONObject } from 'graphql-type-json';`;
            return ['GraphQLJSONObject', 'Record<string, any>', ['@IsObject()'], ['IsObject']];
        default:
            return ['String', 'string', ['@IsString()'], ['IsString']];
    }
};
const findForeignKey = (tableItem, keyColumnList) => {
    const txtImport = new Set();
    const columns = keyColumnList
        .map((p) => {
        if (p.tableName === tableItem.tableName) {
            if (p.referencedTableName !== p.tableName) {
                const fileName = p.referencedTableName.replace(/_/g, '-');
                txtImport.add(`import { ${(0, lodash_1.capitalize)(p.referencedTableName)}Entity } from './${fileName}.entity';`);
                txtImport.add(`import {  ${(0, lodash_1.capitalize)(p.referencedTableName)} } from '../${fileName}/${fileName}.gql';`);
            }
            let hasManyTemp = '';
            if (p.referencedTableName === tableItem.tableName) {
                hasManyTemp = `
  @Field(() => ${(0, lodash_1.capitalize)(p.referencedTableName)}, { nullable: true })
  ${(0, lodash_1.camelCase)(p.tableName)}${(0, lodash_1.capitalize)(p.columnName)}: Array<${(0, lodash_1.capitalize)(p.tableName)}Entity>;
`;
            }
            return `
  @Field(() => ${(0, lodash_1.capitalize)(p.referencedTableName)}, { nullable: true })
  ${(0, lodash_1.capitalize)(p.columnName)}Obj: ${(0, lodash_1.capitalize)(p.referencedTableName)}Entity;
${hasManyTemp}`;
        }
        else {
            if (p.referencedTableName !== p.tableName) {
                const fileName = p.tableName.replace(/_/g, '-');
                txtImport.add(`import { ${(0, lodash_1.capitalize)(p.tableName)}Entity } from './${fileName}.entity';`);
                txtImport.add(`import {  ${(0, lodash_1.capitalize)(p.tableName)} } from '../${fileName}/${fileName}.gql';`);
            }
            return `
  @Field(() => ${(0, lodash_1.capitalize)(p.tableName)}, { nullable: true })
  ${(0, lodash_1.camelCase)(p.tableName)}${(0, lodash_1.capitalize)(p.columnName)}: Array<${(0, lodash_1.capitalize)(p.tableName)}Entity>;
`;
        }
    })
        .join(``);
    return [columns, txtImport];
};
const findColumn = (columnList, tableItem, keyColumnList) => {
    const validateImport = new Set();
    const gqlTypeImport = new Set();
    const normal = columnList
        .filter((p) => !notColumn.includes(p.columnName))
        .map((p) => {
        const [gqlType, type, valType, validateImp] = findTypeTxt(p);
        validateImp.forEach((v) => validateImport.add(v));
        gqlTypeImport.add(gqlType);
        const propertyName = (0, lodash_1.camelCase)(p.columnName);
        const comment = p.columnComment || p.columnName;
        const nullable = p.isNullable === 'YES' ? '?' : '';
        const gqlNullable = p.isNullable === 'YES' ? 'nullable: true ' : '';
        return `  /**
   * ${comment}
   */${valType.join(`
   `)}  
    @Field(() => ${gqlType}, {
    description: '${comment}',${gqlNullable}
  })
  ${propertyName}${nullable}: ${type};
`;
    });
    const [columns, txtImport] = findForeignKey(tableItem, keyColumnList);
    return [
        [...normal, columns].join(''),
        Array.from(txtImport).join(''),
        Array.from(gqlTypeImport)
            .filter((p) => !['String', 'Boolean', 'GraphQLJSONObject'].includes(p))
            .join(', '),
        Array.from(validateImport).join(','),
    ];
};
const send = ({ columnList, tableItem, keyColumnList }) => {
    const [columns, txtImport, typeImport, valImport] = findColumn(columnList, tableItem, keyColumnList);
    return modelTemplate({
        className: (0, lodash_1.capitalize)(tableItem.tableName),
        columns: (0, lodash_1.toString)(columns),
        txtImport: txtImport,
        typeImport: typeImport,
        validatorImport: valImport,
    });
};
exports.send = send;
const modelTemplate = ({ className, columns, txtImport, typeImport, validatorImport, }) => {
    const txt = `import { Field, ID, ObjectType, InputType, ${typeImport} } from 'type-graphql';${txtImport}${hasColJson}
import { ${validatorImport} } from 'class-validator';
import {
  GqlInputTypeBase,
  GqlObjectTypeBase,
} from '../../lib/base/gql-type.base';

@ObjectType()
export default class ${className} extends GqlObjectTypeBase {
  ${columns}
}

@ObjectType()
export class ${className}List {
  @Field(() => [${className}], { nullable: true })
  list: Array<${className}>;

  @Field(() => Int, { nullable: true })
  count: number;
}

@InputType()
export class ${className}SaveIn extends GqlInputTypeBase {
  ${columns}
}

`;
    return txt;
};
//# sourceMappingURL=code-type-graphql.js.map