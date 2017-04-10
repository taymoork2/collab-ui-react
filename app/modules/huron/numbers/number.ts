export interface INumber {
  uuid: string;
  number: string;
  type: string;
  directoryNumber: IDirectoryNumber;
}

export interface IDirectoryNumber {
  uuid: string;
  url: string;
}
