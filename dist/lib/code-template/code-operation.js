"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.send = void 0;
const lodash_1 = require("lodash");
const helper_1 = require("../utils/helper");
const modelTemplate = ({ funName, className }) => {
    return `# 查询
extend type query {
  # ${funName} 总行数
  ${funName}Count(param: QueryListParam): Int
  # ${funName} 分页查询
  ${funName}List(param: QueryListParam): ${className}List
  # ${funName}  id 获取
  ${funName}(id: ID!): ${className}
  # ${funName} 有条件返回
  ${funName}All(param: QueryListParam): [${className}]
}

# 操作
extend type mutation {
  # ${funName} 新增 or 修改
  ${funName}(param: ${className}SaveIn!): ${className}
  # ${funName} 批量 新增 or 修改
  ${funName}Bulk(param: [${className}SaveIn]!): [${className}]
  # ${funName} 根据id删除
  ${funName}Destroy(id: ID!): String
}`;
};
const send = ({ tableItem }) => {
    return modelTemplate({
        funName: (0, lodash_1.camelCase)(tableItem.tableName),
        className: (0, helper_1.pascalCase)(tableItem.tableName),
    });
};
exports.send = send;
//# sourceMappingURL=code-operation.js.map