"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pascalCase = void 0;
const lodash_1 = require("lodash");
const pascalCase = (name) => {
    return (0, lodash_1.upperFirst)((0, lodash_1.camelCase)(name));
};
exports.pascalCase = pascalCase;
//# sourceMappingURL=helper.js.map