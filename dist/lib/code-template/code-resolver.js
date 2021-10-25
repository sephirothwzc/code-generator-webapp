"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.send = void 0;
const lodash_1 = require("lodash");
const helper_1 = require("../utils/helper");
const findForeignKey = (tableItem, keyColumnList, inputCol = '') => {
    const txtImport = new Set();
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
    @Ctx() ctx: ExtendCtx
  ): Promise<Array<${(0, helper_1.pascalCase)(p.tableName)}Entity>> {
    if (!root.get('id')) {
      return undefined;
    }
    const service = await ctx.getServices<${(0, helper_1.pascalCase)(p.tableName)}Service>(ctx, '${(0, lodash_1.camelCase)(p.tableName)}Service');
    return service.findAll({ where: { 
            ${(0, lodash_1.camelCase)(p.columnName)}: root.get('id') 
          }});
  }
  `;
            }
            else {
                const fileName = p.referencedTableName.replace(/_/g, '-');
                txtImport.add(`import { ${(0, helper_1.pascalCase)(p.referencedTableName)}Service } from '../service/${fileName}.service';`);
            }
            return `  
  @FieldResolver(returns => ${(0, helper_1.pascalCase)(p.referencedTableName)}${inputCol}, { nullable: true })
  async ${(0, lodash_1.camelCase)(p.columnName)}Obj(
    @Root() root: ${(0, helper_1.pascalCase)(tableItem.tableName)}Entity,
    @Ctx() ctx: ExtendCtx
  ): Promise<${(0, helper_1.pascalCase)(p.referencedTableName)}Entity> {
    if (!root.get('${(0, lodash_1.camelCase)(p.columnName)}')) {
      return undefined;
    }
    const service = await ctx.getServices<${(0, helper_1.pascalCase)(p.referencedTableName)}Service>(ctx, '${(0, lodash_1.camelCase)(p.referencedTableName)}Service');
    return service.findByPk<${(0, helper_1.pascalCase)(p.referencedTableName)}Entity>(root.get('${(0, lodash_1.camelCase)(p.columnName)}'));
  }
${hasManyTemp}`;
        }
        else {
            if (p.referencedTableName !== p.tableName) {
                const fileName = p.tableName.replace(/_/g, '-');
                txtImport.add(`import { ${(0, helper_1.pascalCase)(p.tableName)}Entity } from '../lib/model/${fileName}.entity';`);
                txtImport.add(`import { ${(0, helper_1.pascalCase)(p.tableName)}${inputCol} } from '../graphql/${fileName}/${fileName}.gql';`);
                txtImport.add(`import { ${(0, helper_1.pascalCase)(p.tableName)}Service } from '../service/${fileName}.service';`);
            }
            return `
  @FieldResolver(returns => [${(0, helper_1.pascalCase)(p.tableName)}${inputCol}], { nullable: true })
  async  ${(0, lodash_1.camelCase)(p.tableName)}${(0, helper_1.pascalCase)(p.columnName)}(
    @Root() root: ${(0, helper_1.pascalCase)(tableItem.tableName)}Entity,
    @Ctx() ctx: ExtendCtx
  ): Promise<Array<${(0, helper_1.pascalCase)(p.tableName)}Entity>> {
    if (!root.get('id')) {
      return undefined;
    }
    const service = await ctx.getServices<${(0, helper_1.pascalCase)(p.tableName)}Service>(ctx, '${(0, lodash_1.camelCase)(p.tableName)}Service');
    return service.findAll({ where: { 
            ${(0, lodash_1.camelCase)(p.columnName)}: root.get('id') 
          }});
  }
  `;
        }
    })
        .join(``);
    return [columns, txtImport];
};
const modelTemplate = ({ className, funName, modelFileName, filedResolver, importFiled, }) => {
    return `import { Provide } from '@midwayjs/decorator';
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
import { ExtendCtx } from '../graphql/utils/extend-graphql.middleware';
${importFiled}

@Provide()
@Resolver(() => ${className})
export default class ${className}Resolver {

  @Query(type => Int)
  async ${funName}Count(
    @Arg('param', () => QueryListParam, { nullable: true })
    param: QueryListParam,
    @Ctx() ctx: ExtendCtx
  ): Promise<number> {
    const service = await ctx.getServices<${className}Service>(ctx, '${funName}Service');
    return service.findCount(param);
  }

  @Query(returns => ${className}List, { nullable: true })
  async ${funName}List(
    @Arg('param', type => QueryListParam, { nullable: true })
    param: QueryListParam,
    @Ctx() ctx: ExtendCtx
  ): Promise<{
    list: ${className}Entity[];
    count: number;
  }> {
    const service = await ctx.getServices<${className}Service>(ctx, '${funName}Service');
    return Bb.props({
      list: service.findAll(param),
      count: service.findCount(param),
    });
  }

  @Query(returns => ${className}, { nullable: true })
  async ${funName}(@Arg('id', type => ID) id: string,
    @Ctx() ctx: ExtendCtx): Promise<${className}Entity> {
    const service = await ctx.getServices<${className}Service>(ctx, '${funName}Service');
    return service.findByPk(id);
  }
  @Query(returns => [${className}])
  async ${funName}All(
    @Arg('param', type => QueryListParam, { nullable: true })
    param: QueryListParam,
    @Ctx() ctx: ExtendCtx
  ): Promise<Array<${className}>> {
    const service = await ctx.getServices<${className}Service>(ctx, '${funName}Service');
    return service.findAll(param) as any;
  }

  @Mutation(returns => ${className}, {
    name: '${funName}',
  })
  async ${funName}Save(
    @Arg('param', type => ${className}SaveIn) param: ${className}Entity,
    @Ctx() ctx: ExtendCtx
  ): Promise<${className}Entity> {
    const service = await ctx.getServices<${className}Service>(ctx, '${funName}Service');
    return service.save(param);
  }

  @Mutation(returns => [${className}], { nullable: true })
  async ${funName}Bulk(
    @Arg('param', type => [${className}SaveIn]) param: [${className}Entity],
    @Ctx() ctx: ExtendCtx
  ): Promise<${className}Entity[]> {
    const service = await ctx.getServices<${className}Service>(ctx, '${funName}Service');
    return service.bulkSave(param);
  }

  @Mutation(returns => String, { nullable: true })
  async ${funName}Destroy(@Arg('id', type => ID) id: string,
    @Ctx() ctx: ExtendCtx): Promise<string> {
    const service = await ctx.getServices<${className}Service>(ctx, '${funName}Service');
    return service.destroyById(id);
  }
  ${filedResolver}
}
`;
};
const send = ({ tableItem, keyColumnList }) => {
    const [filedResolver, importFiled] = findForeignKey(tableItem, keyColumnList);
    return modelTemplate({
        className: (0, helper_1.pascalCase)(tableItem.tableName),
        funName: (0, lodash_1.camelCase)(tableItem.tableName),
        modelFileName: tableItem.tableName.replace(/_/g, '-'),
        filedResolver,
        importFiled: Array.from(importFiled).join(''),
    });
};
exports.send = send;
//# sourceMappingURL=code-resolver.js.map