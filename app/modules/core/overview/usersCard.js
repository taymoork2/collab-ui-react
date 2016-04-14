(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewUsersCard', OverviewUsersCard);

  /* @ngInject */
  function OverviewUsersCard($state) {
    return {
      createCard: function createCard() {
        var card = {};

        card.name = 'overview.cards.users.title';
        card.template = 'modules/core/overview/usersCard.tpl.html';
        card.cardClass = 'user-card';
        card.icon = 'icon-circle-user';

        card.unlicensedUsersHandler = function (data) {
          if (data.success) {
            card.usersToConvert = Math.max((data.resources || []).length, data.totalResults);
            // for now use the length to get the count as there is a bug in CI and totalResults is not accurate.
          }
        };

        card.orgEventHandler = function (data) {
          if (data.success) {
            card.ssoEnabled = data.ssoEnabled || false;
            card.dirsyncEnabled = data.dirsyncEnabled || false;
            //ssoEnabled is used in enterpriseSettingsCtrl so share through rootScope
            if (data.ssoEnabled) {
              $rootScope.ssoEnabled = true;
            }
          }
        };

        card.openConvertModal = function () {
          $state.go('users.convert', {});
        };

        return card;
      }
    };
  }
})();
