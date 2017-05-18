(function () {
  'use strict';

  angular
    .module('Gemini')
    .controller('CbgRequestCtrl', CbgRequestCtrl);

  /* @ngInject */
  function CbgRequestCtrl($state, $scope, $element, $translate, $rootScope, $stateParams, cbgService, Notification, gemService) {
    var vm = this;
    var customerId = _.get($stateParams, 'customerId');

    vm.model = {};
    vm.countries = [];
    vm.countryDisable = '';
    vm.$onInit = $onInit;
    vm.onSubmit = onSubmit;
    vm.onWarning = onWarning;
    vm.messages = {
      customerName: {
        required: $translate.instant('common.invalidRequired'),
        warning: $translate.instant('gemini.invalidCharacters', { field: 'Callback Group Name' }),
        maxlength: $translate.instant('gemini.inputLengthError', { length: 64, field: 'Customer Name' }),
      },
    };

    function $onInit() {
      $scope.$watchCollection(function () {
        return vm.countries;
      }, function (countries) {
        vm.countryDisable = (countries.length ? 'show' : '');
      });
    }

    function onWarning() {
      var reg = /[<>~!@#$%^&*=|/<>"{}[\]:;']+/g;
      return reg.test(vm.model.customerName);
    }

    function onSubmit() {
      vm.loading = true;
      vm.model.countries = _.map(vm.countries, function (item) {
        return { countryId: item.value, countryName: item.label };
      });

      $element.find('input').attr('readonly', true);
      $element.find('a.select-toggle').addClass('disabled');
      cbgService.postRequest(customerId, vm.model)
        .then(function (res) {
          var returnCode = _.get(res.content, 'data.returnCode');
          if (returnCode) {
            Notification.notify(gemService.showError(returnCode));
            return;
          }
          $rootScope.$emit('cbgsUpdate', true);
          $state.modal.close();
        });
    }
  }
})();
