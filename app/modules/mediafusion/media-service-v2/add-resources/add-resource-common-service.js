(function () {
  'use strict';

  /* @ngInject */
  function AddResourceCommonServiceV2($translate, $q, $window, HybridServicesClusterService, HybridServicesExtrasService, MediaServiceActivationV2, MediaClusterServiceV2, Notification) {
    var vm = this;
    vm.clusters = null;
    vm.onlineNodeList = [];
    vm.offlineNodeList = [];
    vm.clusterList = [];
    vm.selectedClusterId = '';
    vm.currentServiceId = 'squared-fusion-media';

    // Forming clusterList which contains all cluster name of type mf_mgmt and sorting it.
    function updateClusterLists() {
      vm.clusters = null;
      vm.clusterList = [];
      vm.onlineNodeList = [];
      vm.offlineNodeList = [];
      var deferred = $q.defer();
      HybridServicesClusterService.getAll()
        .then(function (clusters) {
          vm.clusters = _.filter(clusters, {
            targetType: 'mf_mgmt',
          });
          _.each(clusters, function (cluster) {
            if (cluster.targetType === 'mf_mgmt') {
              vm.clusterList.push(cluster.name);
              _.each(cluster.connectors, function (connector) {
                if ('running' == connector.state) {
                  vm.onlineNodeList.push(connector.hostname);
                } else {
                  vm.offlineNodeList.push(connector.hostname);
                }
              });
            }
          });
          vm.clusterList.sort();
          deferred.resolve(vm.clusterList);
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'mediaFusion.genericError');
        });
      return deferred.promise;
    }

    function addRedirectTargetClicked(hostName, enteredCluster) {
      vm.clusterDetail = null;
      //Checking if the host is already present
      if (vm.onlineNodeList.indexOf(hostName) > -1) {
        Notification.error('mediaFusion.add-resource-dialog.serverOnline');
        return $q.reject();
      }

      if (vm.offlineNodeList.indexOf(hostName) > -1) {
        Notification.error('mediaFusion.add-resource-dialog.serverOffline');
        return $q.reject();
      }

      //Checking if value in selected cluster is in cluster list
      _.each(vm.clusters, function (cluster) {
        if (cluster.name == enteredCluster) {
          vm.clusterDetail = cluster;
        }
      });
      if (vm.clusterDetail == null) {
        var deferred = $q.defer();
        HybridServicesClusterService.preregisterCluster(enteredCluster, 'stable', 'mf_mgmt')
          .then(function (resp) {
            vm.selectedClusterId = resp.id;
            // Add the created cluster to property set
            MediaClusterServiceV2.getPropertySets()
              .then(function (propertySets) {
                if (propertySets.length > 0) {
                  vm.videoPropertySet = _.filter(propertySets, {
                    name: 'videoQualityPropertySet',
                  });
                  if (vm.videoPropertySet.length > 0) {
                    var clusterPayload = {
                      assignedClusters: vm.selectedClusterId,
                    };
                    // Assign it the property set with cluster list
                    MediaClusterServiceV2.updatePropertySetById(vm.videoPropertySet[0].id, clusterPayload);
                  }
                }
              });

            deferred.resolve(whiteListHost(hostName, vm.selectedClusterId));
          })
          .catch(function (error) {
            var errorMessage = $translate.instant('mediaFusion.clusters.clusterCreationFailed', {
              enteredCluster: enteredCluster,
            });
            Notification.errorWithTrackingId(error, errorMessage);
          });
        return deferred.promise;
      } else {
        vm.selectedClusterId = vm.clusterDetail.id;
        return whiteListHost(hostName, vm.selectedClusterId);
      }
    }

    function whiteListHost(hostName, clusterId) {
      return HybridServicesExtrasService.addPreregisteredClusterToAllowList(hostName, clusterId);
    }

    function redirectPopUpAndClose(hostName, enteredCluster) {
      vm.popup = $window.open('https://' + encodeURIComponent(hostName) + '/?clusterName=' + encodeURIComponent(enteredCluster) + '&clusterId=' + encodeURIComponent(vm.selectedClusterId));
    }

    function enableMediaServiceEntitlements() {
      return MediaServiceActivationV2.enableMediaServiceEntitlements();
    }

    function enableMediaService() {
      return MediaServiceActivationV2.enableMediaService(vm.currentServiceId);
    }

    function validateHostName(hostName) {
      var regex = new RegExp(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|((?!:\/\/)([a-zA-Z0-9-]+\.)?[a-zA-Z0-9-][a-zA-Z0-9-]+\.[a-zA-Z]{2,6}))$/g);
      return regex.test(hostName);
    }

    function createFirstTimeSetupCluster(hostName, enteredCluster) {
      var deferred = $q.defer();
      HybridServicesClusterService.preregisterCluster(enteredCluster, 'stable', 'mf_mgmt').then(function (result) {
        deferred.resolve();
        vm.selectedClusterId = result.id;
        // Cluster created, now creating a property set for video quality
        var payLoad = {
          type: 'mf.group',
          name: 'videoQualityPropertySet',
          properties: {
            'mf.videoQuality': 'false',
          },
        };
        MediaClusterServiceV2.createPropertySet(payLoad)
          .then(function (response) {
            vm.videoPropertySetId = response.data.id;
            var clusterPayload = {
              assignedClusters: vm.selectedClusterId,
            };
            // Assign it the property set with cluster id
            MediaClusterServiceV2.updatePropertySetById(vm.videoPropertySetId, clusterPayload)
              .then('', function (err) {
                Notification.errorWithTrackingId(err, 'mediaFusion.videoQuality.error');
              });
          });
        whiteListHost(hostName, vm.selectedClusterId);
      }, function (error) {
        deferred.reject();
        var errorMessage = $translate.instant('mediaFusion.clusters.clusterCreationFailed', {
          enteredCluster: enteredCluster,
        });
        Notification.errorWithTrackingId(error, errorMessage);
      });
      return deferred.promise;
    }

    return {
      addRedirectTargetClicked: addRedirectTargetClicked,
      updateClusterLists: updateClusterLists,
      redirectPopUpAndClose: redirectPopUpAndClose,
      enableMediaServiceEntitlements: enableMediaServiceEntitlements,
      createFirstTimeSetupCluster: createFirstTimeSetupCluster,
      enableMediaService: enableMediaService,
      validateHostName: validateHostName,
    };
  }
  angular
    .module('Mediafusion')
    .service('AddResourceCommonServiceV2', AddResourceCommonServiceV2);
}());
