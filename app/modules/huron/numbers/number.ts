export enum NumberType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
  NUMBER_FORMAT_ENTERPRISE_LINE = 'NUMBER_FORMAT_ENTERPRISE_LINE',
  NUMBER_FORMAT_EXTENSION = 'NUMBER_FORMAT_EXTENSION',
  NUMBER_FORMAT_DIRECT_LINE = 'NUMBER_FORMAT_DIRECT_LINE',
}

export interface INumber {
  uuid: string;
  number: string;
  type: NumberType;
  external: string;
  directoryNumber: IDirectoryNumber;
  internal?: string;
  siteToSite?: string;
}

export interface IDirectoryNumber {
  uuid: string;
  url: string;
}
