require('../style/common.scss');
require('../style/callbackGroup.scss');

(function () {
  'use strict';

  angular
    .module('Gemini')
    .controller('CbgRequestCtrl', CbgRequestCtrl);

  /* @ngInject */
  function CbgRequestCtrl($state, $scope, $element, $translate, $rootScope, $stateParams, cbgService, Notification) {
    var vm = this;
    var customerId = _.get($stateParams, 'customerId');

    vm.model = {};
    vm.countries = [];
    vm.countryDisable = '';
    vm.$onInit = $onInit;
    vm.onSubmit = onSubmit;
    vm.messages = {
      customerName: {
        required: $translate.instant('common.invalidRequired'),
        maxlength: $translate.instant('gemini.inputLengthError', { length: 64, field: $translate.instant('gemini.cbgs.request.labelCustomer') }),
      },
      customerAttribute: {
        maxlength: $translate.instant('gemini.inputLengthError', { length: 200, field: $translate.instant('gemini.cbgs.field.alias') }),
      },
    };

    function $onInit() {
      $scope.$watchCollection(function () {
        return vm.countries;
      }, function (countries) {
        vm.countryDisable = (countries.length ? 'show' : '');
      });
    }

    function onSubmit() {
      vm.loading = true;
      vm.model.countries = _.map(vm.countries, function (item) {
        return { id: item.value, name: item.label };
      });
      vm.model.groupName = vm.model.customerName;
      vm.model.customerId = customerId;

      $element.find('input').attr('readonly', true);
      $element.find('a.select-toggle').addClass('disabled');
      cbgService.postRequest(customerId, vm.model)
        .then(function () {
          $rootScope.$emit('cbgsUpdate', true);
          $state.modal.close();
        })
        .catch(function (err) {
          Notification.errorResponse(err, 'errors.statusError', { status: err.status });
        });
    }
  }
})();
