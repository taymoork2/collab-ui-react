(function () {
  'use strict';

  var broadsoftCardTemplatePath = require('ngtemplate-loader?module=Core!./bsftCard.tpl.html');

  angular
    .module('Core')
    .factory('OverviewBroadsoftCard', OverviewBroadsoftCard);

  /* @ngInject */
  function OverviewBroadsoftCard($window, Authinfo, BsftCustomerService) {
    return {
      createCard: function createCard() {
        var card = {};
        card.loading = false;
        card.features = {};
        card.trial = false;
        card.settingsUrl = 'https://www.broadsoft.com/';
        card.enabled = true;
        card.name = 'overview.cards.broadsoft.title';
        card.template = broadsoftCardTemplatePath;
        card.cardClass = 'user-card';
        card.icon = 'icon-circle-call';
        card.isUpdating = true;

        card.openBroadsoftPortal = function () {
          card.loading = true;
          BsftCustomerService.getBsftCustomerLogin(Authinfo.getOrgId()).then(function (response) {
            card.loading = false;
            $window.open(response.crossLaunchUrl, '_blank');
          });
        };

        return card;
      },
    };
  }
})();
