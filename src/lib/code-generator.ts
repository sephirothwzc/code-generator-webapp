import chalk from 'chalk';
import axios from 'axios';
import { tsModel202 } from './swagger.type';
import shell from 'shelljs';
import { send as sendType } from './code-template/type-template';
import { send as sendService } from './code-template/service-template';
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
  /**
   * 默认路径：./src/service
   */
  servicePath: string;
  /**
   * 存在则按照名字生成，不存在则按照 tag生成
   */
  serviceName?: string;
  /**
   * 默认路径：./src/service
   */
  typePath?: string;
  /**
   * 默认文件：restfulType.ts
   */
  typeName?: string;
  /**
   * ALL 全部 ['user','role']按需
   */
  tags?: 'ALL' | Array<string> | undefined;
  /**
   * 引用类型目录，默认同目录
   */
  importTypePath: string;
};

// #endregion

// demo : https://generator.swagger.io/api/swagger.json

const findSwagger = async (
  config: InitInProp & CodeSettings
): Promise<[string, Array<{ fileName: string; fileTxt: string }>]> => {
  const swaggerJson = await axios.get<tsModel202>(config.restfulWebUri).then((res) => res.data);
  const typeStr = sendType(swaggerJson);
  const serviceStr = sendService(swaggerJson, config);
  return [typeStr, serviceStr];
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
      /**
       * 存在则生成1个 不存在则按照 tag 生成
       */
      serviceName: 'restfulService.ts',
      typePath: './src/service',
      typeName: 'restfulType.ts',
      importTypePath: './restfulType',
      tags: 'ALL',
    };
  }
};

export const init = async (config: InitInProp) => {
  // 请求加载web api 获取 schema
  const settings = { ...envConfig(), ...config };
  const [typeStr, serviceStr] = await findSwagger(settings);
  serviceStr.forEach(async (p) => {
    await createFile(p.fileTxt, settings.servicePath, p.fileName);
    console.log(chalk.white.bgGreen.bold(`${p.fileName}--success!`));
  });
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
      return success(fullPath);
    })
    .catch((error) => {
      console.error(chalk.white.bgRed.bold(`Error: `) + `\t [${fullPath}]${error}!`);
    });
};

/**
 * 成功提示
 * @param {string} fullPath 文件路径
 */
const success = async (fullPath: string) => {
  // 格式化
  // exec(`npx prettier --write ${fullPath}`);
  //
  try {
    console.log(chalk.white.bgGreen.bold(`Done! File FullPath`) + `\t [${fullPath}]`);
    shell.exec(`npx prettier --write ${fullPath}`);
  } catch (error) {
    console.log(error);
  }
};

const fileWritePromise = (fullPath: string, txt: string) => {
  if (!txt) {
    return;
  }

  const fsWriteFile = promisify(fs.writeFile);
  return fsWriteFile(fullPath, txt);
};
