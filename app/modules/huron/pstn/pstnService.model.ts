class PstnSetup {
  private customerId;
  private customerName;
  private customerFirstName;
  private customerLastName;
  private customerEmail;
  private serviceAddress;
  private customerExists;
  private resellerExists;
  private carrierExists;
  private siteExists;
  private provider;
  private numbers;
  private orders;
  private carriers;
  private singleCarrierReseller;
  private isTrial;
  private countryCode;

  public constructor() {
    this.clear();
  }

  public clear() {
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
    this.provider = undefined;
    this.numbers = [];
    this.orders = [];
    this.carriers = [];
    this.singleCarrierReseller = false;
    this.isTrial = true;
    this.countryCode = 'US';
  }

  public clearProviderSpecificData() {
    this.customerFirstName = '';
    this.customerLastName = '';
    this.serviceAddress = {};
    this.siteExists = false;
    this.carrierExists = false;
    this.carrierExists = [];
    this.numbers = [];
    this.orders = [];
  }

  public setCustomerId(_customerId) {
    this.customerId = _customerId;
  }

  public getCustomerId() {
    return this.customerId;
  }

  public setCustomerName(_customerName) {
    this.customerName = _customerName;
  }

  public getCustomerName() {
    return this.customerName;
  }

  public setCustomerFirstName(_customerFirstName) {
    this.customerFirstName = _customerFirstName;
  }

  public getCustomerFirstName() {
    return this.customerFirstName;
  }

  public setCustomerLastName(_customerLastName) {
    this.customerLastName = _customerLastName;
  }

  public getCustomerLastName() {
    return this.customerLastName;
  }

  public setCustomerEmail(_customerEmail) {
    this.customerEmail = _customerEmail;
  }

  public getCustomerEmail() {
    return this.customerEmail;
  }

  public setServiceAddress(_serviceAddress) {
    this.serviceAddress = _serviceAddress;
  }

  public getServiceAddress() {
    return this.serviceAddress;
  }

  public setCustomerExists(_customerExists) {
    this.customerExists = _customerExists;
  }

  public isCustomerExists() {
    return this.customerExists;
  }

  public setResellerExists(_resellerExists) {
    this.resellerExists = _resellerExists;
  }

  public isResellerExists() {
    return this.resellerExists;
  }

  public setCarrierExists(_carrierExists) {
    this.carrierExists = _carrierExists;
  }

  public isCarrierExists() {
    return this.carrierExists;
  }

  public setSiteExists(_siteExists) {
    this.siteExists = _siteExists;
  }

  public isSiteExists() {
    return this.siteExists;
  }

  public setProvider(_provider) {
    this.provider = _provider;
  }

  public getProvider() {
    return this.provider;
  }

  public getProviderId() {
    return _.isObject(this.provider) ? this.provider.uuid : '';
  }

  public setNumbers(_numbers) {
    this.numbers = _numbers;
  }

  public getNumbers() {
    return this.numbers;
  }

  public setOrders(_orders) {
    this.orders = _orders;
  }

  public getOrders() {
    return _.cloneDeep(this.orders);
  }

  public setCarriers(_carriers) {
    if (_.isArray(_carriers) && _carriers.length > 0) {
      this.carrierExists = true;
      this.carriers = _carriers;
    } else {
      this.carrierExists = false;
      this.carriers = [];
    }
  }

  public getCarriers() {
    return this.carriers;
  }

  public isSingleCarrierReseller() {
    return this.singleCarrierReseller;
  }

  public setSingleCarrierReseller(_singleCarrierReseller) {
    this.singleCarrierReseller = _singleCarrierReseller;
  }

  public setIsTrial(_isTrial) {
    this.isTrial = _isTrial;
  }

  public getIsTrial() {
    return this.isTrial;
  }

  public getCountryCode() {
    return this.countryCode;
  }

  public setCountryCode(_countryCode) {
    this.countryCode = _countryCode;
  }

}

export default angular.module('huron.PstnSetup', [
  require('angular-resource'),
])
.service('PstnSetup', PstnSetup)
.name;

