(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('ScheduleUpgradeChecker', ScheduleUpgradeChecker);

  /*@ngInject*/
  function ScheduleUpgradeChecker(ScheduleUpgradeService, NotificationService, Authinfo) {
    function check(serviceType, serviceId) {
      ScheduleUpgradeService.get(Authinfo.getOrgId(), serviceType)
        .then(function (data) {
          if (!data.isAdminAcknowledged) {
            NotificationService.addNotification(
              NotificationService.types.TODO,
              'acknowledgeScheduleUpgrade',
              2,
              'modules/hercules/notifications/schedule-upgrade.html', [serviceId],
              null
            );
          }
        });
    }

    return {
      check: check
    };
  }
}());
