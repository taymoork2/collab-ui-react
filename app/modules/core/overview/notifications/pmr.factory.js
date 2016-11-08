(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewPMRNotification', OverviewPMRNotification);

  /* @ngInject */
  function OverviewPMRNotification($modal) {
    return {
      createNotification: function createNotification() {
        var notification = {
          badgeText: 'homePage.todo',
          badgeType: 'warning',
          canDismiss: true,
          dismiss: function () {},
          link: function () {
            $modal.open({
              templateUrl: 'modules/core/setupWizard/enterpriseSettings/enterprise.pmrSetupModal.tpl.html',
              controller: 'EnterpriseSettingsCtrl',
              controllerAs: 'entprCtrl',
              type: 'small'
            });
          },
          linkText: 'homePage.setUpPMRUrl',
          name: 'pmr',
          text: 'homePage.setUpPMRDescription'
        };

        return notification;
      }
    };
  }
})();
