(function () {
  'use strict';

  angular
    .module('Gemini')
    .controller('CbgRequestCtrl', CbgRequestCtrl);

  /* @ngInject */
  function CbgRequestCtrl($state, $scope, $rootScope, $stateParams, cbgService, Notification, gemService) {
    var vm = this;
    var customerId = _.get($stateParams, 'customerId');

    vm.model = {};
    vm.countries = [];
    vm.countryDisable = '';
    vm.$onInit = $onInit;
    vm.onSubmit = onSubmit;

    function $onInit() {
      $scope.$watchCollection(function () {
        return vm.countries;
      }, function (countries) {
        vm.countryDisable = (countries.length ? 'show' : '');
      });
    }


    function onSubmit() {
      vm.loading = true;
      vm.model.countries = [];
      _.forEach(vm.countries, function (item) {
        vm.model.countries.push({ countryId: item.value, countryName: item.label });
      });

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
