"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const lodash_1 = require("lodash");
const shelljs_1 = __importDefault(require("shelljs"));
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize_1 = require("sequelize");
const codeTypeArray = ['entity', 'graphql', 'schema', 'resolver', 'service', 'hook'];
const envConfig = (env) => {
    const configPath = './database/config.json';
    try {
        const dbConfig = shelljs_1.default.cat(configPath);
        const result = JSON.parse(dbConfig);
        return (0, lodash_1.get)(result, env);
    }
    catch (error) {
        console.error(chalk_1.default.white.bgRed.bold(`Error: `) + `\t [${configPath}] not find,must have local umzug!`);
        process.exit(1);
    }
};
const confirmDBConfig = async (database) => {
    const questions = [
        {
            name: 'dbRest',
            type: 'confirm',
            message: `是否采用[${database}]设置`,
            default: 'Y',
        },
    ];
    const value = await inquirer_1.default.prompt(questions);
    !value.dbRest && process.exit(1);
};
const queryTable = async (config) => {
    const sequelize = new sequelize_typescript_1.Sequelize(config);
    const result = await sequelize.query(`select table_name AS tableName,table_comment AS tableComment,table_type AS tableType
     from information_schema.tables where table_name <> 'sequelizemeta' 
     and table_schema=:database order by table_name`, {
        replacements: {
            database: config.database,
        },
        type: sequelize_1.QueryTypes.SELECT,
    });
    const tableList = result.map((p) => ({
        name: `${p.tableName}--${p.tableComment}`,
        value: p,
    }));
    return tableList;
};
const init = async (config) => {
    const db = envConfig(config.configNodeEnv);
    await confirmDBConfig(db.database);
    const tableList = await queryTable(db);
    const tables = await askListQuestions(tableList, 'tableName', 'checkbox');
    const types = await askListQuestions(codeTypeArray, 'fileType', 'checkbox');
    console.log(db);
    console.log(tables);
    console.log(types);
    process.exit();
};
exports.init = init;
const askListQuestions = (list, key, type = 'list', message = key) => {
    const questions = [
        {
            name: key,
            type,
            message: message,
            choices: list,
        },
    ];
    return inquirer_1.default.prompt(questions);
};
//# sourceMappingURL=code-generator.js.map