import { init, InitInProp } from './lib/code-generator';
import minimist from 'minimist';
import { exit } from 'process';
import chalk from 'chalk';
import figlet from 'figlet';

/**
 * 启动参数
 */
const findParam = (): InitInProp => {
  const def = process.argv.slice(2);
  if (['helper', '--h', '--helper'].includes(def[0])) {
    console.log(`
--u=[url] by server restful swagger or uri
`);
    exit();
  }

  const arg = minimist(process.argv.slice(2));
  if (!arg['u'] && !arg['uri']) {
    console.log(`
--u=[url] by server restful swagger or uri
`);
    exit();
  }
  const restfulWebUri: string = arg['u'] || arg['uri'];
  return { restfulWebUri };
};

const app = async () => {
  console.log(
    chalk.green(
      figlet.textSync('WanDa', {
        font: 'Ghost',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      })
    )
  );
  const config = findParam();
  init(config);
};
app();
