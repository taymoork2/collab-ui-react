(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewPstnTermsOfServiceNotification', OverviewPstnTermsOfServiceNotification);

  /* @ngInject */
  function OverviewPstnTermsOfServiceNotification($modal) {
    return {
      createNotification: function createNotification() {
        var notification = {
          badgeText: 'common.alert',
          badgeType: 'error',
          canDismiss: true,
          dismiss: function () {},
          link: function () {
            $modal.open({
              template: '<uc-pstn-terms-of-service on-dismiss="$dismiss()"></uc-pstn-terms-of-service>',
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
