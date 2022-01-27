"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const code_generator_1 = require("./lib/code-generator");
const minimist_1 = __importDefault(require("minimist"));
const process_1 = require("process");
const chalk_1 = __importDefault(require("chalk"));
const figlet_1 = __importDefault(require("figlet"));
const findParam = () => {
    const def = process.argv.slice(2);
    if (['helper', '--h', '--helper'].includes(def[0])) {
        console.log(`
--u=[url] by server restful swagger or uri
`);
        (0, process_1.exit)();
    }
    const arg = (0, minimist_1.default)(process.argv.slice(2));
    if (!arg['u'] && !arg['uri']) {
        console.log(`
--u=[url] by server restful swagger or uri
`);
        (0, process_1.exit)();
    }
    const restfulWebUri = arg['u'] || arg['uri'];
    return { restfulWebUri };
};
const app = async () => {
    console.log(chalk_1.default.green(figlet_1.default.textSync('WanDa', {
        font: 'Ghost',
        horizontalLayout: 'default',
        verticalLayout: 'default',
    })));
    const config = findParam();
    (0, code_generator_1.init)(config);
};
app();
//# sourceMappingURL=index.js.map