(function () {
  'use strict';

  /* @ngInject */
  function MediaServiceSettingsControllerV2($stateParams, Analytics, HybridServicesClusterService, Authinfo, Orgservice, MediaClusterServiceV2, Notification) {
    var vm = this;
    vm.config = '';
    vm.wx2users = '';
    vm.serviceType = 'mf_mgmt';
    vm.serviceId = 'squared-fusion-media';
    vm.cluster = $stateParams.cluster;
    vm.enableVideoQuality = false;
    vm.setEnableVideoQuality = setEnableVideoQuality;
    vm.createPropertySetAndAssignClusters = createPropertySetAndAssignClusters;
    vm.updatePropertySet = updatePropertySet;
    vm.clusterCount = 0;
    vm.successCount = 0;
    vm.errorCount = 0;
    vm.settingsValue = null;
    vm.videoPropertySet = [];
    vm.videoPropertySetId = null;

    vm.emailSection = {
      title: 'common.general',
    };

    vm.videoQuality = {
      title: 'mediaFusion.videoQuality.title',
    };

    var params = {
      disableCache: true,
    };

    // Getting the value of orgSettings.isMediaFusionFullQualityVideo and setting it to enableVideoQuality
    Orgservice.getOrg(function (response) {
      vm.enableVideoQuality = _.get(response, 'orgSettings.isMediaFusionFullQualityVideo');
      vm.enableVideoQuality = (vm.enableVideoQuality === undefined) ? false : vm.enableVideoQuality;
      //Getting all the property sets
      MediaClusterServiceV2.getPropertySets()
        .then(function (propertySets) {
          if (propertySets.length > 0) {
            vm.videoPropertySet = _.filter(propertySets, {
              name: 'videoQualityPropertySet',
            });
            // If there is no property set with name mfVideoPropertycreate one
            if (vm.videoPropertySet.length === 0) {
              createPropertySetAndAssignClusters();
            }
          } else if (propertySets.length === 0) {
            // If there is no property set create one
            createPropertySetAndAssignClusters();
          }
        });
    }, null, params);

    function createPropertySetAndAssignClusters() {
      // First get all clusters to form cluster id list
      HybridServicesClusterService.getAll()
        .then(function (clusters) {
          vm.clusters = _.filter(clusters, {
            targetType: 'mf_mgmt',
          });
          var payLoad = {
            type: 'mf.group',
            name: 'videoQualityPropertySet',
            properties: {
              'mf.videoQuality': 'false',
            },
          };
          // Create property set
          MediaClusterServiceV2.createPropertySet(payLoad)
            .then(function (response) {
              vm.videoPropertySetId = response.data.id;
              var clusterPayload = {
                assignedClusters: _.map(vm.clusters, 'id'),
              };
              // Assign it the property set with cluster list
              MediaClusterServiceV2.updatePropertySetById(vm.videoPropertySetId, clusterPayload)
                .then('', function (err) {
                  Notification.errorWithTrackingId(err, 'mediaFusion.videoQuality.error');
                });
            });
        });
    }

    function setEnableVideoQuality() {
      //Setting the value for video quality in CI.
      var settings = {
        isMediaFusionFullQualityVideo: vm.enableVideoQuality,
      };
      Orgservice.setOrgSettings(Authinfo.getOrgId(), settings);
      //Setting the value for video quality in all clusters using Tag.
      var payLoad = {
        properties: {
          'mf.videoQuality': vm.enableVideoQuality,
        },
      };
      // Check if there is value in vm.videoPropertySetId else get the propertyset id
      if (vm.videoPropertySetId === null) {
        MediaClusterServiceV2.getPropertySets()
          .then(function (propertySets) {
            if (propertySets.length > 0) {
              var videoPropertySet = _.filter(propertySets, {
                name: 'videoQualityPropertySet',
              });
              updatePropertySet(videoPropertySet[0].id, payLoad);
            }
          });
      } else {
        updatePropertySet(vm.videoPropertySetId, payLoad);
      }
    }

    function updatePropertySet(id, payLoad) {
      // Assign the modified video quality to property set
      MediaClusterServiceV2.updatePropertySetById(id, payLoad)
        .then(function () {
          Notification.success('mediaFusion.videoQuality.success');
        }, function (err) {
          Notification.errorWithTrackingId(err, 'mediaFusion.videoQuality.error');
        });
    }

    vm.deactivateModalOptions = {
      template: require('modules/mediafusion/media-service-v2/settings/confirm-disable-dialog.html'),
      controller: 'DisableMediaServiceController',
      controllerAs: 'disableServiceDialog',
      type: 'small',
    };

    Analytics.trackHybridServiceEvent(Analytics.sections.HS_NAVIGATION.eventNames.VISIT_MEDIA_SETTINGS);
  }

  angular
    .module('Mediafusion')
    .controller('MediaServiceSettingsControllerV2', MediaServiceSettingsControllerV2);
}());
