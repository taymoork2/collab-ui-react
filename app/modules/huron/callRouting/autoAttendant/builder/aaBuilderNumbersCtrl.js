(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderNumbersCtrl', AABuilderNumbersCtrl); /* was AutoAttendantGeneralCtrl */

  /* @ngInject */
  function AABuilderNumbersCtrl($q, $stateParams, AAUiModelService, AutoAttendantCeInfoModelService, AutoAttendantCeMenuModelService, Authinfo, AutoAttendantCeService,
    AAModelService, Notification) {
    var vm = this;

    vm.aaModel = {};
    vm.ui = {};
    vm.ui.ceInfo = {};
    vm.resourceInfos = {};

    vm.inputNumber = {
      id: '',
      number: '',
      type: 'directoryNumber',
      trigger: 'incomingCall'
    };

    vm.addAAResourceFromInputNumber = addAAResourceFromInputNumber;
    vm.deleteAAResource = deleteAAResource;

    /////////////////////

    function addAAResourceFromInputNumber() {
      if (angular.isUndefined(vm.inputNumber) || vm.inputNumber.number === '') {
        return;
      }

      var resources = vm.ui.ceInfo.getResources();

      // already added to this AA
      var isNumberInUse = vm.ui.ceInfo.getResources().some(function (resource) {
        return resource.getNumber() === vm.inputNumber.number;
      });
      if (isNumberInUse) {
        Notification.error('autoAttendant.errorAddNumberInUse', {
          number: vm.inputNumber.number
        });
        return;
      }

      // already on resource list for another AA
      var otherAAName = '';
      var isNumberInUseOtherAA = vm.aaModel.aaRecords.some(function (record) {
        otherAAName = record.callExperienceName;
        if (otherAAName !== vm.ui.ceInfo.getName()) {
          return record.assignedResources.some(function (resource) {
            return resource.number === vm.inputNumber.number;
          });
        }
      });
      if (isNumberInUseOtherAA) {
        Notification.error('autoAttendant.errorAddNumberInUseOtherAA', {
          name: otherAAName,
          number: vm.inputNumber.number
        });
        return;
      }

      // check if it exists in system and get the id
      $q.all([setInputNumberId(vm.inputNumber.number)])
        .then(function (result) {
          if (vm.inputNumber.id === '') {
            Notification.error('autoAttendant.errorAddNumberNotFound', {
              number: vm.inputNumber.number
            });
            return;
          } else {
            // add new resource for this number
            var resource = AutoAttendantCeInfoModelService.newResource();
            resource.setNumber(vm.inputNumber.number);
            resource.setId(vm.inputNumber.id);
            resource.setType(vm.inputNumber.type);
            resource.setTrigger(vm.inputNumber.trigger);

            resources.push(resource);

            AutoAttendantCeInfoModelService.setCeInfo(vm.aaModel.aaRecord, vm.ui.ceInfo);
            resetInputNumber();
          }
        });
    }

    function setInputNumberId(number) {
      vm.inputNumber.id = number;
      /*  workaround for Tropo-AA integration
      return DirectoryNumberService.query({
          customerId: Authinfo.getOrgId(),
          directoryNumberId: '',
          pattern: number
        }).$promise
        .then(function (dirNumbers) {
          if (angular.isArray(dirNumbers) && dirNumbers.length > 0) {
            vm.inputNumber.id = dirNumbers[0].uuid;
          } else {
            vm.inputNumber.id = '';
          }
        });
        */
    }

    function resetInputNumber() {
      vm.inputNumber.number = '';
      vm.inputNumber.id = '';
    }

    function deleteAAResource(number) {
      var i = 0;
      if (angular.isUndefined(number)) {
        return;
      }

      var resources = vm.ui.ceInfo.getResources();
      for (i = 0; i < resources.length; i++) {
        if (resources[i].getNumber() === number) {
          resources.splice(i, 1);
        }
      }

      AutoAttendantCeInfoModelService.setCeInfo(vm.aaModel.aaRecord, vm.ui.ceInfo);
    }

    function selectAA(aaName) {
      vm.aaModel.aaName = aaName;
      // angular.isUndefine(vm.aaModel.aaRecord);
      if (angular.isUndefined(vm.aaModel.aaRecord)) {
        if (aaName === '') {
          vm.aaModel.aaRecord = AAModelService.newAARecord();
        } else {
          for (var i = 0; i < vm.aaModel.aaRecords.length; i++) {
            if (vm.aaModel.aaRecords[i].callExperienceName === aaName) {
              // vm.aaModel.aaRecord = angular.copy(vm.aaModel.aaRecords[i]);
              AutoAttendantCeService.readCe(vm.aaModel.aaRecords[i].callExperienceURL).then(
                function (data) {
                  vm.aaModel.aaRecord = data;

                  // Workaround for reading the dn number: by copying it from aaRecords[i], until
                  // dn number is officialy stored in ceDefintion.
                  vm.aaModel.aaRecord.assignedResources = angular.copy(vm.aaModel.aaRecords[i].assignedResources);
                  //

                  vm.ui.ceInfo = AutoAttendantCeInfoModelService.getCeInfo(vm.aaModel.aaRecord);
                },
                function (response) {
                  Notification.error('autoAttendant.errorReadCe', {
                    name: aaName,
                    statusText: response.statusText,
                    status: response.status
                  });
                }
              );
              return;
            }
          }
        }
      }
      vm.ui.ceInfo = AutoAttendantCeInfoModelService.getCeInfo(vm.aaModel.aaRecord);
    }

    function activate() {
      var aaName = $stateParams.aaName;

      if (aaName === '') {
        vm.aaNameDisabled = false;
      }

      vm.aaModel = AAModelService.getAAModel();
      vm.ui = AAUiModelService.getUiModel();
      vm.aaModel.dataReadyPromise.then(function (data) {
        selectAA(aaName);
      }, function (data) {
        selectAA(aaName);
      });
    }

    activate();
  }
})();
