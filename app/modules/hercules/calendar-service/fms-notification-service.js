(function () {
  'use strict';

  /*@ngInject*/
  function FmsNotificationService(NotificationService, ClusterService) {

    //TODO: Fix passive subscribe
    ClusterService.subscribe(refresh, {
      passive: true
    });

    function refresh() {
      var clusters = ClusterService.getClusters();
      if (_.size(clusters) === 0) {
        NotificationService.addNotification(
          'todo',
          'fuseNotPerformed',
          1,
          'modules/hercules/notifications/fuse-not-performed.html', {});
      }
      //else {
      //  NotificationService.removeNotification('todo', 'fuseNotPerformed');
      //}
    }

    return {
      refresh: refresh
    };
  }

  angular
    .module('Hercules')
    .service('FmsNotificationService', FmsNotificationService);

}());
