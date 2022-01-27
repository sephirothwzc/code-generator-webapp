/**
 * 2.0
 */

/**
 *
 */
export type ResponseCode = {
  /**
   * File download code
   */
  code?: string;

  /**
   * URL for fetching the generated client
   */
  link?: string;
};

/**
 *
 */
export type AuthorizationValue = {
  /**
   *
   */
  value?: string;

  /**
   *
   */
  type?: string;

  /**
   *
   */
  keyName?: string;

  /**
   *
   */
  urlMatcher?: UrlMatcher;
};

/**
 *
 */
export type GeneratorInput = {
  /**
   *
   */
  spec?: object;

  /**
   *
   */
  options?: object;

  /**
   *
   */
  swaggerUrl?: string;

  /**
   *
   */
  authorizationValue?: AuthorizationValue;

  /**
   *
   */
  securityDefinition?: SecuritySchemeDefinition;
};

/**
 *
 */
export type SecuritySchemeDefinition = {
  /**
   *
   */
  type?: string;

  /**
   *
   */
  description?: string;
};

/**
 *
 */
export type UrlMatcher = {};

/**
 *
 */
export type CliOption = {
  /**
   *
   */
  optionName?: string;

  /**
   *
   */
  description?: string;

  /**
   * Data type is based on the types supported by the JSON-Schema
   */
  type?: string;

  /**
   *
   */
  default?: string;

  /**
   *
   */
  enum?: object;
};
