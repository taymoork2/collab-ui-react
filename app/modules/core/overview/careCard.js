/**
 * Created by sumshami on 28/08/16.
 */
(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewCareCard', OverviewCareCard);

  /* @ngInject */
  function OverviewCareCard(OverviewHelper, Authinfo) {
    return {
      createCard: function createCard() {
        var card = {};
        card.isCSB = Authinfo.isCSB();
        card.template = 'modules/core/overview/genericCard.tpl.html';
        card.icon = 'icon-circle-contact-centre';
        card.desc = 'overview.cards.care.desc';
        card.name = 'overview.cards.care.title';
        card.cardClass = 'cs-card header-bar care-card';
        card.trial = false;
        card.enabled = false;
        card.notEnabledText = 'overview.cards.care.notEnabledText';
        card.notEnabledFooter = 'overview.contactPartner';
        card.helper = OverviewHelper;
        card.showHealth = false;

        return card;
      }
    };
  }
})();
