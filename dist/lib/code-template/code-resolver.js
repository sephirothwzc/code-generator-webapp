"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.send = void 0;
const lodash_1 = require("lodash");
const helper_1 = require("../utils/helper");
const findForeignKey = (tableItem, keyColumnList, inputCol = '') => {
    const txtImport = new Set();
    const injectService = new Set();
    const columns = keyColumnList
        .map((p) => {
        if (p.tableName === tableItem.tableName) {
            if (p.referencedTableName !== p.tableName) {
                const fileName = p.referencedTableName.replace(/_/g, '-');
                txtImport.add(`import { ${(0, helper_1.pascalCase)(p.referencedTableName)}Entity } from '../lib/model/${fileName}.entity';`);
                txtImport.add(`import { ${(0, helper_1.pascalCase)(p.referencedTableName)}${inputCol} } from '../graphql/${fileName}/${fileName}.gql';`);
            }
            let hasManyTemp = '';
            if (p.referencedTableName === tableItem.tableName) {
                hasManyTemp = `
  @FieldResolver(returns => [${(0, helper_1.pascalCase)(p.referencedTableName)}${inputCol}], { nullable: true })
  async  ${(0, lodash_1.camelCase)(p.tableName)}${(0, helper_1.pascalCase)(p.columnName)}(
    @Root() root: ${(0, helper_1.pascalCase)(tableItem.tableName)}Entity,
    @Ctx() ctx: Context
  ): Promise<Array<${(0, helper_1.pascalCase)(p.tableName)}Entity>> {
    if (!root.get('id')) {
      return undefined;
    }
    return this.${(0, lodash_1.camelCase)(p.tableName)}Service.findAll({ where: { 
            ${(0, lodash_1.camelCase)(p.columnName)}: root.get('id') 
          }});
  }
  `;
            }
            else {
                const fileName = p.referencedTableName.replace(/_/g, '-');
                txtImport.add(`import { ${(0, helper_1.pascalCase)(p.referencedTableName)}Service } from '../service/${fileName}.service';`);
                injectService.add(`  @Inject()
  ${(0, lodash_1.camelCase)(p.referencedTableName)}Service: ${(0, helper_1.pascalCase)(p.referencedTableName)}Service;
`);
            }
            return `  
  @FieldResolver(returns => ${(0, helper_1.pascalCase)(p.referencedTableName)}${inputCol}, { nullable: true })
  async ${(0, lodash_1.camelCase)(p.columnName)}Obj(
    @Root() root: ${(0, helper_1.pascalCase)(tableItem.tableName)}Entity,
    @Ctx() ctx: Context
  ): Promise<${(0, helper_1.pascalCase)(p.referencedTableName)}Entity> {
    if (!root.get('${(0, lodash_1.camelCase)(p.columnName)}')) {
      return undefined;
    }
    return this.${(0, lodash_1.camelCase)(p.referencedTableName)}Service.findByPk<${(0, helper_1.pascalCase)(p.referencedTableName)}Entity>(root.get('${(0, lodash_1.camelCase)(p.columnName)}'));
  }
${hasManyTemp}`;
        }
        else {
            if (p.referencedTableName !== p.tableName) {
                const fileName = p.tableName.replace(/_/g, '-');
                txtImport.add(`import { ${(0, helper_1.pascalCase)(p.tableName)}Entity } from '../lib/model/${fileName}.entity';`);
                txtImport.add(`import { ${(0, helper_1.pascalCase)(p.tableName)}${inputCol} } from '../graphql/${fileName}/${fileName}.gql';`);
                txtImport.add(`import { ${(0, helper_1.pascalCase)(p.tableName)}Service } from '../service/${fileName}.service';`);
                injectService.add(`  @Inject()
  ${(0, lodash_1.camelCase)(p.tableName)}Service: ${(0, helper_1.pascalCase)(p.tableName)}Service;
`);
            }
            return `
  @FieldResolver(returns => [${(0, helper_1.pascalCase)(p.tableName)}${inputCol}], { nullable: true })
  async  ${(0, lodash_1.camelCase)(p.tableName)}${(0, helper_1.pascalCase)(p.columnName)}(
    @Root() root: ${(0, helper_1.pascalCase)(tableItem.tableName)}Entity,
    @Ctx() ctx: Context
  ): Promise<Array<${(0, helper_1.pascalCase)(p.tableName)}Entity>> {
    if (!root.get('id')) {
      return undefined;
    }
    return this.${(0, lodash_1.camelCase)(p.tableName)}Service.findAll({ where: { 
            ${(0, lodash_1.camelCase)(p.columnName)}: root.get('id') 
          }});
  }
  `;
        }
    })
        .join(``);
    if (columns) {
        txtImport.add(`import { Context } from '@midwayjs/koa';`);
    }
    return [columns, txtImport, injectService];
};
const modelTemplate = ({ className, funName, modelFileName, filedResolver, importFiled, injectService, }) => {
    return `import { Provide, Inject } from '@midwayjs/decorator';
import ResolverBase from '../lib/base/resolver.base';
import Bb from 'bluebird';
import { Resolver, Query, Arg, Int, Mutation, ID ${filedResolver ? ',FieldResolver, Root, Ctx' : ''} } from 'type-graphql';
import {
  ${className},
  ${className}SaveIn,
  ${className}List,
} from '../graphql/${modelFileName}/${modelFileName}.gql';
import QueryListParam from '../graphql/utils/query-list-param.gql';
import { ${className}Service } from '../service/${modelFileName}.service';
import { ${className}Entity } from '../lib/model/${modelFileName}.entity';
${importFiled}

@Provide()
@Resolver(() => ${className})
export default class ${className}Resolver extends ResolverBase {
  @Inject()
  ${funName}Service: ${className}Service;
  ${injectService}

  @Query(type => Int)
  async ${funName}Count(
    @Arg('param', () => QueryListParam, { nullable: true })
    param: QueryListParam
  ): Promise<number> {
    return this.${funName}Service.findCount(param);
  }

  @Query(returns => ${className}List, { nullable: true })
  async ${funName}List(
    @Arg('param', type => QueryListParam, { nullable: true })
    param: QueryListParam
  ): Promise<{
    list: ${className}Entity[];
    count: number;
  }> {
    return Bb.props({
      list: this.${funName}Service.findAll(param),
      count: this.${funName}Service.findCount(param),
    });
  }

  @Query(returns => ${className}, { nullable: true })
  async ${funName}(@Arg('id', type => ID) id: string): Promise<${className}Entity> {
    return this.${funName}Service.findByPk(id);
  }
  @Query(returns => [${className}])
  async ${funName}All(
    @Arg('param', type => QueryListParam, { nullable: true })
    param: QueryListParam
  ): Promise<Array<${className}>> {
    return this.${funName}Service.findAll(param) as any;
  }

  @Mutation(returns => ${className}, {
    name: '${funName}',
  })
  async ${funName}Save(
    @Arg('param', type => ${className}SaveIn) param: ${className}Entity
  ): Promise<${className}Entity> {
    return this.${funName}Service.save(param);
  }

  @Mutation(returns => [${className}], { nullable: true })
  async ${funName}Bulk(
    @Arg('param', type => [${className}SaveIn]) param: [${className}Entity]
  ): Promise<${className}Entity[]> {
    return this.${funName}Service.bulkSave(param);
  }

  @Mutation(returns => String, { nullable: true })
  async ${funName}Destroy(@Arg('id', type => ID) id: string): Promise<string> {
    return this.${funName}Service.destroyById(id);
  }
  ${filedResolver}
}
`;
};
const send = ({ tableItem, keyColumnList }) => {
    const [filedResolver, importFiled, injectService] = findForeignKey(tableItem, keyColumnList);
    return modelTemplate({
        className: (0, helper_1.pascalCase)(tableItem.tableName),
        funName: (0, lodash_1.camelCase)(tableItem.tableName),
        modelFileName: tableItem.tableName.replace(/_/g, '-'),
        filedResolver,
        importFiled: Array.from(importFiled).join(''),
        injectService: Array.from(injectService).join(''),
    });
};
exports.send = send;
//# sourceMappingURL=code-resolver.js.map