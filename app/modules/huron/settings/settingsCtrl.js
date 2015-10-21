(function () {
  'use strict';
  angular
    .module('uc.hurondetails')
    .controller('HuronSettingsCtrl', HuronSettingsCtrl);

  /* @ngInject */
  function HuronSettingsCtrl($scope, Authinfo, $q, $translate, HttpUtils, Notification, CallerId, ExternalNumberService) {

    var vm = this;
    var companyCallerIdType = 'Company Caller ID';
    vm.processing = true;
    vm.init = init;
    vm.save = save;
    vm.resetSettings = resetSettings;
    vm.model = {
      callerId: {
        callerIdEnabled: null,
        uuid: '',
        callerIdName: '',
        callerIdNumber: '',
        currentInput: ''
      }
    };
    var savedModel = null;
    vm.externalNumberPool = [];
    vm.validations = {
      phoneNumber: function (viewValue, modelValue, scope) {
        vm.model.callerId.currentInput = viewValue;
        var value = null;
        if (modelValue || viewValue) {
          value = (modelValue || viewValue);
        }
        if (value) {
          var vLength = value.length;
          if (vLength === 10) {
            value = '+1' + value;
          } else if (vLength === 11) {
            value = '+' + value;
          }

          return /^(\+?)?[\d]{10,11}$/.test(value) || !vm.model.callerId.callerIdEnabled;

        } else {
          return true;
        }

      }
    };

    vm.callerIdFields = [{
      key: 'callerId',
      type: 'nested',
      templateOptions: {
        label: $translate.instant('companyCallerId.companyCallerId'),
        description: $translate.instant('companyCallerId.companyCallerIdDesc')
      },
      data: {
        fields: [{
          key: 'callerIdEnabled',
          type: 'switch'
        }, {
          key: 'callerIdName',
          type: 'input',
          className: 'caller-id-name nested',
          templateOptions: {
            label: $translate.instant('companyCallerId.callerIdName'),
            type: 'text'
          },
          expressionProperties: {
            'templateOptions.required': function () {
              if (vm.model.callerId.callerIdNumber) {
                return true;
              }
            },
            'templateOptions.disabled': function () {
              return !vm.model.callerId.callerIdEnabled;
            }
          }
        }, {
          key: 'callerIdNumber',
          type: 'custom-combobox',
          className: 'caller-id-number nested',
          validators: {
            phoneNumber: {
              expression: vm.validations.phoneNumber,
              message: function () {
                return $translate.instant('callerIdPanel.customNumberValidation');
              }
            }
          },
          templateOptions: {
            label: $translate.instant('companyCallerId.callerIdNumber'),
            combo: true,
            searchableCombo: true
          },
          expressionProperties: {
            'templateOptions.required': function (newValue, oldValue) {
              if (vm.model.callerId.callerIdName) {
                return true;
              }
            },
            'templateOptions.disabled': function () {
              return !vm.model.callerId.callerIdEnabled;
            },
            'templateOptions.currentInput': function () {
              return vm.model.callerId.currentInput;
            }
          },
          controller: function ($scope) {
            ExternalNumberService.refreshNumbers(Authinfo.getOrgId()).then(function () {
              vm.externalNumberPool = ExternalNumberService.getAllNumbers();
              $scope.to.list = ExternalNumberService.getAllNumbers().map(function (item) {
                return item.pattern;
              });
            });
          }
        }]
      }
    }];

    function init() {
      var promises = [];
      vm.processing = true;

      clearCallerIdFields();
      promises.push(CallerId.listCompanyNumbers().then(function (companyNumbers) {
        companyNumbers.forEach(function (companyNumber) {
          if (companyNumber.externalCallerIdType == companyCallerIdType) {
            vm.model.callerId.callerIdEnabled = true;
            vm.model.callerId.uuid = companyNumber.uuid;
            vm.model.callerId.callerIdName = companyNumber.name;
            vm.model.callerId.callerIdNumber = companyNumber.pattern;
          }
        });
        if (!vm.model.callerId.uuid) {
          vm.model.callerId.callerIdEnabled = false;
        }
      }));

      $q.all(promises).finally(function () {
        savedModel = angular.copy(vm.model);
        vm.processing = false;
      });
    }

    function save() {
      resetForm();
      vm.processing = true;
      var promises = [];
      promises.push(saveCompanyCallerId());
      $q.all(promises).then(function () {
        Notification.notify([$translate.instant('huronSettings.saveSuccess')], 'success');
      }).catch(function (response) {
        Notification.errorResponse(response, 'huronSettings.companyCallerIdsaveError');
      }).finally(function () {
        savedModel = angular.copy(vm.model);
        vm.processing = false;
      });
    }

    function saveCompanyCallerId() {
      var uuidExternalNumber = '';
      var data;

      if (!vm.model.callerId.callerIdEnabled && vm.model.callerId.uuid) {
        return CallerId.deleteCompanyNumber(vm.model.callerId.uuid).then(function () {
          clearCallerIdFields();
        });
      } else {
        data = {
          name: vm.model.callerId.callerIdName,
          externalCallerIdType: companyCallerIdType,
          pattern: vm.model.callerId.callerIdNumber,
          externalNumber: {
            uuid: null,
            pattern: null
          }
        };
        angular.forEach(vm.externalNumberPool, function (externalNumber) {
          if (vm.model.callerId.callerIdNumber === externalNumber.pattern) {
            uuidExternalNumber = externalNumber.uuid;
          }
        });
        if (uuidExternalNumber) {
          data.externalNumber.uuid = uuidExternalNumber;
          data.externalNumber.pattern = vm.model.callerId.callerIdNumber;
        }

        if (vm.model.callerId.callerIdEnabled && !vm.model.callerId.uuid) {
          if (vm.model.callerId.callerIdName && vm.model.callerId.callerIdNumber) {
            return CallerId.saveCompanyNumber(data);
          }
        } else if (vm.model.callerId.callerIdEnabled && vm.model.callerId.uuid) {
          if (vm.model.callerId.callerIdName && vm.model.callerId.callerIdNumber) {
            return CallerId.updateCompanyNumber(vm.model.callerId.uuid, data);
          }
        }
      }
    }

    function resetForm() {
      if (vm.form) {
        vm.form.$setPristine();
        vm.form.$setUntouched();
      }
    }

    function resetSettings() {
      setModel(savedModel);
      resetForm();
    }

    function clearCallerIdFields() {
      vm.model.callerId.uuid = '';
      vm.model.callerId.callerIdName = '';
      vm.model.callerId.callerIdNumber = '';
    }

    function setModel(data) {
      vm.model.callerId.callerIdEnabled = data.callerId.callerIdEnabled;
      vm.model.callerId.uuid = data.callerId.uuid;
      vm.model.callerId.callerIdName = data.callerId.callerIdName;
      vm.model.callerId.callerIdNumber = data.callerId.callerIdNumber;
    }

    $scope.$watch(function () {
      return vm.model.callerId.callerIdEnabled;
    }, function (newValue, oldValue, scope) {
      // vm.form.callerIdName.$setValidity('required', true);
      if (newValue && !vm.model.callerId.uuid && !vm.model.callerId.callerIdName) {
        vm.model.callerId.callerIdName = Authinfo.getOrgName();
      }
    });

    HttpUtils.setTrackingID().then(function () {
      init();
    });

  }
})();
