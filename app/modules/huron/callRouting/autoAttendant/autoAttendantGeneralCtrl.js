(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AutoAttendantGeneralCtrl', AutoAttendantGeneralCtrl);

  /* @ngInject */
  function AutoAttendantGeneralCtrl($scope, $q, $stateParams, $translate, AutoAttendantCeInfoModelService, AutoAttendantCeMenuModelService, Authinfo, AutoAttendantCeService,
    DirectoryNumberService, InternalNumberPoolService, ExternalNumberPoolService, AAModelService, Notification) {
    var vm = this;

    vm.aaModel = {};
    vm.ui = {};
    vm.ui.ceInfo = {};
    vm.resourceInfos = {};

    vm.selectedInternalNumber = {
      id: '',
      number: '',
      type: '',
      trigger: ''
    };

    vm.selectedExternalNumber = {
      id: '',
      number: '',
      type: '',
      trigger: ''
    };

    vm.inputNumber = {
      id: '',
      number: '',
      type: 'directoryNumber',
      trigger: 'incomingCall'
    };

    vm.internalNumberPool = [];
    vm.externalNumberPool = [];
    vm.aaNameDisabled = true;

    vm.getAANameDisabled = getAANameDisabled;
    vm.setAANameDisabled = setAANameDisabled;
    vm.addAAResourceFromInputNumber = addAAResourceFromInputNumber;
    vm.deleteAAResource = deleteAAResource;
    vm.addAAName = addAAName;

    /////////////////////

    function addAAName() {
      if (angular.isDefined(vm.ui.ceInfo) && angular.isDefined(vm.ui.ceInfo.getName()) && vm.ui.ceInfo.getName().length > 0) {
        AutoAttendantCeInfoModelService.setCeInfo(vm.aaModel.aaRecord, vm.ui.ceInfo);
      }
    }

    function addAAResourceFromInputNumber() {
      if (angular.isUndefined(vm.inputNumber) || vm.inputNumber.number === '') {
        return;
      }

      var resources = vm.ui.ceInfo.getResources();

      // already on the resource list
      for (var i = 0; i < resources.length; i++) {
        if (resources[i].getNumber() === vm.inputNumber.number) {
          Notification.notify([$translate.instant('autoAttendant.errorAddNumberInUse', {
            number: vm.inputNumber.number
          })], 'error');
          return;
        }
      }

      // new resource to add
      $q.all([setInputNumberId(vm.inputNumber.number)])
        .then(function (result) {
          if (vm.inputNumber.id === '') {
            Notification.notify([$translate.instant('autoAttendant.errorAddNumberNotFound', {
              number: vm.inputNumber.number
            })], 'error');
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
          }
        });
    }

    function setInputNumberId(number) {
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

    function getAANameDisabled() {
      return vm.aaNameDisabled;
    }

    function setAANameDisabled(state) {
      if (state !== true && state !== false) {
        return;
      }
      vm.aaNameDisabled = state;
    }

    function getInternalNumbers() {
      var intNumPool = [{
        id: 'none',
        number: '',
        type: '',
        trigger: ''
      }];
      return InternalNumberPoolService.query({
          customerId: Authinfo.getOrgId(),
          directorynumber: '',
          order: 'pattern'
        }).$promise
        .then(function (intPool) {
          for (var i = 0; i < intPool.length; i++) {
            var dn = {
              id: intPool[i].uuid,
              number: intPool[i].pattern,
              type: 'directoryNumber',
              trigger: 'incomingCall'
            };
            intNumPool.push(dn);
          }
          vm.internalNumberPool = intNumPool;
          return angular.copy(intNumPool);
        });
    }

    function getExternalNumbers() {
      var extNumPool = [{
        id: 'none',
        number: 'None',
        type: '',
        trigger: ''
      }];
      return ExternalNumberPoolService.query({
          customerId: Authinfo.getOrgId(),
          directorynumber: '',
          order: 'pattern'
        }).$promise
        .then(function (extPool) {
          for (var i = 0; i < extPool.length; i++) {
            var dn = {
              id: extPool[i].uuid,
              number: extPool[i].pattern,
              type: '', //tbd
              trigger: '' //tbd
            };
            extNumPool.push(dn);
          }
          vm.externalNumberPool = angular.copy(extNumPool);
          return angular.copy(extNumPool);
        });
    }

    function selectAA(aaName) {
      vm.aaModel.aaName = aaName;
      // angular.isUndefine(vm.aaModel.aaRecord);
      if (angular.isUndefined(vm.aaModel.aaRecord)) {
        if (aaName === '') {
          vm.aaModel.aaRecord = AutoAttendantCeMenuModelService.newAARecord();
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
                  Notification.notify([$translate.instant('autoAttendant.errorReadCe', {
                    name: aaName,
                    statusText: response.statusText,
                    status: response.status
                  })], 'error');
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
      vm.ui = $scope.aa.modal;
      vm.aaModel.dataReadyPromise.then(function (data) {
        selectAA(aaName);
      }, function (data) {
        selectAA(aaName);
      });

      vm.internalNumberPool = getInternalNumbers();
      vm.externalNumberPool = getExternalNumbers();
    }

    activate();
  }
})();
