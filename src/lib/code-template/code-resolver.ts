import { camelCase } from 'lodash';
import { IQueryKeyColumnOut, IQueryTableOut, ISend } from '../code-generator';
import { pascalCase } from '../utils/helper';

/**
 * 根据key生成主外建对象 增加 import
 * @param {*} typeString
 * @param {*} enumTypeName
 * @param {*} sequelizeType
 * @param {*} columnRow
 */
const findForeignKey = (
  tableItem: IQueryTableOut,
  keyColumnList: IQueryKeyColumnOut[],
  inputCol = ''
): [string, Set<string>] => {
  const txtImport = new Set<string>();
  const columns = keyColumnList
    .map((p) => {
      if (p.tableName === tableItem.tableName) {
        if (p.referencedTableName !== p.tableName) {
          const fileName = p.referencedTableName.replace(/_/g, '-');
          txtImport.add(
            `import { ${pascalCase(
              p.referencedTableName
            )}Entity } from '../lib/model/${fileName}.entity';`
          );
          txtImport.add(
            `import { ${pascalCase(
              p.referencedTableName
            )}${inputCol} } from '../graphql/${fileName}/${fileName}.gql';`
          );
        }
        let hasManyTemp = '';
        // 自我关联
        if (p.referencedTableName === tableItem.tableName) {
          hasManyTemp = `
  @FieldResolver(returns => [${pascalCase(p.referencedTableName)}${inputCol}], { nullable: true })
  async  ${camelCase(p.tableName)}${pascalCase(p.columnName)}(
    @Root() root: ${pascalCase(tableItem.tableName)}Entity,
    @Ctx() ctx: ExtendCtx
  ): Promise<Array<${pascalCase(p.tableName)}Entity>> {
    if (!root.get('id')) {
      return undefined;
    }
    const service = await ctx.reqCtx.requestContext.getAsync<${pascalCase(
      p.tableName
    )}Service>('${camelCase(p.tableName)}Service');
    return service.findAll({ where: { 
            ${camelCase(p.columnName)}: root.get('id') 
          }});
  }
  `;
        } else {
          const fileName = p.referencedTableName.replace(/_/g, '-');
          txtImport.add(
            `import { ${pascalCase(
              p.referencedTableName
            )}Service } from '../service/${fileName}.service';`
          );
        }
        // 子表 外键 BelongsTo
        return `  
  @FieldResolver(returns => ${pascalCase(p.referencedTableName)}${inputCol}, { nullable: true })
  async ${camelCase(p.columnName)}Obj(
    @Root() root: ${pascalCase(tableItem.tableName)}Entity,
    @Ctx() ctx: ExtendCtx
  ): Promise<${pascalCase(p.referencedTableName)}Entity> {
    if (!root.get('${camelCase(p.columnName)}')) {
      return undefined;
    }
    const service = await ctx.reqCtx.requestContext.getAsync<${pascalCase(
      p.referencedTableName
    )}Service>('${camelCase(p.referencedTableName)}Service');
    return service.findByPk<${pascalCase(p.referencedTableName)}Entity>(root.get('${camelCase(
          p.columnName
        )}'));
  }
${hasManyTemp}`;
      } else {
        if (p.referencedTableName !== p.tableName) {
          const fileName = p.tableName.replace(/_/g, '-');
          txtImport.add(
            `import { ${pascalCase(p.tableName)}Entity } from '../lib/model/${fileName}.entity';`
          );
          txtImport.add(
            `import { ${pascalCase(
              p.tableName
            )}${inputCol} } from '../graphql/${fileName}/${fileName}.gql';`
          );
          txtImport.add(
            `import { ${pascalCase(p.tableName)}Service } from '../service/${fileName}.service';`
          );
        }

        // 主表 主键 Hasmany
        return `
  @FieldResolver(returns => [${pascalCase(p.tableName)}${inputCol}], { nullable: true })
  async  ${camelCase(p.tableName)}${pascalCase(p.columnName)}(
    @Root() root: ${pascalCase(tableItem.tableName)}Entity,
    @Ctx() ctx: ExtendCtx
  ): Promise<Array<${pascalCase(p.tableName)}Entity>> {
    if (!root.get('id')) {
      return undefined;
    }
    const service = await ctx.reqCtx.requestContext.getAsync<${pascalCase(
      p.tableName
    )}Service>('${camelCase(p.tableName)}Service');
    return service.findAll({ where: { 
            ${camelCase(p.columnName)}: root.get('id') 
          }});
  }
  `;
      }
    })
    .join(``);

  return [columns, txtImport];
};

const modelTemplate = ({
  className,
  funName,
  modelFileName,
  filedResolver,
  importFiled,
}: {
  className: string;
  funName: string;
  modelFileName: string;
  filedResolver: string;
  importFiled: string;
}) => {
  return `import { Provide } from '@midwayjs/decorator';
import Bb from 'bluebird';
import { Resolver, Query, Arg, Int, Mutation, ID ${
    filedResolver ? ',FieldResolver, Root, Ctx' : ''
  } } from 'type-graphql';
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
    const service = await ctx.reqCtx.requestContext.getAsync<${className}Service>('${funName}Service');
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
    const service = await ctx.reqCtx.requestContext.getAsync<${className}Service>('${funName}Service');
    return Bb.props({
      list: service.findAll(param),
      count: service.findCount(param),
    });
  }

  @Query(returns => ${className}, { nullable: true })
  async ${funName}(@Arg('id', type => ID) id: string,
    @Ctx() ctx: ExtendCtx): Promise<${className}Entity> {
    const service = await ctx.reqCtx.requestContext.getAsync<${className}Service>('${funName}Service');
    return service.findByPk(id);
  }
  @Query(returns => [${className}])
  async ${funName}All(
    @Arg('param', type => QueryListParam, { nullable: true })
    param: QueryListParam,
    @Ctx() ctx: ExtendCtx
  ): Promise<Array<${className}>> {
    const service = await ctx.reqCtx.requestContext.getAsync<${className}Service>('${funName}Service');
    return service.findAll(param) as any;
  }

  @Mutation(returns => ${className}, {
    name: '${funName}',
  })
  async ${funName}Save(
    @Arg('param', type => ${className}SaveIn) param: ${className}Entity,
    @Ctx() ctx: ExtendCtx
  ): Promise<${className}Entity> {
    const service = await ctx.reqCtx.requestContext.getAsync<${className}Service>('${funName}Service');
    return service.save(param);
  }

  @Mutation(returns => [${className}], { nullable: true })
  async ${funName}Bulk(
    @Arg('param', type => [${className}SaveIn]) param: [${className}Entity],
    @Ctx() ctx: ExtendCtx
  ): Promise<${className}Entity[]> {
    const service = await ctx.reqCtx.requestContext.getAsync<${className}Service>('${funName}Service');
    return service.bulkSave(param);
  }

  @Mutation(returns => String, { nullable: true })
  async ${funName}Destroy(@Arg('id', type => ID) id: string,
    @Ctx() ctx: ExtendCtx): Promise<string> {
    const service = await ctx.reqCtx.requestContext.getAsync<${className}Service>('${funName}Service');
    return service.destroyById(id);
  }
  ${filedResolver}
}
`;
};

export const send = ({ tableItem, keyColumnList }: ISend) => {
  const [filedResolver, importFiled] = findForeignKey(tableItem, keyColumnList);
  return modelTemplate({
    className: pascalCase(tableItem.tableName),
    funName: camelCase(tableItem.tableName),
    modelFileName: tableItem.tableName.replace(/_/g, '-'),
    filedResolver,
    importFiled: Array.from(importFiled).join(''),
  });
};
