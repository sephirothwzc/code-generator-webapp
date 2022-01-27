import chalk from 'chalk';
import axios from 'axios';
import { tsModel202 } from './swagger.type';
import shell from 'shelljs';
import { send as sendType } from './code-template/type-template';
import fs from 'fs';
import { promisify } from 'util';
import { replace } from 'lodash';
// #region interface

export interface InitInProp {
  restfulWebUri: string;
}

/**
 * 代码设置
 */
export type CodeSettings = {
  servicePath?: string;
  serviceName?: string;
  typePath?: string;
  typeName?: string;
};

// #endregion

// demo : https://generator.swagger.io/api/swagger.json

const findSwagger = async (config: InitInProp & CodeSettings): Promise<[string]> => {
  const swaggerJson = await axios.get<tsModel202>(config.restfulWebUri).then((res) => res.data);
  const typeStr = sendType(swaggerJson);
  return [typeStr];
};

/**
 * 加载配置信息
 * @param env 默认配置
 * @returns
 */
const envConfig = (): CodeSettings => {
  // 判断是否midway config存在
  const configPath = './code-generator.json';
  try {
    const dbConfig = shell.cat(configPath);
    const result = JSON.parse(dbConfig);
    return result as CodeSettings;
  } catch (error) {
    return {
      servicePath: './src/service',
      serviceName: 'restfulService.ts',
      typePath: './src/service',
      typeName: 'restfulType.ts',
    };
  }
};

export const init = async (config: InitInProp) => {
  // 请求加载web api 获取 schema
  const settings = { ...envConfig(), ...config };
  const [typeStr] = await findSwagger(settings);
  await fileSend(settings, typeStr);
  console.log(chalk.white.bgGreen.bold(`success!`));
  process.exit();
};

/**
 * 文件写入
 * @param table
 * @param types
 */
const fileSend = async (config: InitInProp & CodeSettings, typeStr: string) => {
  await createFile(typeStr, config.typePath as string, config.typeName as string);
};

/**
 * 创建文件
 * @param {string}  文件名
 */
const createFile = async (txt: string, path: string, fileName: string): Promise<void> => {
  if (!txt || !path) {
    return;
  }
  console.log(path);
  shell.mkdir('-p', path);

  const fullPath = replace(path + '/' + fileName, '//', '/');
  await fileWritePromise(fullPath, txt)
    ?.then(() => {
      success(fullPath);
    })
    .catch((error) => {
      console.error(chalk.white.bgRed.bold(`Error: `) + `\t [${fullPath}]${error}!`);
    });
};

/**
 * 成功提示
 * @param {string} fullPath 文件路径
 */
const success = (fullPath: string) => {
  // 格式化
  // exec(`npx prettier --write ${fullPath}`);
  //
  console.log(chalk.white.bgGreen.bold(`Done! File FullPath`) + `\t [${fullPath}]`);
  shell.exec(`npx prettier --write ${fullPath}`);
};

const fileWritePromise = (fullPath: string, txt: string) => {
  if (!txt) {
    return;
  }

  const fsWriteFile = promisify(fs.writeFile);
  return fsWriteFile(fullPath, txt);
};
