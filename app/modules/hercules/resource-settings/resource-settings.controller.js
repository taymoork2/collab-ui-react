(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('FusionResourceSettingsController', FusionResourceSettingsController);

  /* @ngInject */
  function FusionResourceSettingsController($stateParams, FusionClusterService, XhrNotificationService, ClusterService, $modal, $state, $translate) {

    var vm = this;

    loadCluster($stateParams.clusterid);

    function loadCluster(clusterid) {
      FusionClusterService.getAll()
        .then(function (clusters) {
          var cluster = _.find(clusters, function (c) {
            return c.id === clusterid;
          });
          vm.cluster = cluster;
          vm.releasechannelsPlaceholder = vm.cluster.releaseChannel;
          vm.releasechannelsSelected = '';
          vm.releasechannelsOptions = [vm.cluster.releaseChannel];
          vm.localizedTitle = $translate.instant('hercules.expresswayClusterSettings.pageTitle', {
            "clusterName": cluster.name
          });
        }, XhrNotificationService.notify);
    }

    vm.usersPlaceholder = 'Default';
    vm.usersSelected = '';
    vm.usersOptions = ['Default'];

    vm.enabledServices = [];
    ClusterService.getAllConnectorTypesForCluster($stateParams.clusterid)
      .then(function (allConnectorTypes) {
        vm.enabledServices = allConnectorTypes;
      });

    vm.deactivateService = deactivateService;

    function deactivateService(serviceId, cluster) {
      $modal.open({
        templateUrl: 'modules/hercules/resource-settings/deactivate-service-on-expressway-modal.html',
        controller: 'DeactivateServiceOnExpresswayModalController',
        controllerAs: 'deactivateServiceOnExpresswayModal',
        type: 'small',
        resolve: {
          serviceId: function () {
            vm.serviceId = serviceId;
            return vm.serviceId;
          },
          clusterName: function () {
            vm.clusterName = cluster.name;
            return vm.clusterName;
          },
          clusterId: function () {
            vm.clusterId = cluster.id;
            return vm.clusterId;
          }
        }
      }).result.then(function (result) {
        if (result !== 'cancelled') {
          vm.enabledServices.splice(vm.enabledServices.indexOf(serviceId.toString()), 1);
        }
      });
    }

    vm.deregisterCluster = deregisterCluster;

    function deregisterCluster(cluster) {
      $modal.open({
          resolve: {
            cluster: function () {
              return vm.cluster;
            }
          },
          controller: 'ClusterDeregisterController',
          controllerAs: 'clusterDeregister',
          templateUrl: 'modules/hercules/cluster-deregister/deregister-dialog.html',
          type: 'small'
        })
        .result.then(function (data) {
          $state.go('cluster-list');
        });
    }



  }
})();
