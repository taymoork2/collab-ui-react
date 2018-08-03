(function () {
  'use strict';

  /* @ngInject */
  function ReassignClusterControllerV2(cluster, connector, FeatureToggleService, MediaClusterServiceV2, MediaServiceAuditService, $translate, $modalInstance, Notification, HybridServicesClusterService) {
    var vm = this;

    vm.options = [];
    vm.selectPlaceholder = $translate.instant('mediaFusion.add-resource-dialog.cluster-placeholder');
    vm.selectedCluster = '';
    vm.groups = null;
    vm.groupResponse = null;
    vm.clusterDetail = null;
    vm.hasMfQosFeatureToggle = false;
    vm.hasMfMediaEncryptionFeatureToggle = false;

    FeatureToggleService.supports(FeatureToggleService.features.atlasMediaServiceQos).then(function (response) {
      vm.hasMfQosFeatureToggle = response;
    });

    FeatureToggleService.supports(FeatureToggleService.features.atlasMediaServiceMediaEncryption).then(function (response) {
      vm.hasMfMediaEncryptionFeatureToggle = response;
    });

    vm.getClusters = function () {
      HybridServicesClusterService.getAll()
        .then(function (clusters) {
          vm.clusters = _.filter(clusters, { targetType: 'mf_mgmt' });
          vm.options = _.map(vm.clusters, 'name');
          vm.options.sort();
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'mediaFusion.genericError');
        });
    };
    vm.getClusters();

    vm.reassignText = $translate.instant(
      'mediaFusion.reassign.reassignTextV2', {
        clusterName: connector.hostname,
        displayName: cluster.name,
      });
    vm.saving = false;
    vm.canContinue = function () {
      if (vm.selectedCluster == vm.selectPlaceholder || vm.selectedCluster == '') {
        return false;
      }
      return true;
    };

    vm.reassign = function () {
      vm.saving = true;

      _.each(vm.clusters, function (cluster) {
        if (cluster.name == vm.selectedCluster) {
          vm.clusterDetail = cluster;
        }
      });

      if (vm.clusterDetail == null) {
        HybridServicesClusterService.preregisterCluster(vm.selectedCluster, 'stable', 'mf_mgmt').then(function (res) {
          vm.clusterDetail = res;
          // Add the created cluster to property set
          MediaClusterServiceV2.getPropertySets()
            .then(function (propertySets) {
              if (propertySets.length > 0) {
                vm.videoPropertySet = _.filter(propertySets, {
                  name: 'videoQualityPropertySet',
                });
                if (vm.videoPropertySet.length > 0) {
                  var clusterPayload = {
                    assignedClusters: vm.clusterDetail.id,
                  };
                  // Assign it the property set with cluster list
                  MediaClusterServiceV2.updatePropertySetById(vm.videoPropertySet[0].id, clusterPayload);
                }
                if (vm.hasMfQosFeatureToggle) {
                  vm.qosPropertySet = _.filter(propertySets, {
                    name: 'qosPropertySet',
                  });
                  if (vm.qosPropertySet.length > 0) {
                    var clusterQosPayload = {
                      assignedClusters: vm.clusterDetail.id,
                    };
                    // Assign it the property set with cluster list
                    MediaClusterServiceV2.updatePropertySetById(vm.qosPropertySet[0].id, clusterQosPayload);
                  }
                }
                if (vm.hasMfMediaEncryptionFeatureToggle) {
                  vm.mediaEncryptionPropertySet = _.filter(propertySets, {
                    name: 'mediaEncryptionPropertySet',
                  });
                  if (vm.mediaEncryptionPropertySet.length > 0) {
                    var clusterMediaEncryptionPayload = {
                      assignedClusters: vm.clusterDetail.id,
                    };
                    // Assign it the property set with cluster list
                    MediaClusterServiceV2.updatePropertySetById(vm.mediaEncryptionPropertySet[0].id, clusterMediaEncryptionPayload);
                  }
                }
              }
            });
          MediaServiceAuditService.devOpsAuditEvents('cluster', 'add', vm.clusterDetail.id);
          moveHost(res);
        }, function () {
          vm.error = $translate.instant('mediaFusion.reassign.reassignErrorMessage', {
            hostName: vm.selectedCluster,
          });
          Notification.error(vm.error);
        });
      } else {
        moveHost();
      }
    };

    function moveHost() {
      HybridServicesClusterService.moveEcpNode(connector.id, cluster.id, vm.clusterDetail.id).then(function () {
        MediaServiceAuditService.devOpsAuditEvents('node', 'move', connector.hostserial);
        $modalInstance.close();
        Notification.success('mediaFusion.moveHostSuccess');
      }).catch(function (err) {
        vm.error = $translate.instant('mediaFusion.reassign.reassignErrorMessage', {
          hostName: vm.selectedCluster,
        });
        Notification.errorWithTrackingId(err, vm.error);
      });
    }
  }

  angular
    .module('Mediafusion')
    .controller('ReassignClusterControllerV2', ReassignClusterControllerV2);
}());
