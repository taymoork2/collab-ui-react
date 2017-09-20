export interface IRAvrilCustomer {
  guid: string;
  displayName: string;
  domain: string;
  features: IAvrilCustomerFeatures;
}

export interface IAvrilCustomerFeatures {
  VM2E: boolean;
  VM2E_Attachment: boolean;
  VMOTP: boolean;
  VM2E_TLS: boolean;
}

export interface IAvrilCustomer extends IRAvrilCustomer {}

export class AvrilCustomer implements IAvrilCustomer {
  public guid: string;
  public displayName: string;
  public domain: string;
  public features: IAvrilCustomerFeatures;

  constructor(avrilCustomer: IAvrilCustomer = {
    guid: '',
    displayName: '',
    domain: '',
    features: new AvrilCustomerFeatures(),
  }) {
    this.guid = avrilCustomer.guid;
    this.displayName = avrilCustomer.displayName;
    this.domain = avrilCustomer.domain;
    this.features = new AvrilCustomerFeatures(avrilCustomer.features);
  }
}

export class AvrilCustomerFeatures implements IAvrilCustomerFeatures {
  public VM2E: boolean;
  public VM2E_Attachment: boolean;
  public VMOTP: boolean;
  public VM2E_TLS: boolean;

  constructor(avrilCustomerFeatures: IAvrilCustomerFeatures = {
    VM2E: false,
    VM2E_Attachment: false,
    VMOTP: true,
    VM2E_TLS: true,
  }) {
    this.VM2E = avrilCustomerFeatures.VM2E;
    this.VM2E_Attachment = avrilCustomerFeatures.VM2E_Attachment;
    this.VM2E_TLS = avrilCustomerFeatures.VM2E_TLS;
    this.VMOTP = avrilCustomerFeatures.VMOTP;
  }
}
