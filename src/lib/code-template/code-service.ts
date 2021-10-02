import { ISend } from '../code-generator';
import { pascalCase } from '../utils/helper';

const modelTemplate = ({
  className,
  modelFileName,
}: {
  className: string;
  modelFileName: string;
}) => {
  return `import { Provide } from '@midwayjs/decorator';
import ServiceGenericBase from '../lib/base/service-generic.base';
import { ${className} } from '../lib/model/${modelFileName}.entity';

@Provide()
export class ${className}Service extends ServiceGenericBase<${className}> {
  get Entity() {
    return ${className};
  }
}
`;
};

export const send = ({ tableItem }: ISend) => {
  return modelTemplate({
    className: pascalCase(tableItem.tableName),
    modelFileName: tableItem.tableName.replace(/_/g, '-'),
  });
};
