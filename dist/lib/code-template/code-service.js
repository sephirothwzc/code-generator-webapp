"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.send = void 0;
const helper_1 = require("../utils/helper");
const modelTemplate = ({ className, modelFileName, }) => {
    return `import { Provide } from '@midwayjs/decorator';
import ServiceGenericBase from '../lib/base/service-generic.base';
import { ${className} } from '../lib/model/${modelFileName}.entity';

@Provide()
export class ${className}Service extends ServiceGenericBase<${className}> {
  get Entity() {
    return ${className};
  }
}
`;
};
const send = ({ tableItem }) => {
    return modelTemplate({
        className: (0, helper_1.pascalCase)(tableItem.tableName),
        modelFileName: tableItem.tableName.replace(/_/g, '-'),
    });
};
exports.send = send;
//# sourceMappingURL=code-service.js.map