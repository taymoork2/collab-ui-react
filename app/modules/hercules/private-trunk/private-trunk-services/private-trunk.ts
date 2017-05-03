export interface IPrivateTrunkResource {
  uuid?: string | undefined;
  name: string;
  address: string;
  port?: number | undefined | 0;
}

export interface IPrivateTrunkDomain {
  domains: Array<string>;
}

export interface IPrivateTrunkInfo {
  resources: Array<IPrivateTrunkResource>;
  domains: Array<string> | undefined;
}
