(function () {
  'use strict';

  /* @ngInject */
  function ExpresswayServiceClusterController(XhrNotificationService, ServiceStatusSummaryService, $state, $modal, $stateParams, $translate, ClusterService, HelperNuggetsService) {
    var vm = this;
    vm.state = $state;
    vm.clusterId = $stateParams.cluster.id;
    vm.serviceType = $stateParams.serviceType;
    vm.serviceId = HelperNuggetsService.serviceType2ServiceId(vm.serviceType);
    vm.serviceName = $translate.instant('hercules.serviceNames.' + vm.serviceId);

    vm.cluster = ClusterService.getClusters()[vm.clusterId];

    vm.selectedService = function () {
      return _.find(vm.cluster.services, {
        service_type: vm.serviceType
      });
    };

    vm.alarms2hosts = _.memoize(function () {
      var alarms = {};

      _.forEach(vm.selectedService().connectors, function (conn) {
        _.forEach(conn.alarms, function (alarm) {
          if (!alarms[alarm.id]) {
            alarms[alarm.id] = {
              alarm: alarm,
              hosts: []
            };
          }
          alarms[alarm.id].hosts.push(conn.host);
        });
      });
      var mappedAlarms = _.toArray(alarms);
      return mappedAlarms;
    });

    //TODO: Don't like this linking to routes...
    vm.route = HelperNuggetsService.serviceType2RouteName(vm.serviceType);

    vm.serviceNotInstalled = function () {
      return ServiceStatusSummaryService.serviceNotInstalled(vm.serviceType, vm.cluster);
    };

    vm.upgrade = function () {
      $modal.open({
        templateUrl: "modules/hercules/expressway-service/software-upgrade-dialog.html",
        controller: SoftwareUpgradeController,
        controllerAs: "softwareUpgrade",
        resolve: {
          serviceId: function () {
            return vm.serviceId;
          }
        }
      }).result.then(function () {
        ClusterService
          .upgradeSoftware(vm.clusterId, vm.serviceType)
          .then(function () {}, XhrNotificationService.notify);
      });
    };

    /* @ngInject */
    function SoftwareUpgradeController(serviceId, $translate, $modalInstance) {
      var modalVm = this;
      modalVm.newVersion = vm.selectedService().not_approved_package.version;
      modalVm.oldVersion = vm.selectedService().connectors[0].version;
      modalVm.serviceId = serviceId;
      modalVm.serviceName = $translate.instant('hercules.serviceNames.' + modalVm.serviceId);
      modalVm.ok = function () {
        $modalInstance.close();
      };
      modalVm.cancel = function () {
        $modalInstance.dismiss();
      };
      modalVm.clusterName = vm.cluster.name;
    }
  }

  angular
    .module('Hercules')
    .controller('ExpresswayServiceClusterController', ExpresswayServiceClusterController);
}());
