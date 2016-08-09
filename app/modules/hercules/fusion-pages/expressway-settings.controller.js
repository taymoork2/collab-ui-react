(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ExpresswayClusterSettingsController', ExpresswayClusterSettingsController);

  /* @ngInject */
  function ExpresswayClusterSettingsController($stateParams, FusionClusterService, XhrNotificationService, Notification, $modal, $state, $translate) {
    var vm = this;
    vm.backUrl = 'cluster-list';
    vm.usersPlaceholder = 'Default';
    vm.usersSelected = '';
    vm.usersOptions = ['Default'];
    vm.enabledServices = [];
    vm.newClusterName = '';
    vm.upgradeSchedule = {
      title: 'hercules.expresswayClusterSettings.upgradeScheduleHeader'
    };
    vm.releasechannel = {
      title: 'hercules.expresswayClusterSettings.releasechannelHeader',
      description: 'hercules.expresswayClusterSettings.releasechannelParagraph'
    };
    vm.deactivateServices = {
      title: 'hercules.expresswayClusterSettings.deactivateServicesHeader'
    };
    vm.deregisterClusterSection = {
      title: 'hercules.expresswayClusterSettings.deregisterClusterHeader'
    };
    vm.renameClusterSection = {
      title: 'hercules.expresswayClusterSettings.clusterMainSectionHeader'
    };
    vm.localizedCallServiceName = $translate.instant('hercules.serviceNameFromConnectorType.c_ucmc');
    vm.localizedCalendarServiceName = $translate.instant('hercules.serviceNameFromConnectorType.c_cal');
    vm.localizedClusterNameWatermark = $translate.instant('hercules.expresswayClusterSettings.clusterNameWatermark');
    vm.nameUpdated = false;
    vm.setClusterName = setClusterName;
    vm.deactivateService = deactivateService;
    vm.deregisterCluster = deregisterCluster;

    FusionClusterService.getAllProvisionedConnectorTypes($stateParams.id)
      .then(function (allConnectorTypes) {
        vm.enabledServices = allConnectorTypes;
      });

    loadCluster($stateParams.id);

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
            clusterName: cluster.name
          });
          vm.newClusterName = vm.cluster.name;
        }, XhrNotificationService.notify);
    }

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

    function deregisterCluster(cluster) {
      $modal.open({
        resolve: {
          cluster: function () {
            return cluster;
          },
          isF410enabled: true
        },
        controller: 'ClusterDeregisterController',
        controllerAs: 'clusterDeregister',
        templateUrl: 'modules/hercules/cluster-deregister/deregister-dialog.html',
        type: 'small'
      })
      .result.then(function () {
        $state.go('cluster-list');
      });
    }

    function setClusterName(newClusterName) {
      if (newClusterName.length === 0) {
        Notification.error('hercules.expresswayClusterSettings.clusterNameCannotByEmpty');
        return;
      }
      FusionClusterService.setClusterName(vm.cluster.id, newClusterName)
        .then(function () {
          vm.cluster.name = newClusterName;
          Notification.success('hercules.expresswayClusterSettings.clusterNameSaved');
        }, function () {
          Notification.error('hercules.expresswayClusterSettings.clusterNameCannotBeSaved');
        });
    }

  }
})();
