(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewCareLicenseNotification', OverviewCareLicenseNotification);

  /* @ngInject */
  function OverviewCareLicenseNotification($modal, $state) {
    return {
      createNotification: function createNotification(text, linkText) {
        var notification = {
          badgeText: 'homePage.todo',
          badgeType: 'warning',
          canDismiss: true,
          dismiss: function () {},
          link: function () {
            if ($state.isHybridToggleEnabled) {
              $modal.open({
                template: '<care-voice-features-modal dismiss="$dismiss()" class="care-modal"></care-voice-features-modal>',
              });
              this.dismiss();
            } else {
              $state.go('my-company.subscriptions');
            }
          },
          linkText: linkText,
          name: 'careLicense',
          text: text,
        };

        return notification;
      },
    };
  }
})();
