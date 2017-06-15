import { PstnCarrier } from './pstnProviders/pstnCarrier';
export interface IOrder {
  reservationId?: string;
  orderType: string;
  numberType: string;
  data: any;
}


export class PstnModel {
  private customerId: string;
  private customerName: string;
  private customerFirstName: string;
  private customerLastName: string;
  private customerEmail: string;
  private serviceAddress: Object;
  private customerExists: boolean;
  private resellerExists: boolean;
  private carrierExists: boolean;
  private siteExists: boolean;
  private provider: PstnCarrier = new PstnCarrier();
  private numbers: Array<Object>;
  private orders: Array<IOrder>;
  private carriers: Array<PstnCarrier>;
  private singleCarrierReseller: boolean;
  private isTrial: boolean;
  private countryCode: string;
  private esaSigned: boolean;

  public constructor() {
    this.clear();
  }

  public clear(): void {
    this.customerId = '';
    this.customerName = '';
    this.customerFirstName = '';
    this.customerLastName = '';
    this.customerEmail = '';
    this.serviceAddress = {};
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
  }

  public clearProviderSpecificData(): void {
    this.customerFirstName = '';
    this.customerLastName = '';
    this.serviceAddress = {};
    this.siteExists = false;
    this.carrierExists = false;
    this.carrierExists = false;
    this.numbers = [];
    this.orders = [];
  }

  public setCustomerId(_customerId: string): void {
    this.customerId = _customerId;
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

  public setServiceAddress(_serviceAddress: Object): void {
    this.serviceAddress = _serviceAddress;
  }

  public getServiceAddress(): Object {
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

  public setNumbers(_numbers: Array<Object>): void {
    this.numbers = _numbers;
  }

  public getNumbers(): Array<Object> {
    return this.numbers;
  }

  public setOrders(_orders: Array<IOrder>): void {
    this.orders = _orders;
  }

  public getOrders(): Array<IOrder> {
    return _.cloneDeep(this.orders);
  }

  public setCarriers(_carriers: Array<PstnCarrier>): void {
    if (_.isArray(_carriers) && _carriers.length > 0) {
      this.carrierExists = true;
      this.carriers = _carriers;
    } else {
      this.carrierExists = false;
      this.carriers = [];
    }
  }

  public getCarriers(): Array<PstnCarrier> {
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

}

export default angular.module('huron.pstn.pstn-model', [
  require('angular-resource'),
])
.service('PstnModel', PstnModel)
.name;

