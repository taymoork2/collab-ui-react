(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewPSTNToSNotification', OverviewPSTNToSNotification);

  /* @ngInject */
  function OverviewPSTNToSNotification($modal) {
    return {
      createNotification: function createNotification() {
        var notification = {
          badgeText: 'common.alert',
          badgeType: 'error',
          canDismiss: true,
          dismiss: function () {},
          link: function () {
            $modal.open({
              templateUrl: 'modules/huron/pstnSetup/pstnToS/pstnToS.intelepeer.tpl.html',
              controller: 'PstnToSCtrl',
              controllerAs: 'pstnToS',
              type: 'Large',
            });
          },
          name: 'pstnToS',
          text: 'pstnSetup.notification.text',
          linkText: 'pstnSetup.notification.textLink',
        };
        return notification;
      },
    };
  }
})();
