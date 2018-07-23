import { SipAddressModel } from './sip-address.model';

export enum Domain {
  WEBEX = '.webex.com',
  KOALABAIT = '.koalabait.com',
  CISCOSPARK = '.ciscospark.com',
  WBX2 = '.wbx2.com',
}

export enum SubdomainType {
  CALL = '.call',
  CALLS = '.calls',
  ROOM = '.room',
  ROOMS = '.rooms',
}

export interface IParsedSipCloudDomain {
  atlasJ9614SipUriRebranding: boolean;
  domain: Domain;
  subdomain: string;
}

export interface IDomainResponse {
  isDomainAvailable: boolean;
  isDomainReserved: boolean;
}

export interface IValidateResponse {
  isDomainAvailable: boolean;
  isDomainInvalid: boolean;
  model: SipAddressModel;
}

export interface ISaveResponse {
  isDomainReserved: boolean;
  model: SipAddressModel;
}
