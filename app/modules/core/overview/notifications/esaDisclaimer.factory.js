(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewEsaDisclaimerNotification', OverviewEsaDisclaimerNotification);

  /* @ngInject */
  function OverviewEsaDisclaimerNotification($modal) {
    return {
      createNotification: function createNotification() {
        var notification = {
          badgeText: 'common.alert',
          badgeType: 'alert',
          canDismiss: true,
          dismiss: function () {},
          link: function () {
            $modal.open({
              template: '<uc-esa-disclaimer on-dismiss="$dismiss()"></uc-esa-disclaimer>',
            });
          },
          name: 'pstnEsaDisclaimer',
          text: 'pstnSetup.esaDisclaimer.notificationText',
          linkText: 'pstnSetup.esaDisclaimer.notificationTextLink',
        };
        return notification;
      },
    };
  }
})();
