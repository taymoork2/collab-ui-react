import {
  IPstnCarrierGet,
  PstnCarrierGet,
} from './pstnProviders/pstnCarrier';

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
  private provider: IPstnCarrierGet;
  private numbers: Array<Object>;
  private orders: Array<Object>;
  private singleCarrierReseller: boolean;
  private isTrial: boolean;

  constructor() {
    this.resetAll();
  }

  public clearProviderSpecificData() {
    this.customerFirstName = '';
    this.customerLastName = '';
    this.numbers = [];
    this.orders = [];
    this.serviceAddress = {};
  }

  public resetAll(): void {
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
    this.provider = new PstnCarrierGet();
    this.numbers = [];
    this.orders = [];
    this.singleCarrierReseller = false;
    this.isTrial = true;
  }

  public setCustomerId(_customerId): void {
    this.customerId = _customerId;
  }

  public getCustomerId(): string {
    return this.customerId;
  }

  public setCustomerName(_customerName): void {
    this.customerName = _customerName;
  }

  public getCustomerName(): string {
    return this.customerName;
  }

  public setCustomerFirstName(_customerFirstName): void {
    this.customerFirstName = _customerFirstName;
  }

  public getCustomerFirstName(): string {
    return this.customerFirstName;
  }

  public setCustomerLastName(_customerLastName): void {
    this.customerLastName = _customerLastName;
  }

  public getCustomerLastName(): string {
    return this.customerLastName;
  }

  public setCustomerEmail(_customerEmail): void {
    this.customerEmail = _customerEmail;
  }

  public getCustomerEmail(): string {
    return this.customerEmail;
  }

  public setServiceAddress(_serviceAddress): void {
    this.serviceAddress = _serviceAddress;
  }

  public getServiceAddress(): Object {
    return this.serviceAddress;
  }

  public setCustomerExists(_customerExists): void {
    this.customerExists = _customerExists;
  }

  public isCustomerExists(): boolean {
    return this.customerExists;
  }

  public setResellerExists(_resellerExists): void {
    this.resellerExists = _resellerExists;
  }

  public isResellerExists(): boolean {
    return this.resellerExists;
  }

  public setCarrierExists(_carrierExists): void {
    this.carrierExists = _carrierExists;
  }

  public isCarrierExists(): boolean {
    return this.carrierExists;
  }

  public setSiteExists(_siteExists): void {
    this.siteExists = _siteExists;
  }

  public isSiteExists(): boolean {
    return this.siteExists;
  }

  public setProvider(_provider: IPstnCarrierGet): void {
    this.provider = _provider;
  }

  public getProvider(): Object {
    return this.provider;
  }

  public getProviderId(): String {
    return _.isObject(this.provider) ? this.provider.uuid : '';
  }

  public setNumbers(_numbers): void {
    this.numbers = _numbers;
  }

  public getNumbers(): Array<Object> {
    return this.numbers;
  }

  public setOrders(_orders): void {
    this.orders = _orders;
  }

  public getOrders(): Array<Object> {
    return _.cloneDeep(this.orders);
  }

  public isSingleCarrierReseller(): boolean {
    return this.singleCarrierReseller;
  }

  public setSingleCarrierReseller(_singleCarrierReseller): void {
    this.singleCarrierReseller = _singleCarrierReseller;
  }

  public setIsTrial(_isTrial): void {
    this.isTrial = _isTrial;
  }

  public getIsTrial(): boolean {
    return this.isTrial;
  }
}
