(function () {
  'use strict';

  angular.module('Huron')
    .controller('ExternalNumberDetailCtrl', ExternalNumberDetail);

  /* @ngInject */
  function ExternalNumberDetail($stateParams, $translate, $q, ExternalNumberService, ModalService, ExternalNumberPool, Notification) {
    var vm = this;
    vm.currentCustomer = $stateParams.currentCustomer;
    vm.refresh = false;

    vm.allNumbers = ExternalNumberService.getAllNumbers() || [];
    vm.pendingNumbers = [];
    vm.unassignedNumbers = filterUnassignedNumbers() || [];

    // Initialize filtered arrays for translation directives
    vm.filteredAllNumbers = [];
    vm.filteredPendingNumbers = [];
    vm.filteredUnassignedNumbers = [];

    vm.allText = $translate.instant('common.all');
    vm.pendingText = $translate.instant('common.pending');
    vm.unassignedText = $translate.instant('common.unassigned');

    vm.deleteNumber = deleteNumber;
    vm.listPhoneNumbers = listPhoneNumbers;

    listPhoneNumbers();

    function listPhoneNumbers() {
      if (vm.currentCustomer && vm.currentCustomer.customerOrgId) {
        vm.refresh = true;
        var promises = [];
        var promise = ExternalNumberPool.getAll(vm.currentCustomer.customerOrgId).then(function (results) {
          setAllNumbers(results);
        }).catch(function (response) {
          setAllNumbers([]);
          Notification.errorResponse(response, 'externalNumberPanel.listError');
        });
        promises.push(promise);
        // Add pending refresh

        $q.all(promises).finally(function () {
          vm.refresh = false;
        });
      } else {
        setAllNumbers([]);
      }
    }

    function filterUnassignedNumbers() {
      vm.unassignedNumbers = vm.allNumbers.filter(function (number) {
        return number.directoryNumber === null;
      });
    }

    function deleteNumber(number) {
      ModalService.open({
        title: $translate.instant('externalNumberPanel.deleteNumber'),
        message: $translate.instant('externalNumberPanel.deleteConfirmation', {
          pattern: number.pattern
        }) + '<br>' + $translate.instant('externalNumberPanel.deleteWarning'),
        close: $translate.instant('common.yes'),
        dismiss: $translate.instant('common.no'),
        type: 'danger'
      }).result.then(function () {
        return ExternalNumberPool.deletePool(vm.currentCustomer.customerOrgId, number.uuid)
          .then(function () {
            Notification.success('notifications.successDelete', {
              item: number.pattern
            });
            _.remove(vm.allNumbers, number);
            ExternalNumberService.setAllNumbers(vm.allNumbers);
            filterUnassignedNumbers();
          }).catch(function (response) {
            Notification.errorResponse(response, 'notifications.errorDelete', {
              item: number.pattern
            });
          });
      });
    }

    function setAllNumbers(allNumbers) {
      allNumbers = allNumbers || [];
      vm.allNumbers = allNumbers;
      ExternalNumberService.setAllNumbers(allNumbers);
      filterUnassignedNumbers();
    }
  }
})();
