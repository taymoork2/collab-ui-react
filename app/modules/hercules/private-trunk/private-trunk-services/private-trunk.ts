export interface IPrivateTrunkResource {
  uuid?: string | undefined;
  name: string;
  address: string;
  port?: number | undefined | 0;
}

export interface IPrivateTrunkDomain {
  domains: string[];
}

export interface IPrivateTrunkInfo {
  resources: IPrivateTrunkResource[];
  domains: string[] | undefined;
}
