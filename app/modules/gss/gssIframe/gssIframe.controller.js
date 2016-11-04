(function () {

  'use strict';

  angular
    .module('GSS')
    .controller('GssIframeCtrl', GssIframeCtrl);

  function GssIframeCtrl($scope, $state, $translate, GSSService) {
    var vm = this;
    var serviceList = [];

    vm.serviceList = serviceList;
    vm.pageTitle = $translate.instant('gss.pageTitle');
    vm.headerTabs = [
      {
        title: $translate.instant('gss.dashboard'),
        state: '.dashboard'
      },
      {
        title: $translate.instant('gss.components'),
        state: '.components'
      },
      {
        title: $translate.instant('gss.services'),
        state: '.serviceList'
      },
      {
        title: $translate.instant('gss.incidents'),
        state: '.incidents'
      }
    ];

    vm.tabSelected = vm.headerTabs[0];
    vm.selected = null;
    vm.lastSelected = null;
    vm.options = [
      {
        label: $translate.instant('gss.addStatusPage'),
        value: 'addService'
      }
    ];
    vm.selectPlaceholder = $translate.instant('gss.servicesPlaceholder');
    init();

    function init() {
      GSSService.getServices().then(function (services) {
        vm.serviceList = _.map(services, function (service) {
          return {
            label: service.serviceName,
            value: service.serviceId
          };
        });
        vm.options = [].concat(vm.serviceList, vm.options);
        var serviceId = GSSService.getServiceId();
        if (serviceId) {
          vm.selected = _.find(vm.options, { value: serviceId });
        } else {
          vm.selected = vm.options[0];
        }
        GSSService.setServiceId(vm.selected.value);
        if ($state.current.name === 'gss') {
          $state.go('gss.dashboard');
        }
        return vm.serviceList;
      });
    }

    $scope.$watch(
      function () {
        return vm.selected;
      },
      function (selected) {
        if (selected !== null) {
          vm.lastSelected = vm.selected;
          GSSService.setServiceId(selected.value);
        }
      });
  }
})();
