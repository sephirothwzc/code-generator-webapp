import { capitalize, groupBy, keys, last, replace, split, toUpper, union } from 'lodash';
import { CodeSettings } from '../code-generator';
import { tsModel202, Parameters, Responses } from '../swagger.type';

export const send = (swaggerJson: tsModel202, config: CodeSettings) => {
  const functionService = findService(swaggerJson, config);
  return functionService;
};

export type FunType = {
  uri: string;
  tag: string;
  method: string;
  paramIn?: Array<Parameters>;
  paramOut?: Responses;
  operationId: string;
  description: string;
  summary: string;
};

/**
 *
 * @param swaggerJson
 * @param tags
 * @returns
 */
const findService = (swaggerJson: tsModel202, config: CodeSettings) => {
  const { tags } = config;
  const restfulList: Array<FunType> = [];
  keys(swaggerJson.paths).forEach((p) => {
    // p is url
    const item = swaggerJson.paths[p];
    keys(item)
      .filter((x) => tags === 'ALL' || tags === undefined || union(tags, item[x].tags).length > 0)
      .forEach((x) => {
        // x is method
        const methodItem = item[x];
        (item[x]?.tags || ['']).forEach((tag) => {
          const funItem: FunType = {
            uri: p,
            tag,
            method: x,
            operationId: methodItem.operationId,
            paramIn: methodItem.parameters,
            paramOut: methodItem?.responses?.[200],
            description: methodItem.description,
            summary: methodItem.summary,
          };
          restfulList.push(funItem);
        });
      });
  });
  // 组织页面数据
  const gpList = groupBy(restfulList, 'tag');
  const list = keys(gpList).map((tag) => {
    const fileName = `${tag}.ts`;
    const fileTxt = findStr(gpList[tag], config);
    return { fileName, fileTxt };
  });
  return list;
};
/**
 * 生成方法文件模版
 * @param arg
 */
const findStr = (arg: FunType[], config: CodeSettings) => {
  const importSet = new Set<string>();
  const funlist = arg
    .map((p) => {
      const descParam =
        p.paramIn?.map?.((x) => ` * @param ${x.name} ${x.description}`)?.join?.(`
  `) || '';
      const funName = `${p.operationId}${capitalize(p.method)}`;
      const paramList = p.paramIn
        ?.sort((a, b) => (a.required as any) - (b.required as any))
        ?.map?.((x) => {
          const hasRequired = x.required ? '' : '?';
          if (x.type === 'array') {
            const type = last(split(x?.schema?.$ref, '/'));
            // 引入类型
            type && importSet.add(type);
            // 有可能会坑 会有 取items 的时候？？？
            return `${x.name}${hasRequired}: Array<${type}>`;
          }
          const pType = x?.schema?.$ref ? last(split(x?.schema?.$ref, '/')) : x?.type;
          // 引入类型
          x?.schema?.$ref && importSet.add(last(split(x?.schema?.$ref, '/')) as string);
          return `${x.name}: ${pType}`;
        })
        .join(',');
      const [returnType, impType] = findOutResponse(p.paramOut);
      // 引入类型
      impType && importSet.add(impType);
      const returnDis = p?.paramOut?.description;
      const uri = findUri(p);
      const dataIn = findDataIn(p);
      return `
/**
 * ${p.description || p.summary || ''}
${descParam}
 * @returns ${returnDis}
 */
export const ${funName} = async (${paramList}) => {
  return $http.${toUpper(
    p.method
  )}<${returnType}>(\`${uri}\`${dataIn}).then((res) => (!res.states ? Promise.reject(res.message) : res.data));
};
`;
    })
    .join('');
  const imp = findImport(importSet, config.importTypePath);
  return `
/**
 * 
 */
${imp}
import { $http } from "@/utils/request";

${funlist}
`;
};

const findImport = (importList: Set<string>, importTypePath: string) => {
  if (importList.size <= 0) {
    return '';
  }
  const impstr = Array.from(importList)
    .filter((p) => !['string', 'number', 'integer', 'boolean'].includes(p))
    .join(',');
  return `import { ${impstr} } from '${importTypePath}';`;
};

const findOutResponse = (res: Responses | undefined): [string, string | undefined] => {
  if (!res) {
    return ['void', undefined];
  }
  if (res.type === 'array' || res.schema?.type === 'array') {
    const type =
      res?.schema?.items?.type || (res?.schema?.$ref && last(split(res?.schema?.$ref, '/')));
    return [`Array<${type}>`, type as string];
  }
  const type =
    res.type ||
    (res?.schema?.$ref && last(split(res?.schema?.$ref, '/'))) ||
    last(split(res?.schema?.additionalProperties?.$ref, '/')) ||
    res?.schema?.type;
  return [type as string, type];
};

const findUri = (p: FunType) => {
  return replace(p.uri, '{', '${');
};

const findDataIn = (p: FunType) => {
  if (!p?.paramIn) {
    return '';
  }
  const name = p.paramIn.find((x) => x.in === 'body')?.name;
  return name ? `,${name}` : '';
};
