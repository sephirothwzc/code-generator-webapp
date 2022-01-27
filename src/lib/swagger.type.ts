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
};

export type PathMethod = {
  tags: Array<string>;
  summary: string;
  /**
   * 注释
   */
  description: string;
  /**
   * 参数
   */
  parameters: Array<Parameters>;
  responses: {
    200?: {
      description?: string;
      schema?: {
        type?: 'array';
        $ref?: string;
      };
    };
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
