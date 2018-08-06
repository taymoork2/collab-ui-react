(function () {
  'use strict';

  var broadsoftCardTemplatePath = require('ngtemplate-loader?module=Core!./bsftCard.tpl.html');

  angular
    .module('Core')
    .factory('OverviewBroadsoftCard', OverviewBroadsoftCard);

  /* @ngInject */
  function OverviewBroadsoftCard($window, Authinfo, BsftCustomerService, RialtoService) {
    return {
      createCard: function createCard() {
        var card = {};
        card.loading = false;
        card.features = {};
        card.trial = false;
        card.settingsUrl = 'https://www.broadsoft.com/';
        card.enabled = true;
        card.name = 'overview.cards.call.title';
        card.template = broadsoftCardTemplatePath;
        card.cardClass = 'user-card';
        card.icon = 'icon-circle-call';
        card.isUpdating = true;
        card.disableCrossLaunch = true;
        card.showHealth = true;
        card.healthStatus = 'success';
        card.licenses = [{
          id: 'standardLicense',
          name: 'Standard',
          count: 150,
        }, {
          id: 'placesLicense',
          name: 'Places',
          count: 125,
        }];

        card.openBroadsoftPortal = function () {
          card.loading = true;
          BsftCustomerService.getBsftCustomerLogin(Authinfo.getOrgId()).then(function (response) {
            card.loading = false;
            $window.open(response.crossLaunchUrl, '_blank');
          });
        };

        RialtoService.getCustomer(Authinfo.getOrgId())
          .then(function (response) {
            if (response.rialtoId) {
              card.disableCrossLaunch = false;
            }
          });

        return card;
      },
    };
  }
})();
