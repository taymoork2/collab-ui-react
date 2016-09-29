(function () {
  'use strict';

  angular
    .module('Status')
    .controller('statusPageCtrl', StatusPageCtrl);

  /* @ngInject */
  function StatusPageCtrl($translate, $scope, statusService, $state, $modal) {
    var vm = this;
    vm.service = statusService;

    //cs-page-header
    vm.pageTitle = $translate.instant('statusPage.pageTitle');
    vm.headerTabs = [
      {
        title: $translate.instant('statusPage.dashboard'),
        state: '.dashboard'
      },
      {
        title: $translate.instant('statusPage.components'),
        state: '.components'
      },
      {
        title: $translate.instant('statusPage.incidents'),
        state: '.incidents'
      }
    ];

    //cs-select
    vm.tabSelected = vm.headerTabs[0];
    vm.selected = null;
    vm.lastSelected = null;
    vm.options = [
      {
        'label': $translate.instant('statusPage.addStatusPage'),
        'value': 'addService'
      }
    ];
    vm.selectPlaceholder = 'Select One';

    //init cs-select options
    vm.service.getServices().then(function (services) {
      var sList = _.map(services, function (service) {
        return {
          label: service.serviceName,
          value: service.serviceId
        };
      });
      vm.options = [].concat(sList, vm.options);
      vm.selected = vm.options[0];
      $state.go("status.dashboard");
      return sList;
    });

    vm.addService = function addService() {
      var addServiceModal = $modal.open({
        type: 'small',
        controller: 'addServiceCtrl',
        controllerAs: 'add',
        templateUrl: 'modules/status/addService.html',
        modalClass: 'status-add-service'
      });
      addServiceModal.result.then(function () {
        vm.service.getServices().then(function (services) {
          var sList = _.map(services, function (service) {
            return {
              label: service.serviceName,
              value: service.serviceId
            };
          });
          vm.options = [].concat(sList, [
            {
              'label': $translate.instant('statusPage.addStatusPage'),
              'value': 'addService'
            }
          ]);
          vm.selected = vm.lastSelected;
          return sList;
        });
      });
    };
    //emit change event to child
    $scope.$watch(
      function () {
        return vm.selected;
      },
      function (selected) {
        if (selected != null) {
          if (selected.value === 'addService') {
            vm.addService();
            vm.selected = vm.lastSelected;
          } else {
            vm.lastSelected = vm.selected;
            vm.service.setServiceId(selected.value);
          }
        }
      }
    );

  }
})();
