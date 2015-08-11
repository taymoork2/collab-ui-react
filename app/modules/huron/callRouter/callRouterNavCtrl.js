  (function () {
    'use strict';

    angular
      .module('uc.callrouter')
      .controller('CallRouterNavCtrl', CallRouterNavCtrl);

    /* @ngInject */
    function CallRouterNavCtrl($scope, Config, Authinfo, CallRouterFactory, CallRouterService, ServiceSetup, Notification, $modal, $translate) {
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
          className: 'col-xs-6',
          type: 'input',
          key: 'orgname',
          templateOptions: {
            label: $translate.instant('routingModal.label'),
            required: true
          }
        }, {
          className: 'col-xs-6',
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
          controller: function ($scope, CallRouterFactory) {
            CallRouterFactory.loadExternalNumberPool('').then(function (data) {
              vm.externalNumberPool = data.externalNumberPool;
              $scope.to.list = data.numbers;
            });
          }
        }]
      }];
      init();

      function init() {

        CallRouterFactory.getCallRouterId().then(function (data) {
          if (data[0].name) {
            vm.model.orgname = data[0].name;
            vm.model.extnum = data[0].externalNumber.pattern;
            vm.firstTimeCallerID = false;
            vm.uuid = data[0].uuid;
          } else {
            vm.model.orgname = Authinfo.getOrgName();
          }
        });
      }

      function save() {
        var errors = [];
        var uuid;
        var typed = false;
        var data;
        angular.forEach(vm.externalNumberPool, function (value, key) {
          if (vm.model.extnum === value.pattern) {
            uuid = value.uuid;
            typed = true;
          }
        });
        data = {
          name: vm.model.orgname,
          externalCallerIdType: "Company Caller ID",
          pattern: vm.model.extnum
        };
        if (typed) {
          data.externalNumber = {
            pattern: vm.model.extnum,
            uuid: uuid
          };
        } else {
          data.pattern = vm.model.extnum;
        }
        if (vm.firstTimeCallerID) {
          CallRouterFactory.saveCallerId(data).then(function (data) {
            Notification.notify([$translate.instant('callRouter.saveCallerIdSuccess', {})], 'success');
          }).catch(function (response) {
            Notification.errorResponse(response, 'callRouter.saveCallerIdError');
            // errors.push(Notification.processErrorResponse(response, 'callRouter.saveCallerIdError'));
          });
        } else {

          CallRouterFactory.updateCallerId(data, vm.uuid).then(function (data) {
            Notification.notify([$translate.instant('callRouter.updateCallerIdSuccess', {})], 'success');
          }).catch(function (response) {
            // errors.push(Notification.processErrorResponse(response, 'callRouter.updateCallerIdError'));
            Notification.errorResponse(response, 'callRouter.updateCallerIdError');
          });
        }

      }

      function addNew() {
        var modalInstance = $modal.open({
          templateUrl: 'modules/huron/callRouter/CreateCompanyNumber/CompanyNumber.html',
          controller: 'createCompanyNumber'
        });
      }
    }
  })();
