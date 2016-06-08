(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('MediafusionClusterSettingsController', MediafusionClusterSettingsController);

  /* @ngInject */
  function MediafusionClusterSettingsController($stateParams, $translate, FusionClusterService, XhrNotificationService) {
    var vm = this;
    vm.backUrl = 'cluster-list';

    ////////////

    loadCluster($stateParams.id);

    function loadCluster(clusterid) {
      FusionClusterService.getAll()
        .then(function (clusters) {
          var cluster = _.find(clusters, function (c) {
            return c.id === clusterid;
          });
          vm.cluster = cluster;
          vm.localizedTitle = $translate.instant('hercules.expresswayClusterSettings.pageTitle', {
            clusterName: cluster.name
          });
        }, XhrNotificationService.notify);
    }
  }
})();
