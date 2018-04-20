(function () {
  'use strict';

  angular
    .module('GSS')
    .controller('GssIframeCtrl', GssIframeCtrl);

  function GssIframeCtrl($modal, $scope, $state, $translate, GSSIframeService, Notification, FeatureToggleService, GSSService, UrlConfig) {
    var vm = this;
    var addServiceOptionValue = 'addService';

    vm.addService = addService;
    vm.onServiceSelectionChanged = onServiceSelectionChanged;

    vm.isLoading = false;
    vm.isCompareVersionLoading = true;
    vm.syncUp = syncUp;
    vm.init = init;

    FeatureToggleService.gssWebexCHPEnabledGetStatus().then(function (isOnCHPWebex) {
      if (isOnCHPWebex) {
        GSSIframeService.setGssUrl(UrlConfig.getGssUrlWebexCHP());
        syncCheck();
      } else {
        GSSIframeService.setGssUrl(UrlConfig.getGssUrlAWSCHP());
        vm.isEqualVersion = true;
        init();
      }
    });

    function addService() {
      $modal.open({
        type: 'small',
        controller: 'AddServiceCtrl',
        controllerAs: 'addServiceCtrl',
        template: require('modules/gss/services/addService/addService.tpl.html'),
        modalClass: 'status-add-service',
      }).result.then(function () {
        GSSService.getServices()
          .then(function (services) {
            vm.options = buildServiceOptions(services);
            var newService = _.last(services);
            vm.selected = findServiceOptionWithId(newService.serviceId);

            onServiceSelectionChanged();
            notifyServiceAdded();
          });
      }).catch(function () {
        setServiceSelection();
      });
    }

    function buildServiceOptions(services) {
      var serviceOptions = _.map(services, function (service) {
        return {
          label: service.serviceName,
          value: service.serviceId,
        };
      });

      return [].concat(serviceOptions, {
        label: $translate.instant('gss.addStatusPage'),
        value: addServiceOptionValue,
      });
    }

    function findServiceOptionWithId(serviceId) {
      return _.find(vm.options, {
        value: serviceId,
      });
    }

    function notifyServiceAdded() {
      $scope.$broadcast('serviceAdded');
    }

    function onServiceSelectionChanged() {
      if (vm.selected.value === addServiceOptionValue) {
        vm.addService();
      } else {
        vm.lastSelectd = vm.selected;
        GSSService.setServiceId(vm.selected.value);
      }
    }

    function syncCheck() {
      GSSIframeService.syncCheck().then(function (syncResult) {
        vm.isCompareVersionLoading = false;
        vm.isEqualVersion = syncResult;
        if (vm.isEqualVersion) {
          init();
        }
      });
    }

    function syncUp() {
      vm.isLoading = true;
      GSSIframeService.syncUp().then(function () {
        vm.isEqualVersion = true;
        Notification.success('gss.syncSucceed');
        init();
      })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'gss.syncError');
        })
        .finally(function () {
          vm.isLoading = false;
        });
    }

    function init() {
      vm.headerTabs = [{
        title: $translate.instant('gss.dashboard'),
        state: 'gss.dashboard',
      }, {
        title: $translate.instant('gss.services'),
        state: 'gss.services',
      }, {
        title: $translate.instant('gss.components'),
        state: 'gss.components',
      }, {
        title: $translate.instant('gss.incidents'),
        state: 'gss.incidents',
      }];

      vm.selected = '';
      vm.lastSelectd = '';

      GSSService.getServices()
        .then(function (services) {
          vm.options = buildServiceOptions(services);
          setServiceSelection();
        });

      $scope.$watch(function () {
        return $state.current.name;
      }, function (newValue) {
        if (newValue === 'gss') {
          $state.go('gss.dashboard');
        }
      });

      $scope.$on('serviceEdited', function () {
        GSSService.getServices()
          .then(function (services) {
            vm.options = buildServiceOptions(services);
            setServiceSelection();
          });
      });

      $scope.$on('serviceDeleted', function () {
        GSSService.getServices()
          .then(function (services) {
            vm.options = buildServiceOptions(services);
            setServiceSelection();
          });
      });
    }

    function hasServices() {
      return vm.options.length > 1;
    }

    function setServiceSelection() {
      if (hasServices()) {
        var lastSelection = findServiceOptionWithId(vm.lastSelectd.value);

        if (!_.isNil(lastSelection)) {
          vm.selected = lastSelection;
        } else {
          vm.selected = vm.options[0];
        }

        GSSService.setServiceId(vm.selected.value);
      } else {
        vm.selected = '';

        GSSService.setServiceId(undefined);
      }
    }
  }
})();
