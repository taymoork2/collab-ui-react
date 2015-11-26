(function () {
  'use strict';

  angular.module('Huron')
    .factory('PstnSetup', PstnSetup);

  function PstnSetup() {
    var customerId, customerName, customerExists, carrierExists, provider, numbers, singleCarrierReseller;

    init();
    var model = {
      clear: init,
      setCustomerId: setCustomerId,
      getCustomerId: getCustomerId,
      setCustomerName: setCustomerName,
      getCustomerName: getCustomerName,
      setCustomerExists: setCustomerExists,
      isCustomerExists: isCustomerExists,
      setCarrierExists: setCarrierExists,
      isCarrierExists: isCarrierExists,
      setProvider: setProvider,
      getProvider: getProvider,
      getProviderId: getProviderId,
      setNumbers: setNumbers,
      getNumbers: getNumbers,
      isSingleCarrierReseller: isSingleCarrierReseller,
      setSingleCarrierReseller: setSingleCarrierReseller
    };

    return model;

    function init() {
      customerId = '';
      customerName = '';
      customerExists = false;
      carrierExists = false;
      provider = {};
      numbers = [];
      singleCarrierReseller = false;
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

    function setCustomerExists(_customerExists) {
      customerExists = _customerExists;
    }

    function isCustomerExists() {
      return customerExists;
    }

    function setCarrierExists(_carrierExists) {
      carrierExists = _carrierExists;
    }

    function isCarrierExists() {
      return carrierExists;
    }

    function setProvider(_provider) {
      provider = _provider;
    }

    function getProvider() {
      return provider;
    }

    function getProviderId() {
      return angular.isObject(provider) ? provider.uuid : '';
    }

    function setNumbers(_numbers) {
      numbers = _numbers;
    }

    function getNumbers() {
      return numbers;
    }

    function isSingleCarrierReseller() {
      return singleCarrierReseller;
    }

    function setSingleCarrierReseller(_singleCarrierReseller) {
      singleCarrierReseller = _singleCarrierReseller;
    }
  }
})();
