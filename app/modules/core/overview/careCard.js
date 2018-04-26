(function () {
  'use strict';

  // TODO: refactor - do not use 'ngtemplate-loader' or ng-include directive
  var genericCardTemplatePath = require('ngtemplate-loader?module=Core!./genericCard.tpl.html');
  var HealthStatusID = require('./overview.keys').HealthStatusID;

  angular
    .module('Core')
    .factory('OverviewCareCard', OverviewCareCard);

  /* @ngInject */
  function OverviewCareCard(LicenseCardHelperService, Authinfo) {
    return {
      createCard: function createCard() {
        var card = {};
        card.isCSB = Authinfo.isCSB();
        card.template = genericCardTemplatePath;
        card.icon = 'icon-circle-contact-centre';
        card.desc = 'overview.cards.care.desc';
        card.name = 'overview.cards.care.title';
        card.cardClass = 'cs-card';
        card.trial = false;
        card.enabled = false;
        card.notEnabledText = 'overview.cards.care.notEnabledText';
        card.notEnabledFooter = 'overview.contactPartner';
        card.settingsUrl = '/services/careDetails/settings';
        card.helper = LicenseCardHelperService;
        card.showHealth = true;

        card.healthStatusUpdatedHandler = function (data) {
          _.each(data.components, function (component) {
            if (component.id === HealthStatusID.SPARK_CARE) {
              card.healthStatus = card.helper.mapStatus(card.healthStatus, component.status);
              card.healthStatusAria = card.helper.mapStatusAria(card.healthStatus, component.status);
            }
          });
        };

        card.licenseEventHandler = function (licenses) {
          card.allLicenses = licenses;
          card.trial = _.some(filterLicenses(licenses), 'isTrial');

          if (filterLicenses(licenses).length > 0) {
            card.enabled = true; //don't disable if no licenses in case test org..
          }
        };

        card.orgEventHandler = function (data) {
          if (data.success && data.isTestOrg && card.allLicenses && card.allLicenses.length === 0) {
            card.enabled = true; //If we are a test org and allLicenses is empty, enable the card.
          }
        };

        card.reportDataEventHandler = function (event, response) {
          if (response.data.success) {
            if (event.name === 'incomingChatTasksLoaded' && response.data.mediaType === 'chat' && response.data.spanType === 'month' && response.data.intervalCount >= 2) {
              card.current = _.find(response.data.values, { interval: 1 }).count;
              card.previous = _.find(response.data.values, { interval: 2 }).count;
            }
          }
        };

        function filterLicenses(licenses) {
          return _.filter(licenses, function (license) {
            return license.licenseType === 'CARE' && !(license.status === 'CANCELLED' || license.status === 'SUSPENDED');
          });
        }

        return card;
      },
    };
  }
})();
