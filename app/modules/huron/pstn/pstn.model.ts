import { PstnCarrier } from './pstnProviders/pstnCarrier';
import { Address } from './shared/pstn-address';
import { ContractStatus } from './pstn.const';
import { BsftSettings } from 'modules/call/bsft/settings/shared';

export interface IOrderData {
  numbers: string | string[];
  length?: number;
  areaCode?: string;
  consecutive?: boolean;
  nxx?: string;
}

export interface IOrder {
  orderType: string;
  data: IOrderData;
  reservationId?: string; //Will exist based on orderType
  numberType?: string;    //Will exist based on orderType
}

export interface IAuthLicense {
  licenseId: string;
  offerName: string;
  licenseType: string;
  features: string[];
  isTrial: boolean;
  trialId: string;
  status: string;
  partnerEmail: string;
}

export interface IAuthCustomer {
  licenses: IAuthLicense[];
}

export class PstnModel {
  private customerId: string;
  private customerName: string;
  private customerFirstName: string;
  private customerLastName: string;
  private customerEmail: string;
  private confirmCustomerEmail: string;
  private serviceAddress: Address = new Address();
  private customerExists: boolean;
  private resellerExists: boolean;
  private carrierExists: boolean;
  private siteExists: boolean;
  private provider: PstnCarrier = new PstnCarrier();
  private numbers: Object[];
  private orders: IOrder[];
  private carriers: PstnCarrier[];
  private singleCarrierReseller: boolean;
  private isTrial: boolean;
  private countryCode: string;
  private esaSigned: boolean;
  private esaDisclaimerAgreed: boolean;
  private contractStatus: ContractStatus;
  private bsftCustomer: BsftSettings;

  public constructor() {
    this.clear();
  }

  public clear(locations?): void {
    this.customerId = '';
    this.customerName = '';
    this.customerFirstName = '';
    this.customerLastName = '';
    this.customerEmail = '';
    this.confirmCustomerEmail = '';
    if (locations) {
      this.serviceAddress.reset();
    } else {
      this.serviceAddress.streetAddress = null;
      this.serviceAddress.unit = undefined;
      this.serviceAddress.city = null;
      this.serviceAddress.state = null;
      this.serviceAddress.zip = null;
      this.serviceAddress.validated = false;
    }
    this.customerExists = false;
    this.resellerExists = false;
    this.carrierExists = false;
    this.siteExists = false;
    this.provider = new PstnCarrier();
    this.numbers = [];
    this.orders = [];
    this.carriers = [];
    this.singleCarrierReseller = false;
    this.isTrial = true;
    this.countryCode = 'US';
    this.esaSigned = false;
    this.esaDisclaimerAgreed = false;
    this.contractStatus = ContractStatus.UnKnown;
    this.bsftCustomer = new BsftSettings();
  }

  public clearProviderSpecificData(): void {
    this.customerFirstName = '';
    this.customerLastName = '';
    this.serviceAddress.reset();
    this.siteExists = false;
    this.carrierExists = false;
    this.carrierExists = false;
    this.numbers = [];
    this.orders = [];
  }

  public clearSwivelNumbers(): void {
    this.numbers = [];
    this.orders = [];
  }

  public setCustomerId(_customerId: string): void {
    if (_.isString(_customerId)) {
      this.customerId = _customerId;
    } else {
      this.customerId = '';
    }
  }

  public getCustomerId(): string {
    return this.customerId;
  }

  public setCustomerName(_customerName: string): void {
    this.customerName = _customerName;
  }

  public getCustomerName(): string {
    return this.customerName;
  }

  public setCustomerFirstName(_customerFirstName: string): void {
    this.customerFirstName = _customerFirstName;
  }

  public getCustomerFirstName(): string {
    return this.customerFirstName;
  }

  public setCustomerLastName(_customerLastName: string): void {
    this.customerLastName = _customerLastName;
  }

  public getCustomerLastName(): string {
    return this.customerLastName;
  }

  public setCustomerEmail(_customerEmail: string): void {
    this.customerEmail = _customerEmail;
  }

  public getCustomerEmail(): string {
    return this.customerEmail;
  }

  public setConfirmCustomerEmail(_confirmCustomerEmail: string): void {
    this.confirmCustomerEmail = _confirmCustomerEmail;
  }

  public getConfirmCustomerEmail(): string {
    return this.confirmCustomerEmail;
  }

  public setServiceAddress(_serviceAddress: Address) {
    this.serviceAddress = _serviceAddress;
  }

  public getServiceAddress(): Address {
    return this.serviceAddress;
  }

  public setCustomerExists(_customerExists: boolean): void {
    this.customerExists = _customerExists;
  }

  public isCustomerExists(): boolean {
    return this.customerExists;
  }

  public isEsaSigned(): boolean {
    return this.esaSigned;
  }

  public setEsaSigned(_esaSigned: boolean): void {
    this.esaSigned = _esaSigned;
  }

  public setResellerExists(_resellerExists: boolean): void {
    this.resellerExists = _resellerExists;
  }

  public isResellerExists(): boolean {
    return this.resellerExists;
  }

  public setCarrierExists(_carrierExists: boolean): void {
    this.carrierExists = _carrierExists;
  }

  public isCarrierExists(): boolean {
    return this.carrierExists;
  }

  public setSiteExists(_siteExists: boolean): void {
    this.siteExists = _siteExists;
  }

  public isSiteExists(): boolean {
    return this.siteExists;
  }

  public setProvider(_provider: PstnCarrier): void {
    this.provider = _provider;
  }

  public getProvider(): PstnCarrier {
    return this.provider;
  }

  public getProviderId(): string {
    return _.isObject(this.provider) ? this.provider.uuid : '';
  }

  public setNumbers(_numbers: Object[]): void {
    this.numbers = _numbers;
  }

  public getNumbers(): Object[] {
    return this.numbers;
  }

  public setOrders(_orders: IOrder[]): void {
    this.orders = _orders;
  }

  public getOrders(): IOrder[] {
    return _.cloneDeep(this.orders);
  }

  public setCarriers(_carriers: PstnCarrier[]): void {
    if (_.isArray(_carriers) && _carriers.length > 0) {
      this.carrierExists = true;
      this.carriers = _carriers;
    } else {
      this.carrierExists = false;
      this.carriers = [];
    }
  }

  public getCarriers(): PstnCarrier[] {
    return this.carriers;
  }

  public isSingleCarrierReseller(): boolean {
    return this.singleCarrierReseller;
  }

  public setSingleCarrierReseller(_singleCarrierReseller: boolean): void {
    this.singleCarrierReseller = _singleCarrierReseller;
  }

  public setIsTrial(_isTrial: boolean): void {
    this.isTrial = _isTrial;
  }

  public getIsTrial(): boolean {
    return this.isTrial;
  }

  public getCountryCode(): string {
    return this.countryCode;
  }

  public setCountryCode(_countryCode): void {
    this.countryCode = _countryCode;
  }

  public isEsaDisclaimerAgreed(): boolean {
    return this.esaDisclaimerAgreed;
  }

  public setEsaDisclaimerAgreed(_esaDisclaimerAgreed: boolean): void {
    this.esaDisclaimerAgreed = _esaDisclaimerAgreed;
  }

  public getContractStatus(): ContractStatus {
    return this.contractStatus;
  }

  public setContractStatus(contractStatus: ContractStatus): void {
    this.contractStatus = contractStatus;
  }

  public getBsftCustomer() {
    return this.bsftCustomer;
  }

  public setBsftCustomer(_bsftCustomer: BsftSettings) {
    this.bsftCustomer = _bsftCustomer;
  }
}

export default angular.module('huron.pstn.pstn-model', [
  require('angular-resource'),
])
  .service('PstnModel', PstnModel)
  .name;

