(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewMeetingCard', OverviewMeetingCard);

  /* @ngInject */
  function OverviewMeetingCard(OverviewHelper, Authinfo, FeatureToggleService) {
    return {
      createCard: function createCard() {
        var card = {};
        card.template = 'modules/core/overview/genericCard.tpl.html';
        card.icon = 'icon-circle-group';
        card.desc = 'overview.cards.meeting.desc';
        card.name = 'overview.cards.meeting.title';
        card.cardClass = 'cs-card header-bar meetings';
        card.notEnabledText = 'overview.cards.meeting.notEnabledText';
        card.notEnabledFooter = 'overview.contactPartner';
        card.trial = false;
        card.enabled = false;
        card.settingsUrl = '';
        card.helper = OverviewHelper;
        card.showHealth = true;
        card.isCSB = false;

        FeatureToggleService.supports(FeatureToggleService.features.atlasTelstraCsb).then(function (result) {
          card.isCSB = Authinfo.isCSB() && result;
        });

        card.healthStatusUpdatedHandler = function messageHealthEventHandler(data) {
          _.each(data.components, function (component) {
            if (component.id === card.helper.statusIds.SparkCall) {
              card.healthStatus = card.helper.mapStatus(card.healthStatus, component.status);
            }
          });
        };

        card.reportDataEventHandler = function (event, response) {
          if (!response.data.success) return;
          if (event.name === 'groupCallsLoaded' && response.data.spanType === 'month' && response.data.intervalCount >= 2) {
            card.current = Math.round(response.data.data[response.data.data.length - 1].count);
            card.previous = Math.round(response.data.data[response.data.data.length - 2].count);
          }
        };

        card.licenseEventHandler = function (licenses) {
          card.allLicenses = licenses;

          card.trial = _.some(filterLicenses(licenses), {
            'isTrial': true
          });

          var hasSites = _.some(licenses, function (l) {
            return l.siteUrl;
          });

          card.settingsUrl = hasSites ? '#/site-list' : '';

          if (filterLicenses(licenses).length > 0) {
            card.enabled = true; //don't disable if no licenses in case test org..
          }
        };

        card.orgEventHandler = function (data) {
          if (data.success && data.isTestOrg && card.allLicenses && card.allLicenses.length === 0) {
            card.enabled = true; //If we are a test org and allLicenses is empty, enable the card.
          }
        };

        function filterLicenses(licenses) {
          return _.filter(licenses, function (l) {
            //    (['CF', 'EE', 'MC', 'SC', 'TC', 'EC']).contains(l.offername);
            return l.licenseType === 'CONFERENCING' && card.helper.isntCancelledOrSuspended(l);
          });
        }

        return card;
      }
    };
  }
})();
