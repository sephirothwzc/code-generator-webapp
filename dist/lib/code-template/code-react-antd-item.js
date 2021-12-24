"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.send = void 0;
const lodash_1 = require("lodash");
const helper_1 = require("../utils/helper");
const modelTemplate = ({ funName, className, propertyColunm, }) => {
    return `import { message, Spin } from 'antd';
import { FC } from 'react';
import {
  use${className}Mutation,
  useFind${className}Query,
} from '../../generator/basics-serialize.operation';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { ${className}SaveIn } from '../../generator/basics-serialize';
import ProForm, { ProFormText, ProFormDatePicker } from '@ant-design/pro-form';
import {
  formLayout,
  gqlErrorMessage,
  proFormProperty,
} from '../../utils/antd-helper';
import { useQueryParam, BooleanParam } from 'use-query-params';

const Item: FC = () => {
  const [readonly] = useQueryParam('readonly', BooleanParam);
  const match: { params: { id?: string } } = useRouteMatch();
  const { data, loading } = useFind${className}Query({
    variables: { id: match?.params?.id as string },
    skip: !match.params?.id,
  });
  const history = useHistory();
  const [saveMutation] = use${className}Mutation();

  /**
   * 提交
   */
  const handleFinish = async (values: ${className}SaveIn) => {
    return saveMutation({
      variables: {
        param: {
          id: match?.params?.id,
          ...values,
        },
      },
    })
      .then((result) => {
        message.success('保存成功!');
        history.goBack();
      })
      .catch(gqlErrorMessage);
  };

  if (loading) {
    return <Spin />;
  }

  return (
    <ProForm<${className}SaveIn>
      onFinish={handleFinish}
      initialValues={data?.${funName} as any}
      {...proFormProperty}
      {...formLayout.horizontal}
    >
      ${propertyColunm}
    </ProForm>
  );
};

export default Item;
`;
};
const notColumn = [
    'updated_at',
    'deleted_at',
    'created_user',
    'updated_user',
    'updated_id',
    'deleted_id',
    'i18n',
    'business_code',
    'id',
    'version',
];
const findTooltip = (col) => {
    switch (col.columnType) {
        case 'nvarchar':
        case 'varchar':
            return `tooltip="长度不能超过${col.characterMaximumLength}"
        fieldProps={{
          maxLength: ${col.characterMaximumLength},
        }}`;
        default:
            return '';
    }
};
const findInput = (col) => {
    switch (col.columnType) {
        case 'nvarchar':
        case 'varchar':
            const tooltip = findTooltip(col);
            return `      <ProFormText
        width="md"
        name="${(0, lodash_1.camelCase)(col.columnName)}"
        label="${col.columnComment}"${tooltip}
        placeholder="请输入"
        disabled={readonly as boolean}
        // rules={[
        //   {
        //     required: true,
        //     message: '必须输入',
        //   },
        // ]}
      />`;
        case 'bigint':
        case 'timestamp':
        case 'tinyint':
        case 'int':
            return `      <ProFormDigit
          name="${(0, lodash_1.camelCase)(col.columnName)}"
          label="${col.columnComment}"
          fieldProps={{ precision: 0 }}
          placeholder="请输入"
          disabled={readonly as boolean}
          // rules={[
          //   {
          //     required: true,
          //     message: '必须输入',
          //   },
          // ]}
        />`;
        case 'decimal':
        case 'double':
            return `      <ProFormDigit
          name="${(0, lodash_1.camelCase)(col.columnName)}"
          label="${col.columnComment}"
          fieldProps={{ precision: 2 }}
          placeholder="请输入"
          disabled={readonly as boolean}
          // rules={[
          //   {
          //     required: true,
          //     message: '必须输入',
          //   },
          // ]}
        />`;
        case 'datetime':
            return `      <ProFormDatePicker
          width="md"
          label="${col.columnComment}"
          name="${(0, lodash_1.camelCase)(col.columnName)}"
          disabled={readonly as boolean}
          // rules={[{ required: true, message: '请选时间' }]}
        />`;
        case 'boolean':
            return `      <ProFormSwitch 
          label="${col.columnComment}"
          name="${(0, lodash_1.camelCase)(col.columnName)}" 
          disabled={readonly as boolean}
        />`;
        case 'json':
        default:
            const deftooltip = findTooltip(col);
            return `      <ProFormText
        width="md"
        name="${(0, lodash_1.camelCase)(col.columnName)}"
        label="${col.columnComment}"${deftooltip}
        placeholder="请输入"
        disabled={readonly as boolean}
        // rules={[
        //   {
        //     required: true,
        //     message: '必须输入',
        //   },
        // ]}
      />`;
    }
};
const findPropertyCloumn = (columnList) => {
    const list = columnList.filter((p) => !notColumn.includes(p.columnName)).map((p) => findInput(p));
    return list.join(`
`);
};
const send = ({ tableItem, columnList }) => {
    return modelTemplate({
        funName: (0, lodash_1.camelCase)(tableItem.tableName),
        className: (0, helper_1.pascalCase)(tableItem.tableName),
        propertyColunm: findPropertyCloumn(columnList),
    });
};
exports.send = send;
//# sourceMappingURL=code-react-antd-item.js.map