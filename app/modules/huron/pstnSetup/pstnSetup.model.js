(function () {
  'use strict';

  angular.module('Huron')
    .factory('PstnSetup', PstnSetup);

  function PstnSetup() {
    var customerId, customerName, customerFirstName, customerLastName, customerEmail, serviceAddress, customerExists, resellerExists, carrierExists, siteExists, provider, numbers, orders, carriers, singleCarrierReseller, isTrial, countryCode;

    init();
    var model = {
      clear: clear,
      clearProviderSpecificData: clearProviderSpecificData,
      setCustomerId: setCustomerId,
      getCustomerId: getCustomerId,
      setCustomerName: setCustomerName,
      getCustomerName: getCustomerName,
      setCustomerFirstName: setCustomerFirstName,
      getCustomerFirstName: getCustomerFirstName,
      setCustomerLastName: setCustomerLastName,
      getCustomerLastName: getCustomerLastName,
      setCustomerEmail: setCustomerEmail,
      getCustomerEmail: getCustomerEmail,
      setServiceAddress: setServiceAddress,
      getServiceAddress: getServiceAddress,
      setCustomerExists: setCustomerExists,
      isCustomerExists: isCustomerExists,
      setResellerExists: setResellerExists,
      isResellerExists: isResellerExists,
      setCarrierExists: setCarrierExists,
      isCarrierExists: isCarrierExists,
      setSiteExists: setSiteExists,
      isSiteExists: isSiteExists,
      setProvider: setProvider,
      getProvider: getProvider,
      getProviderId: getProviderId,
      setNumbers: setNumbers,
      getNumbers: getNumbers,
      setOrders: setOrders,
      getOrders: getOrders,
      setCarriers: setCarriers,
      getCarriers: getCarriers,
      isSingleCarrierReseller: isSingleCarrierReseller,
      setSingleCarrierReseller: setSingleCarrierReseller,
      setIsTrial: setIsTrial,
      getIsTrial: getIsTrial,
      getCountryCode: getCountryCode,
      setCountryCode: setCountryCode,
    };

    return model;

    function init() {
      clear();
    }

    function clear() {
      customerId = '';
      customerName = '';
      customerFirstName = '';
      customerLastName = '';
      customerEmail = '';
      serviceAddress = {};
      customerExists = false;
      resellerExists = false;
      carrierExists = false;
      siteExists = false;
      provider = undefined;
      numbers = [];
      orders = [];
      carriers = [];
      singleCarrierReseller = false;
      isTrial = true;
      countryCode = 'US';
    }

    function clearProviderSpecificData() {
      customerFirstName = '';
      customerLastName = '';
      serviceAddress = {};
      siteExists = false;
      carrierExists = false;
      carrierExists = [];
      numbers = [];
      orders = [];
    }

    function setCustomerId(_customerId) {
      customerId = _customerId;
    }

    function getCustomerId() {
      return customerId;
    }

    function setCustomerName(_customerName) {
      customerName = _customerName;
    }

    function getCustomerName() {
      return customerName;
    }

    function setCustomerFirstName(_customerFirstName) {
      customerFirstName = _customerFirstName;
    }

    function getCustomerFirstName() {
      return customerFirstName;
    }

    function setCustomerLastName(_customerLastName) {
      customerLastName = _customerLastName;
    }

    function getCustomerLastName() {
      return customerLastName;
    }

    function setCustomerEmail(_customerEmail) {
      customerEmail = _customerEmail;
    }

    function getCustomerEmail() {
      return customerEmail;
    }

    function setServiceAddress(_serviceAddress) {
      serviceAddress = _serviceAddress;
    }

    function getServiceAddress() {
      return serviceAddress;
    }

    function setCustomerExists(_customerExists) {
      customerExists = _customerExists;
    }

    function isCustomerExists() {
      return customerExists;
    }

    function setResellerExists(_resellerExists) {
      resellerExists = _resellerExists;
    }

    function isResellerExists() {
      return resellerExists;
    }

    function setCarrierExists(_carrierExists) {
      carrierExists = _carrierExists;
    }

    function isCarrierExists() {
      return carrierExists;
    }

    function setSiteExists(_siteExists) {
      siteExists = _siteExists;
    }

    function isSiteExists() {
      return siteExists;
    }

    function setProvider(_provider) {
      provider = _provider;
    }

    function getProvider() {
      return provider;
    }

    function getProviderId() {
      return _.isObject(provider) ? provider.uuid : '';
    }

    function setNumbers(_numbers) {
      numbers = _numbers;
    }

    function getNumbers() {
      return numbers;
    }

    function setOrders(_orders) {
      orders = _orders;
    }

    function getOrders() {
      return _.cloneDeep(orders);
    }

    function setCarriers(_carriers) {
      if (_.isArray(_carriers) && _carriers.length > 0) {
        carrierExists = true;
        carriers = _carriers;
      } else {
        carrierExists = false;
        carriers = [];
      }
    }

    function getCarriers() {
      return carriers;
    }

    function isSingleCarrierReseller() {
      return singleCarrierReseller;
    }

    function setSingleCarrierReseller(_singleCarrierReseller) {
      singleCarrierReseller = _singleCarrierReseller;
    }

    function setIsTrial(_isTrial) {
      isTrial = _isTrial;
    }

    function getIsTrial() {
      return isTrial;
    }

    function getCountryCode() {
      return countryCode;
    }

    function setCountryCode(_countryCode) {
      countryCode = _countryCode;
    }

  }
})();
