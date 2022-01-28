/*Contact*/
export type Contact = {
  email: string;
};

/*License*/
export type License = {
  name: string;
  url: string;
};

/*Info*/
export type Info = {
  description: string;
  version: string;
  title: string;
  termsOfService: string;
  contact: Contact;
  license: License;
};

export type Tag = {
  name?: string;
  description?: string;
};

export type Parameters = {
  in: string;
  name: string;
  description: string;
  required: boolean;
  schema: {
    $ref: string;
  };
  /**
   * type 与 schema 互斥
   */
  type: string;
};

export type Responses = {
  description?: string;
  type?: string;
  schema?: {
    /**
     * object-> $ref array-> items
     */
    type?: string;
    items?: {
      type: string;
    };
    $ref?: string;
    additionalProperties: {
      $ref?: string;
    };
  };
};

export type PathMethod = {
  /**
   * 标签
   */
  tags: Array<string>;
  /**
   * 说明
   */
  summary: string;
  /**
   * 注释
   */
  description: string;
  /**
   * 方法唯一 方法名
   */
  operationId: string;
  /**
   * 参数
   */
  parameters: Array<Parameters>;
  responses: {
    200?: Responses;
  };
};

export type MethodType = 'get' | 'post' | 'put' | 'delete';

export type PathItemObj = {
  [method: string]: PathMethod;
};

export type PathItem = {
  [uri: string]: PathItemObj;
};

/*tsModel202*/
export type tsModel202 = {
  /**
   * version
   */
  swagger: string;
  info: Info;
  host: string;
  basePath: string;
  tags: Tag[];
  schemes: string[];
  /**
   * restful
   */
  paths: PathItem;
  securityDefinitions: any;
  /**
   * params type
   */
  definitions: Definitions;
  externalDocs: {
    description: string;
    url: string;
  };
};

export type DefinitionsItem = {
  type: string;
  properties: {
    [key: string]: {
      type: string;
      format: string;
      description: string;
      enum: Array<string>;
      $ref: string;
    };
  };
  required?: Array<string>;
};

export type Definitions = {
  [key: string]: DefinitionsItem;
};
