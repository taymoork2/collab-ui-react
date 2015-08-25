(function () {
  'use strict';

  angular
    .module('uc.callrouter')
    .controller('CallRouterCtrl', CallRouterCtrl);

  /* @ngInject */
  function CallRouterCtrl($scope, Config, Authinfo, RouterCompanyNumber, CallRouterService, ServiceSetup, Notification, $modal, $translate) {
    var vm = this;
    vm.save = save;
    vm.addNew = addNew;
    vm.model = {};
    vm.firstTimeCallerID = true;

    vm.validations = {
      phoneNumber: function (viewValue, modelValue, scope) {
        var value = modelValue || viewValue;
        var vLength = value.length;
        if (vLength === 10) {
          value = '+1' + value;
        } else if (vLength === 11) {
          value = '+' + value;
        }
        return /^(\+1)?[0-9]{10}$/.test(value);
      }
    };

    vm.user = [{
      className: 'row',
      fieldGroup: [{
        className: 'small-6 columns',
        type: 'input',
        key: 'orgname',
        templateOptions: {
          label: $translate.instant('routingModal.label'),
          required: true
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
          label: $translate.instant('routingModal.calleridnumber'),
          required: true
        },
        controller: function ($scope, RouterCompanyNumber) {
          RouterCompanyNumber.loadExternalNumberPool('').then(function (data) {
            vm.externalNumberPool = data.externalNumberPool;
            $scope.to.list = data.numbers;
          });
        }
      }]
    }];

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
        RouterCompanyNumber.saveCompanyNumber(data).then(function (data) {
          Notification.notify([$translate.instant('callRouter.saveCallerIdSuccess')], 'success');
        }).catch(function (response) {
          Notification.errorResponse(response, 'callRouter.saveCallerIdError');
        });
      } else {
        RouterCompanyNumber.updateCompanyNumber(data, vm.uuid).then(function (data) {
          Notification.notify([$translate.instant('callRouter.updateCallerIdSuccess')], 'success');
        }).catch(function (response) {
          Notification.errorResponse(response, 'callRouter.updateCallerIdError');
        });
      }

    }

    function addNew() {
      var modalInstance = $modal.open({
        templateUrl: 'modules/huron/callRouter/companyNumber/companyNumber.html',
        controller: 'companyNumber'
      });
    }

    init();

  }

})();
