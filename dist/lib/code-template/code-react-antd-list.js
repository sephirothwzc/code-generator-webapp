"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.send = void 0;
const lodash_1 = require("lodash");
const helper_1 = require("../utils/helper");
const modelTemplate = ({ funName, className, routerName, propertyWhere, propertyColunm, }) => {
    return `import { FC, ReactNode, useRef } from 'react';
import { Popconfirm, Button, message, Tag } from 'antd';
import { useImmer } from 'use-immer';
import {
  generatorColumns,
  getColumnSearch,
  WhereType,
  filtersToWhere,
  proSortToOrder,
  gqlErrorMessage,
  timeFormatHelper,
} from '../../utils/antd-helper';
import { toString, toInteger, debounce } from 'lodash';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { UseFetchDataAction } from '@ant-design/pro-table/lib/typing';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import {
  ${className}DestroyMutation,
  ${className}Fragment,
  ${className}Mutation,
  ${className}SaveIn,
  Exact,
} from '../../generator/basics-serialize';
import {
  Find${className}ListDocument,
  use${className}DestroyMutation,
  use${className}Mutation,
  useFind${className}ListQuery,
} from '../../generator/basics-serialize.operation';
import { MutationFunctionOptions, FetchResult } from '@apollo/client';

// #region type
type SetColumnType = { key: keyof ${className}Fragment; [p: string]: any };
type FilterType = {
  [p in keyof ${className}Fragment]: WhereType;
};
// #endregion

// #region whereModel
const whereModel: FilterType = {
  ${propertyWhere}
};
// #endregion

// #region column
const useColumn = (
  ${funName}Mutatioin: {
    (
      options?: MutationFunctionOptions<
        ${className}Mutation,
        Exact<{ param: ${className}SaveIn }>
      >
    ): Promise<
      FetchResult<${className}Mutation, Record<string, any>, Record<string, any>>
    >;
    (arg0: {
      variables: { param: { id: string; enableFlag: number } };
    }): Promise<any>;
  },
  ${funName}DestroyMutation: {
    (
      options?: MutationFunctionOptions<
        ${className}DestroyMutation,
        Exact<{ id: string }>
      >
    ): Promise<
      FetchResult<
        ${className}DestroyMutation,
        Record<string, any>,
        Record<string, any>
      >
    >;
    (arg0: { variables: { id: string } }): Promise<any>;
  }
) => {
  return generatorColumns<${className}Fragment>(
    Find${className}ListDocument,
    [
      ${propertyColunm}
      {
        key: 'enableFlag',
        filters: true, // 列筛选
        onFilter: true, // form筛选
        valueType: 'select',
        filterMultiple: false,
        valueEnum: {
          1: {
            text: '启用',
          },
          0: {
            text: '停用',
          },
        },
        render: (
          text: ReactNode,
          record: ${className}Fragment,
          index: number,
          action: UseFetchDataAction<${className}Fragment>
        ) => (
          <Button
            type="link"
            key={index}
            onClick={debounce(() => {
              ${funName}Mutatioin({
                variables: {
                  param: {
                    id: record.id,
                    enableFlag: record.enableFlag === 1 ? 0 : 1,
                  },
                },
              })
                .then(() => {
                  action.reload();
                  message.success('修改状态成功');
                })
                .catch(message.error);
            }, toInteger(process.env.REACT_APP_ANTD_DEBOUNCE))}
          >
            <Tag color={record.enableFlag ? 'green' : 'geekblue'}>
              {record.enableFlag ? '启用' : '停用'}
            </Tag>
          </Button>
        ),
      },
      {
        key: 'createdAt',
        valueType: 'dateTimeRange',
        render: (text: ReactNode, record: ${className}Fragment) =>
          timeFormatHelper(record.createdAt),
      },
      {
        key: 'createdIdObj',
        dataIndex: ['createdIdObj', 'username'],
        title: '创建人',
        filter: false,
        sorter: false,
      },
      {
        key: 'operation',
        sorter: false,
        valueType: 'option',
        render: (
          text: ReactNode,
          record: ${className}Fragment,
          index: number,
          action: UseFetchDataAction<${className}Fragment>
        ) => (
          <Popconfirm
            title="确定要删除吗?"
            onConfirm={() =>
              ${funName}DestroyMutation({
                variables: { id: toString(record?.id) },
              })
                .then(() => {
                  action.reload();
                  message.success('删除成功!');
                })
                .catch(gqlErrorMessage)
            }
          >
            <Button type="link" size="small">
              删除
            </Button>
          </Popconfirm>
        ),
      },
      {
        key: 'id',
        ...getColumnSearch<${className}Fragment>('id'),
        render: (
          text: ReactNode,
          record: ${className}Fragment,
          index: number,
          action: UseFetchDataAction<${className}Fragment>
        ) => <Link to={\`/${routerName}/\${text}\`}>{text}</Link>,
      },
    ] as SetColumnType[],
    ['createdId']
  ) as ProColumns<${className}Fragment>[];
};
// #endregion

/**
 * 公司管理
 * @returns
 */
const List: FC = () => {
  const history = useHistory();
  const refProTable = useRef<ActionType>();
  /**
   * mutation delete
   */
  const [${funName}DestroyMutation] = use${className}DestroyMutation();

  /**
   * mutation update
   */
  const [${funName}Mutatioin] = use${className}Mutation();

  const columnsDefault = useColumn(${funName}Mutatioin, ${funName}DestroyMutation);
  /**
   * 定义列
   */
  const [columns] = useImmer(columnsDefault);

  /**
   * 分页查询
   */
  const { refetch } = useFind${className}ListQuery({ skip: true });

  return (
    <ProTable<${className}Fragment>
      columns={columns}
      actionRef={refProTable}
      request={async (params, sorter, filter) =>
        refetch({
          param: {
            limit: params.pageSize,
            offset:
              (toInteger(params.current) - 1) * toInteger(params.pageSize),
            order: proSortToOrder(sorter),
            where: filtersToWhere([params, filter], whereModel),
          },
        }).then((result) => {
          return {
            data: result.data.${funName}All as Array<${className}Fragment>,
            total: toInteger(result.data?.${funName}Count),
            success: true,
          };
        })
      }
      rowKey="id"
      pagination={{
        showQuickJumper: true,
        hideOnSinglePage: true,
      }}
      search={{
        layout: 'vertical',
      }}
      dateFormatter="string"
      toolBarRender={() => [
        <Button
          type="primary"
          key="primary"
          onClick={() => history.push('/${routerName}/')}
        >
          新增
        </Button>,
      ]}
      debounceTime={toInteger(process.env.REACT_APP_ANTD_DEBOUNCE)}
      options={{ density: true }}
    />
  );
};

export default List;
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
];
const itemWhere = (col) => {
    switch (col.columnType) {
        case 'bigint':
        case 'nvarchar':
        case 'varchar':
            return '_like';
        case 'timestamp':
        case 'int':
        case 'decimal':
        case 'double':
            return `_between`;
        case 'datetime':
            return `_between`;
        case 'boolean':
        case 'tinyint':
            return '_eq';
        case 'json':
            return '_json';
        default:
            return '_like';
    }
};
const findPropertyWhere = (columnList) => {
    const list = columnList
        .filter((p) => !notColumn.includes(p.columnName))
        .map((p) => {
        return `// ${p.columnComment}
  ${(0, lodash_1.camelCase)(p.columnName)}: '${itemWhere(p)}',`;
    });
    return list.join(`
`);
};
const findPropertyCloumn = (columnList, className) => {
    const list = columnList
        .filter((p) => !notColumn.includes(p.columnName))
        .map((p) => {
        return `{
        key: '${(0, lodash_1.camelCase)(p.columnName)}',
        ...getColumnSearch<${className}Fragment>('${(0, lodash_1.camelCase)(p.columnName)}'),
        title: '${p.columnComment}',
      },`;
    });
    return list.join(`
`);
};
const send = ({ tableItem, columnList }) => {
    return modelTemplate({
        funName: (0, lodash_1.camelCase)(tableItem.tableName),
        className: (0, helper_1.pascalCase)(tableItem.tableName),
        routerName: (0, lodash_1.replace)(tableItem.tableName, '_', '-'),
        propertyWhere: findPropertyWhere(columnList),
        propertyColunm: findPropertyCloumn(columnList, (0, helper_1.pascalCase)(tableItem.tableName)),
    });
};
exports.send = send;
//# sourceMappingURL=code-react-antd-list.js.map