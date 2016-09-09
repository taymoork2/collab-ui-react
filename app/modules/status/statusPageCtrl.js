(function () {
  'use strict';

  angular
    .module('Status')
    .controller('statusPageCtrl', StatusPageCtrl);

  /* @ngInject */
  function StatusPageCtrl($translate, $scope, statusService) {
    var vm = this;
    vm.service = statusService;

    //cs-page-header
    vm.pageTitle = $translate.instant('statusPage.pageTitle');
    vm.headerTabs = [
      {
        title: $translate.instant('statusPage.dashboard'),
        state: 'status-dashboard'
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
    vm.selected = null;
    vm.options = [
      {
        'label': $translate.instant('statusPage.addStatusPage'),
        'value': 'create'
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
      return sList;
    });

    //emit change event to child
    $scope.$watch(
      function () {
        return vm.selected;
      },
      function (selected) {
        if (selected != null) {
          vm.service.setServiceId(selected.value);
        }
      }
    );

  }
})();
