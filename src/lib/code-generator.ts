import chalk from 'chalk';
import inquirer from 'inquirer';
import { get } from 'lodash';
import shell from 'shelljs';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';

export interface InitInProp {
  configNodeEnv: string;
}

export interface ISequelizeConfig {
  port: number;
  host: string;
  database: string;
  username: string;
  password: string;
  dialect: any;
}

export interface IQueryTableOut {
  tableName: string;
  tableComment: string;
  tableType: string;
}

/**
 * 生成类型
 */
const codeTypeArray = ['entity', 'graphql', 'schema', 'resolver', 'service', 'hook'];

/**
 * 加载配置信息
 * @param env 默认配置
 * @returns
 */
const envConfig = (env: string): ISequelizeConfig => {
  // 判断是否midway config存在
  const configPath = './database/config.json';
  try {
    const dbConfig = shell.cat(configPath);
    const result = JSON.parse(dbConfig);
    return get(result, env);
  } catch (error) {
    console.error(
      chalk.white.bgRed.bold(`Error: `) + `\t [${configPath}] not find,must have local umzug!`
    );
    process.exit(1);
  }
};

/**
 * 确认配置
 */
const confirmDBConfig = async (database: string) => {
  const questions = [
    {
      name: 'dbRest',
      type: 'confirm',
      message: `是否采用[${database}]设置`,
      default: 'Y',
    },
  ];
  const value = await inquirer.prompt(questions);

  !value.dbRest && process.exit(1);
};

/**
 * sql 获取所有的表和视图
 * @param config
 */
const queryTable = async (config: ISequelizeConfig) => {
  const sequelize = new Sequelize(config);
  const result = await sequelize.query<IQueryTableOut>(
    `select table_name AS tableName,table_comment AS tableComment,table_type AS tableType
     from information_schema.tables where table_name <> 'sequelizemeta' 
     and table_schema=:database order by table_name`,
    {
      replacements: {
        database: config.database,
      },
      type: QueryTypes.SELECT,
    }
  );
  const tableList = result.map((p) => ({
    name: `${p.tableName}--${p.tableComment}`,
    value: p,
  }));
  return tableList;
};

/**
 * 文件写入
 * @param table
 * @param types
 */
const fileSend = async (tables: [{ name: string }], types: [string]) => {
  // 循环table选择
  tables &&
    types &&
    tables.forEach((p) => {
      // 获取columns
      const columnList = await queryColumn(p.name);
      const keyColumnList = await queryKeyColumn(p.name);
    });
};

export const init = async (config: InitInProp) => {
  const db = envConfig(config.configNodeEnv);
  await confirmDBConfig(db.database);
  const tableList = await queryTable(db);
  // 选择导出表格
  const tables = await askListQuestions(tableList, 'tableName', 'checkbox');
  // 选择导出对象
  const types = await askListQuestions(codeTypeArray, 'fileType', 'checkbox');

  await fileSend(tables as any, types as any);
  console.log(db);
  console.log(tables);
  console.log(types);
  console.log(chalk.white.bgGreen.bold(`success!`));
  process.exit();
};

/**
 * 询问选中list
 * @param list
 * @param key
 * @param type
 * @param message
 * @returns
 */
const askListQuestions = (list: any[], key: string, type = 'list', message = key) => {
  const questions = [
    {
      name: key,
      type,
      message: message,
      choices: list,
    },
  ];
  return inquirer.prompt(questions);
};

const queryColumn = async (name: string) => {
  throw new Error('Function not implemented.');
};
