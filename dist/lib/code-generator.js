"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const chalk_1 = __importDefault(require("chalk"));
const axios_1 = __importDefault(require("axios"));
const shelljs_1 = __importDefault(require("shelljs"));
const type_template_1 = require("./code-template/type-template");
const service_template_1 = require("./code-template/service-template");
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const lodash_1 = require("lodash");
const findSwagger = async (config) => {
    const swaggerJson = await axios_1.default.get(config.restfulWebUri).then((res) => res.data);
    const typeStr = (0, type_template_1.send)(swaggerJson);
    const serviceStr = (0, service_template_1.send)(swaggerJson, config);
    return [typeStr, serviceStr];
};
const envConfig = () => {
    const configPath = './code-generator.json';
    try {
        const dbConfig = shelljs_1.default.cat(configPath);
        const result = JSON.parse(dbConfig);
        return result;
    }
    catch (error) {
        return {
            servicePath: './src/service',
            serviceName: 'restfulService.ts',
            typePath: './src/service',
            typeName: 'restfulType.ts',
            importTypePath: './restfulType',
            tags: 'ALL',
        };
    }
};
const init = async (config) => {
    const settings = { ...envConfig(), ...config };
    const [typeStr, serviceStr] = await findSwagger(settings);
    serviceStr.forEach(async (p) => {
        await createFile(p.fileTxt, settings.servicePath, p.fileName);
        console.log(chalk_1.default.white.bgGreen.bold(`${p.fileName}--success!`));
    });
    await fileSend(settings, typeStr);
    console.log(chalk_1.default.white.bgGreen.bold(`success!`));
    process.exit();
};
exports.init = init;
const fileSend = async (config, typeStr) => {
    await createFile(typeStr, config.typePath, config.typeName);
};
const createFile = async (txt, path, fileName) => {
    var _a;
    if (!txt || !path) {
        return;
    }
    console.log(path);
    shelljs_1.default.mkdir('-p', path);
    const fullPath = (0, lodash_1.replace)(path + '/' + fileName, '//', '/');
    await ((_a = fileWritePromise(fullPath, txt)) === null || _a === void 0 ? void 0 : _a.then(() => {
        return success(fullPath);
    }).catch((error) => {
        console.error(chalk_1.default.white.bgRed.bold(`Error: `) + `\t [${fullPath}]${error}!`);
    }));
};
const success = async (fullPath) => {
    try {
        console.log(chalk_1.default.white.bgGreen.bold(`Done! File FullPath`) + `\t [${fullPath}]`);
        shelljs_1.default.exec(`npx prettier --write ${fullPath}`);
    }
    catch (error) {
        console.log(error);
    }
};
const fileWritePromise = (fullPath, txt) => {
    if (!txt) {
        return;
    }
    const fsWriteFile = (0, util_1.promisify)(fs_1.default.writeFile);
    return fsWriteFile(fullPath, txt);
};
//# sourceMappingURL=code-generator.js.map