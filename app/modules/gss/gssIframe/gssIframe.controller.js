(function () {

  'use strict';

  angular
    .module('GSS')
    .controller('GssIframeCtrl', GssIframeCtrl);

  function GssIframeCtrl($modal, $scope, $state, $translate, GSSService) {
    var vm = this;
    var addServiceOptionValue = 'addService';

    vm.addService = addService;

    init();

    function addService() {
      $modal.open({
        type: 'small',
        controller: 'AddServiceCtrl',
        controllerAs: 'addServiceCtrl',
        templateUrl: 'modules/gss/services/addService/addService.tpl.html',
        modalClass: 'status-add-service'
      }).result.then(function () {
        GSSService.getServices()
          .then(function (services) {
            vm.options = buildServiceOptions(services);
            vm.selected = _.nth(vm.options, -2); // the new added service at position -2

            notifyServiceAdded();
          });
      });
    }

    function buildServiceOptions(services) {
      var serviceOptions = _.map(services, function (service) {
        return {
          label: service.serviceName,
          value: service.serviceId
        };
      });

      return [].concat(serviceOptions, {
        label: $translate.instant('gss.addStatusPage'),
        value: addServiceOptionValue
      });
    }

    function findServiceOptionWithId(serviceId) {
      return _.find(vm.options, {
        value: serviceId
      });
    }

    function notifyServiceAdded() {
      $scope.$broadcast('serviceAdded');
    }

    function init() {
      vm.pageTitle = $translate.instant('gss.pageTitle');

      vm.headerTabs = [{
        title: $translate.instant('gss.dashboard'),
        state: 'gss.dashboard'
      }, {
        title: $translate.instant('gss.components'),
        state: 'gss.components'
      }, {
        title: $translate.instant('gss.services'),
        state: 'gss.services'
      }, {
        title: $translate.instant('gss.incidents'),
        state: 'gss.incidents'
      }];

      vm.selected = null;
      vm.lastSelected = null;
      vm.selectPlaceholder = $translate.instant('gss.servicesPlaceholder');

      GSSService.getServices()
        .then(function (services) {
          vm.options = buildServiceOptions(services);

          var serviceId = GSSService.getServiceId();
          if (serviceId) {
            vm.selected = findServiceOptionWithId(serviceId);
          } else {
            vm.selected = vm.options[0];
          }

          GSSService.setServiceId(vm.selected.value);

          if ($state.current.name === 'gss') {
            $state.go('gss.dashboard');
          }
        });

      $scope.$watch(
        function () {
          return vm.selected;
        },
        function (selected) {
          if (!_.isNil(selected)) {

            if (selected.value === addServiceOptionValue) {
              vm.addService();
              vm.selected = vm.lastSelected;
            } else {
              vm.lastSelected = vm.selected;
              GSSService.setServiceId(selected.value);
            }
          }
        });

      $scope.$on('serviceEdited', function () {
        GSSService.getServices()
          .then(function (services) {
            vm.options = buildServiceOptions(services);

            if (vm.selected) {
              vm.selected = findServiceOptionWithId(vm.selected.value);
            }
          });
      });

      $scope.$on('serviceDeleted', function () {
        GSSService.getServices()
          .then(function (services) {
            vm.options = buildServiceOptions(services);

            if (vm.selected) {
              vm.selected = findServiceOptionWithId(vm.selected.value);

              if (vm.selected === undefined) {
                vm.selected = vm.options[0];
              }
            }
          });
      });
    }
  }
})();
