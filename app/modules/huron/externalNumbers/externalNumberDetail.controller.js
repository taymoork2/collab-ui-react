(function () {
  'use strict';

  angular.module('Huron')
    .controller('ExternalNumberDetailCtrl', ExternalNumberDetail);

  /* @ngInject */
  function ExternalNumberDetail($stateParams, $translate, DialPlanService, ExternalNumberService, $modal, $scope, Notification, TelephoneNumberService) {
    var vm = this;
    vm.currentCustomer = $stateParams.currentCustomer;
    vm.apiImplementation = undefined;

    // Initialize arrays from service
    getNumbers();

    // Initialize filtered arrays for translation directives
    vm.filteredUnassignedNumbers = [];

    vm.assignedModel = '';
    vm.unassignedModel = '';
    vm.loading = false;

    vm.assignedText = $translate.instant('common.assigned');
    vm.pendingText = $translate.instant('common.pending');
    vm.unassignedText = $translate.instant('common.unassigned');
    vm.findNumber = $translate.instant('externalNumberPanel.findNumber');

    vm.deleteNumber = deleteNumber;
    vm.listPhoneNumbers = listPhoneNumbers;
    vm.getQuantity = getQuantity;
    vm.getAllAssignedNumbers = getAllAssignedNumbers;
    vm.getAllUnassignedNumbers = getAllUnassignedNumbers;
    vm.refreshAssignedOnDelete = refreshAssignedOnDelete;
    vm.refreshUnassignedOnDelete = refreshUnassignedOnDelete;

    vm.isNumberValid = TelephoneNumberService.validateDID;

    init();

    function init() {
      setCountryCode()
        .then(function () {
          listPhoneNumbers();
          ExternalNumberService.getCarrierInfo(vm.currentCustomer.customerOrgId)
          .then(function (response) {
            vm.apiImplementation = _.get(response, 'apiImplementation');
          });
        });
    }

    function listPhoneNumbers() {
      if (vm.currentCustomer && vm.currentCustomer.customerOrgId) {
        vm.refresh = true;
        return ExternalNumberService.getPendingNumbersAndOrders(vm.currentCustomer.customerOrgId)
          .catch(function (response) {
            Notification.errorResponse(response, 'externalNumberPanel.listError');
          })
          .finally(getNumbers);
      } else {
        ExternalNumberService.clearNumbers();
        getNumbers();
      }
    }

    function setCountryCode() {
      return DialPlanService.getCustomerDialPlanCountryCode(vm.currentCustomer.customerOrgId)
        .then(TelephoneNumberService.setCountryCode)
        .catch(function (response) {
          Notification.errorResponse(response, 'serviceSetupModal.customerDialPlanDetailsGetError');
        });
    }

    function deleteNumber(number) {
      var deleteNumberScope = $scope.$new(true);
      deleteNumberScope.numberInfo = {
        orgId: vm.currentCustomer.customerOrgId,
        externalNumber: number.number,
        apiImplementation: vm.apiImplementation,
      };
      deleteNumberScope.refreshFn = listPhoneNumbers;

      $modal.open({
        scope: deleteNumberScope,
        template: '<delete-external-number number-info="numberInfo" refresh-fn="refreshFn()" dismiss="$dismiss()"></delete-external-number>',
        type: 'dialog',
      });
    }

    function getNumbers() {
      getAllAssignedNumbers('');
      getAllUnassignedNumbers('');
      vm.pendingList = ExternalNumberService.getPendingNumbers().concat(ExternalNumberService.getPendingOrders());
      vm.refresh = false;
    }

    function getQuantity(type) {
      return ExternalNumberService.getQuantity(type);
    }

    function getAllAssignedNumbers(hint) {
      if (!vm.currentCustomer.customerOrgId) {
        vm.assignedNumbers = [];
        return;
      }
      vm.loading = true;

      ExternalNumberService.getAssignedNumbersV2(vm.currentCustomer.customerOrgId, hint).then(function (data) {
        vm.assignedNumbers = data;
      }).finally(function () {
        vm.loading = false;
      });
    }

    function getAllUnassignedNumbers(hint) {
      if (!vm.currentCustomer.customerOrgId) {
        vm.unassignedNumbers = [];
        return;
      }

      vm.loading = true;

      ExternalNumberService.getUnassignedNumbersV2(vm.currentCustomer.customerOrgId, hint).then(function (data) {
        vm.unassignedNumbers = data;
      }).finally(function () {
        vm.loading = false;
      });
    }

    function refreshAssignedOnDelete(event) {
      if (event.keyCode === 8 && vm.assignedModel === '') {
        getAllAssignedNumbers('');
      }
    }

    function refreshUnassignedOnDelete(event) {
      if (event.keyCode === 8 && vm.unassignedModel === '') {
        getAllUnassignedNumbers('');
      }
    }
  }
})();
