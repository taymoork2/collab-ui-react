export interface IPrivateTrunkResource {
  uuid?: string;
  name: string;
  address: string;
  port?: number;
}

export interface IPrivateTrunkDomain {
  domains: string[];
}

export interface IPrivateTrunkInfo {
  resources: IPrivateTrunkResource[];
  domains: string[] | undefined;
}
