export enum NumberType {
  INTERNAL = <any>'internal',
  EXTERNAL = <any>'external',
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
