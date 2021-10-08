"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.send = void 0;
const lodash_1 = require("lodash");
const helper_1 = require("../utils/helper");
const modelTemplate = ({ className, funName, modelFileName, }) => {
    return `import { Provide, Inject } from '@midwayjs/decorator';
import Bb from 'bluebird';
import { Resolver, Query, Arg, Int, Mutation, ID } from 'type-graphql';
import {
  ${className},
  ${className}SaveIn,
  ${className}List,
} from '../graphql/${modelFileName}/${modelFileName}.gql';
import QueryListParam from '../graphql/utils/query-list-param.gql';
import { ${className}Service } from '../service/${modelFileName}.service';
import { ${className}Entity } from '../lib/model/${modelFileName}.entity';

@Provide()
@Resolver(() => ${className})
export default class ${className}Resolver {
  @Inject()
  ${funName}Service: ${className}Service;

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
  async ${funName}Destroy(@Arg('id', type => ID) id: string): Promise<void> {
    return this.${funName}Service.destroyById(id);
  }
}
`;
};
const send = ({ tableItem }) => {
    return modelTemplate({
        className: (0, helper_1.pascalCase)(tableItem.tableName),
        funName: (0, lodash_1.camelCase)(tableItem.tableName),
        modelFileName: tableItem.tableName.replace(/_/g, '-'),
    });
};
exports.send = send;
//# sourceMappingURL=code-resolver.js.map