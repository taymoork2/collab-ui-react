(function () {
  'use strict';

  angular.module('Huron')
    .controller('SettingsServiceAddressCtrl', SettingsServiceAddressCtrl);

  /* @ngInject */
  function SettingsServiceAddressCtrl($q, $timeout, PstnServiceAddressService, PstnSetup, Authinfo, Notification) {

    var vm = this;
    vm.validate = validate;
    vm.cancelEdit = cancelEdit;
    vm.modify = modify;
    vm.save = save;
    vm.cancelSave = cancelSave;
    vm.hasModify = hasModify;
    vm.hasValidate = hasValidate;
    vm.hasSave = hasSave;

    vm.loadingValidate = false;
    vm.loadingSave = false;
    vm.isValid = false;
    vm.addressFound = false;
    vm.address = {};
    vm.carrierId = undefined;

    var origAddress = {};

    init();

    function init() {
      vm.loadingInit = true;
      vm.addressStatus = PstnServiceAddressService.getStatus();
      vm.countryCode = PstnSetup.getCountryCode();
      vm.carrierId = PstnSetup.getProviderId();

      return PstnServiceAddressService.getAddress(Authinfo.getOrgId())
        .then(function (address) {
          if (address) {
            origAddress = _.cloneDeep(address);
            initAddress(address, true);
          }
        })
        .catch(function (response) {
          //TODO temp remove 500 status after terminus if fixed
          if (response && response.status !== 404 && response.status !== 500) {
            Notification.errorResponse(response, 'pstnSetup.listSiteError');
          }
        })
        .finally(function () {
          vm.loadingInit = false;
        });
    }

    // Set the address with a copy and compute if it's valid
    function initAddress(address, isValid) {
      vm.address = _.cloneDeep(address);
      vm.isValid = isValid || !_.isEmpty(vm.address);
    }

    // Show modify button if address is valid and we can't save
    function hasModify() {
      return vm.isValid && vm.addressStatus !== 'PENDING' && !hasSave();
    }

    // Show validate button if address is not valid
    function hasValidate() {
      return !vm.isValid;
    }

    // Show validate button if address is valid and not equal to the original
    function hasSave() {
      return vm.isValid && !angular.equals(origAddress, vm.address);
    }

    function modify() {
      vm.address = {};
      resetForm();
      vm.isValid = false;
    }

    function save() {
      vm.loadingSave = true;
      // updateAddress has expensive object operation, so run in next digest cycle so loading animation can start
      $timeout(updateAddress, 100);
    }

    function updateAddress() {
      $q.resolve()
        .then(function () {
          // If address wasn't initalized, create a new site, otherwise update the existing address
          if (_.isEmpty(origAddress)) {
            return PstnServiceAddressService.createCustomerSite(Authinfo.getOrgId(), Authinfo.getOrgName(), vm.address);
          } else {
            return PstnServiceAddressService.updateAddress(Authinfo.getOrgId(), vm.address);
          }
        })
        .then(function () {
          Notification.success('settingsServiceAddress.saveSuccess');
          vm.addressStatus = "PENDING";
          origAddress = _.cloneDeep(vm.address);
          vm.addressFound = false;
        })
        .catch(function (response) {
          Notification.errorResponse(response, 'settingsServiceAddress.saveError');
        })
        .finally(function () {
          vm.loadingSave = false;
        });
    }

    function cancelSave() {
      initAddress(origAddress);
      vm.addressFound = false;
    }

    function validate() {
      vm.loadingValidate = true;

      PstnServiceAddressService.lookupAddressV2(vm.address, vm.carrierId)
        .then(function (address) {
          if (address) {
            vm.address = address;
            vm.isValid = true;
            vm.addressFound = true;
            resetForm();
          } else {
            Notification.error('pstnSetup.serviceAddressNotFound');
          }
        })
        .catch(function (response) {
          Notification.errorResponse(response);
        })
        .finally(function () {
          vm.loadingValidate = false;
        });
    }

    function cancelEdit() {
      resetForm();
      initAddress(origAddress);
      vm.addressFound = false;
    }

    function resetForm() {
      if (vm.form) {
        vm.form.$setPristine();
        vm.form.$setUntouched();
      }
    }
  }
})();
