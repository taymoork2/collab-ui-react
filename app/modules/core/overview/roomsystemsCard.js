(function () {
  'use strict';

  // TODO: refactor - do not use 'ngtemplate-loader' or ng-include directive
  var genericCardTemplatePath = require('ngtemplate-loader?module=Core!./genericCard.tpl.html');

  angular
    .module('Core')
    .factory('OverviewRoomSystemsCard', OverviewRoomSystemsCard);

  /* @ngInject */
  function OverviewRoomSystemsCard(Authinfo, OverviewHelper) {
    return {
      createCard: function createCard() {
        var card = {};
        card.template = genericCardTemplatePath;
        card.icon = 'icon-circle-telepresence';
        card.desc = 'overview.cards.roomSystem.desc';
        card.name = 'overview.cards.roomSystem.title';
        card.cardClass = 'cs-card';
        card.enabled = false;
        card.trial = false;
        card.notEnabledText = 'overview.cards.roomSystem.notEnabledText';
        card.notEnabledFooter = 'overview.contactPartner';
        card.currentTitle = 'overview.cards.roomSystem.currentTitle';
        card.previousTitle = 'overview.cards.roomSystem.previousTitle';
        card.settingsUrl = '/devices';
        card.helper = OverviewHelper;
        card.showHealth = true;
        card.isCSB = Authinfo.isCSB();
        card.isDeviceEnabled = false;

        card.healthStatusUpdatedHandler = function (data) {
          _.each(data.components, function (component) {
            if (component.id === card.helper.statusIds.SparkMeeting) {
              card.healthStatus = card.helper.mapStatus(card.healthStatus, component.status);
              card.healthStatusAria = card.helper.mapStatusAria(card.healthStatus, component.status);
            }
          });
        };

        card.reportDataEventHandler = function (event, response) {
          if (!response.data.success) return;
          if (event.name == 'activeRoomsLoaded' && response.data.spanType == 'week' && response.data.intervalCount >= 2) {
            card.current = Math.round(response.data.data[response.data.data.length - 1].count);
            card.previous = Math.round(response.data.data[response.data.data.length - 2].count);
          }
        };

        card.licenseEventHandler = function (licenses) {
          card.allLicenses = licenses;
          card.trial = _.some(filterLicenses(licenses), {
            isTrial: true,
          });

          if (filterLicenses(licenses).length > 0) {
            card.enabled = true; //don't disable if no licenses in case test org..
          }
        };

        function filterLicenses(licenses) {
          return _.filter(licenses, function (l) {
            return l.offerName === 'SD' && card.helper.isntCancelledOrSuspended(l); //SD = Shared Devices
          });
        }

        card.orgEventHandler = function (data) {
          if (data.success && data.isTestOrg && card.allLicenses && card.allLicenses.length === 0) {
            card.enabled = true; //If we are a test org and allLicenses is empty, enable the card.
          }
        };
        return card;
      },
    };
  }
})();
