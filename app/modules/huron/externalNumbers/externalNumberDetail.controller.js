(function () {
  'use strict';

  angular.module('Huron')
    .controller('ExternalNumberDetailCtrl', ExternalNumberDetail);

  /* @ngInject */
  function ExternalNumberDetail($stateParams, $translate, DialPlanService, ExternalNumberService,
      ModalService, Notification, TelephoneNumberService) {
    var vm = this;
    vm.currentCustomer = $stateParams.currentCustomer;

    // Initialize arrays from service
    getNumbers();

    // Initialize filtered arrays for translation directives
    vm.filteredUnassignedNumbers = [];

    vm.showPstnSetup = false;

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
      ModalService.open({
        title: $translate.instant('externalNumberPanel.deleteNumber'),
        message: $translate.instant('externalNumberPanel.deleteConfirmation', {
          pattern: number.number
        }) + '<br>' + $translate.instant('externalNumberPanel.deleteWarning'),
        close: $translate.instant('common.yes'),
        dismiss: $translate.instant('common.no'),
        btnType: 'negative'
      }).result.then(function () {
        return ExternalNumberService.deleteNumber(vm.currentCustomer.customerOrgId, number)
          .then(function () {
            Notification.success('notifications.successDelete', {
              item: number.number
            });
            listPhoneNumbers();
          }).catch(function (response) {
            Notification.errorResponse(response, 'notifications.errorDelete', {
              item: number.number
            });
          });
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
