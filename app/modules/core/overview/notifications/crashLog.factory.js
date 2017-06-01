(function () {
  'use strict';

  angular
      .module('Core')
      .factory('OverviewCrashLogNotification', OverviewCrashLogNotification);

  /* @ngInject */
  function OverviewCrashLogNotification($state, Orgservice, Authinfo) {
    return {
      createNotification: function createNotification() {
        var notification = {
          badgeText: 'common.info',
          badgeType: 'info',
          canDismiss: true,
          dismiss: function () {
            var settings = {
              allowCrashLogUpload: true,
            };
            Orgservice.setOrgSettings(Authinfo.getOrgId(), settings);
          },
          link: function () {
            $state.go('settings');
          },
          linkText: 'homePage.viewOrEditSettings',
          name: 'crashlog',
          text: 'globalSettings.privacy.crashReportNotificationText',
        };

        return notification;
      },
    };
  }
})();
