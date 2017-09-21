export enum NumberType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
  NUMBER_FORMAT_ENTERPRISE_LINE = 'NUMBER_FORMAT_ENTERPRISE_LINE',
  NUMBER_FORMAT_EXTENSION = 'NUMBER_FORMAT_EXTENSION',
}

export interface INumber {
  uuid: string;
  number: string;
  type: NumberType;
  directoryNumber: IDirectoryNumber;
  siteToSite?: string;
}

export interface IDirectoryNumber {
  uuid: string;
  url: string;
}
