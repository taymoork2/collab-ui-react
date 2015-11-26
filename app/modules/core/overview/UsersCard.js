(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewUsersCard', OverviewUsersCard);

  /* @ngInject */
  function OverviewUsersCard() {
    return {
      createCard: function createCard() {
        var card = {};

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
          }
        };

        return card;
      }
    };
  }
})();
