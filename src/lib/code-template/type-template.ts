import { keys, last, split } from 'lodash';
import { tsModel202 } from '../swagger.type';

const modelTemplate = ({ version, typeStr }: { version: string; typeStr: string }) => {
  return `/**
 * ${version}
 */

${typeStr}
`;
};

export const send = (swaggerJson: tsModel202) => {
  const typeStr = findType(swaggerJson);
  return modelTemplate({ version: swaggerJson.swagger, typeStr });
};

const findType = (swaggerJson: tsModel202): string => {
  const types = keys(swaggerJson.definitions).map((p) => {
    const typeName = p;
    const requiredList = swaggerJson.definitions[p]?.required || [];
    const obj = swaggerJson.definitions[p].properties;
    const propertyList = keys(obj).map((x) => {
      const type = itemType(obj[x]);
      const hasRequired = requiredList.includes(x) ? '' : '?';
      return `
      /**
       * ${obj[x]?.description || ''} ${obj[x]?.enum?.join?.(',') || ''}
       */
      ${x}${hasRequired}: ${type};
  `;
    });
    return `
/**
 * 
 */
export type ${typeName} = {
  ${Array.from(new Set(propertyList)).join('')}
}
`;
  });
  return types.join('');
};

const itemType = (obj: {
  type?: string;
  format?: string;
  description?: string;
  enum?: string[];
  $ref: string;
}) => {
  if (obj.type === 'array') {
    const t = obj.format ? obj.format : last(split(obj.$ref, '/'));
    return `Array<${t}>`;
  } else if (obj.type === 'string' && obj.enum) {
    return obj.enum.map((p) => `'${p}'`).join('|');
  } else if (obj.$ref) {
    return last(split(obj.$ref, '/'));
  }
  return obj.type;
};
