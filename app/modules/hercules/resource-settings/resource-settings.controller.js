(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('FusionResourceSettingsController', FusionResourceSettingsController);

  /* @ngInject */
  function FusionResourceSettingsController($stateParams, $log, FusionClusterService, XhrNotificationService) {

    var vm = this;
    vm.title = ' Settings';

    loadCluster($stateParams.clusterid);

    function loadCluster(clusterid) {
      FusionClusterService.getAll()
        .then(function (clusters) {
          var cluster = _.find(clusters, function (c) {
            return c.id === clusterid;
          });
          vm.cluster = cluster;
        }, XhrNotificationService.notify);
    }
  }
})();