(function () {
  'use strict';

  angular
    .module('uc.callrouter')
    .controller('CallRouterCtrl', CallRouterCtrl);

  /* @ngInject */
  function CallRouterCtrl($scope, Config, Authinfo, RouterCompanyNumber, CallRouterService, ServiceSetup, Notification, $modal, $translate) {
    var vm = this;
    vm.save = save;
    // vm.addNew = addNew;
    vm.model = {};
    vm.firstTimeCallerID = true;
    vm.btnDisabled = true;

    vm.validations = {
      phoneNumber: function (viewValue, modelValue, scope) {
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

          return /^(\+?)?[\d]{10,11}$/.test(value);

        } else {
          return true;
        }

      }
    };

    vm.disableFn = function () {
      if ((vm.model.extnum === '' || angular.isUndefined(vm.model.extnum)) && (vm.model.orgname === '' || angular.isUndefined(vm.model.orgname))) {
        return false;
      } else {
        return (!vm.callrouterform.$dirty) || (vm.callrouterform.$dirty && vm.callrouterform.$invalid);
      }
    };

    vm.user = [{
      className: 'row',
      fieldGroup: [{
        className: 'small-6 columns',
        type: 'input',
        key: 'orgname',
        templateOptions: {
          required: true,
          label: $translate.instant('routingModal.label'),
          onChange: getDisabledState
        },
        expressionProperties: {
          'templateOptions.required': function () {
            if (vm.model.extnum !== "" && angular.isDefined(vm.model.extnum)) {
              return true;
            }
          }
        }
      }, {
        className: 'small-6 columns',
        type: 'custom-combobox',
        key: 'extnum',
        validators: {
          phoneNumber: {
            expression: vm.validations.phoneNumber,
            message: function () {
              return $translate.instant('validation.callForward');
            }
          }
        },
        templateOptions: {
          required: true,
          label: $translate.instant('routingModal.calleridnumber'),
          onChangeFn: getDisabledState,
          combo: true,
          searchableCombo: true
        },
        expressionProperties: {
          'templateOptions.required': function () {
            if (vm.model.orgname !== "" && angular.isDefined(vm.model.orgname)) {
              return true;
            }
          }
        },
        controller: function ($scope, RouterCompanyNumber) {
          RouterCompanyNumber.loadExternalNumberPool('').then(function (data) {
            vm.externalNumberPool = data.externalNumberPool;
            $scope.to.list = data.numbers;
          });
        }
      }]
    }];

    function getDisabledState() {
      if (vm.firstTimeCallerID) {
        if (vm.model.orgname !== "" && angular.isDefined(vm.model.extnum) && vm.model.extnum !== "" && vm.callrouterform.$valid) {
          vm.btnDisabled = false;
        } else {
          vm.btnDisabled = true;
        }
      } else {
        if ((vm.model.orgname === "" && (vm.model.extnum === "" || angular.isUndefined(vm.model.extnum))) || (vm.model.orgname !== "" && angular.isDefined(vm.model.extnum) && vm.model.extnum !== "" && vm.callrouterform.$valid)) {
          vm.btnDisabled = false;
        } else {
          vm.btnDisabled = true;
        }
      }
    }

    function init() {
      RouterCompanyNumber.listCompanyNumbers().then(function (companyNumbers) {
        angular.forEach(companyNumbers, function (companyNumber) {
          if (companyNumber.externalCallerIdType == "Company Caller ID") {
            vm.model.orgname = companyNumber.name;
            vm.model.extnum = companyNumber.pattern;
            vm.firstTimeCallerID = false;
            vm.uuid = companyNumber.uuid;
          }
        });
        if (vm.firstTimeCallerID) {
          vm.model.orgname = Authinfo.getOrgName();
        }
      });
    }

    function save() {
      var errors = [];
      var uuid;
      var found = false;
      var data;
      angular.forEach(vm.externalNumberPool, function (value, key) {
        if (vm.model.extnum === value.pattern) {
          uuid = value.uuid;
          found = true;
        }
      });
      data = {
        name: vm.model.orgname,
        externalCallerIdType: "Company Caller ID",
        pattern: vm.model.extnum
      };
      data.pattern = vm.model.extnum;
      if (found) {
        data.externalNumber = {
          pattern: vm.model.extnum,
          uuid: uuid
        };
      } else {
        data.externalNumber = {
          pattern: null,
          uuid: null
        };
      }
      if (vm.firstTimeCallerID) {
        if (vm.model.orgname !== "" && vm.model.extnum !== "") {
          RouterCompanyNumber.saveCompanyNumber(data).then(function (data) {
            Notification.notify([$translate.instant('callRouter.saveCallerIdSuccess')], 'success');
            init();
          }).catch(function (response) {
            Notification.errorResponse(response, 'callRouter.saveCallerIdError');
          });
        }
      } else {
        if ((vm.model.orgname !== "" && angular.isDefined(vm.model.orgname)) && (vm.model.extnum !== "" && angular.isDefined(vm.model.extnum))) {
          RouterCompanyNumber.updateCompanyNumber(data, vm.uuid).then(function (data) {
            Notification.notify([$translate.instant('callRouter.updateCallerIdSuccess')], 'success');
          }).catch(function (response) {
            Notification.errorResponse(response, 'callRouter.updateCallerIdError');
          });
        } else if ((vm.model.orgname === "" || angular.isUndefined(vm.model.orgname)) && (vm.model.extnum === "" || angular.isUndefined(vm.model.extnum))) {
          RouterCompanyNumber.deleteCompanyNumber(data, vm.uuid).then(function (data) {
            vm.firstTimeCallerID = true;
            vm.model.orgname = Authinfo.getOrgName();
            Notification.notify([$translate.instant('callRouter.deleteCallerIdSuccess')], 'success');
          }).catch(function (response) {
            Notification.errorResponse(response, 'callRouter.deleteCallerIdError');
          });
        }
      }
    }

    // function addNew() {
    //   var modalInstance = $modal.open({
    //     templateUrl: 'modules/huron/callRouter/companyNumber/companyNumber.html',
    //     controller: 'companyNumber'
    //   });
    // }

    init();

  }

})();
