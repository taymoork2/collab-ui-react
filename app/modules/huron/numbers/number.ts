export enum NumberType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
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
