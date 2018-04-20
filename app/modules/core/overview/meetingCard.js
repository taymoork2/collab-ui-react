(function () {
  'use strict';

  // TODO: refactor - do not use 'ngtemplate-loader' or ng-include directive
  var meetingCardTemplatePath = require('ngtemplate-loader?module=Core!./meetingCard.tpl.html');

  angular
    .module('Core')
    .factory('OverviewMeetingCard', OverviewMeetingCard);

  /* @ngInject */
  function OverviewMeetingCard($state, $rootScope, OverviewHelper, Authinfo) {
    return {
      createCard: function createCard($scope) {
        var card = {};
        card.isCSB = Authinfo.isCSB();
        card.template = meetingCardTemplatePath;
        card.icon = 'icon-circle-group';
        card.desc = 'overview.cards.meeting.desc';
        card.name = 'overview.cards.meeting.title';
        card.cardClass = 'cs-card';
        card.notEnabledText = 'overview.cards.meeting.notEnabledText';
        card.notEnabledFooter = 'overview.contactPartner';
        card.trial = false;
        card.enabled = false;
        card.settingsUrl = '';
        card.helper = OverviewHelper;
        card.showHealth = true;
        card.isProvisioning = false;
        card.needsWebExSetup = false;

        card.healthStatusUpdatedHandler = function messageHealthEventHandler(data) {
          _.each(data.components, function (component) {
            if (component.id === card.helper.statusIds.SparkCall) {
              card.healthStatus = card.helper.mapStatus(card.healthStatus, component.status);
              card.healthStatusAria = card.helper.mapStatusAria(card.healthStatus, component.status);
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
            isTrial: true,
          });

          var hasSites = _.some(licenses, function (l) {
            return l.siteUrl;
          });

          card.settingsUrl = hasSites ? '/site-list' : '';

          if (filterLicenses(licenses).length > 0) {
            card.enabled = true; //don't disable if no licenses in case test org..
          }
        };

        card.provisioningEventHandler = function (productProvStatus) {
          if (_.some(productProvStatus, { status: 'PENDING_PARM', productName: 'WX' })) {
            card.needsWebExSetup = true;
          } else if (someMeetingsAreNotProvisioned(productProvStatus)) {
            card.isProvisioning = true;
          }
        };

        var meetingServicesSetupSuccessDeregister = $rootScope.$on('meeting-settings-services-setup-successful', function () {
          card.needsWebExSetup = false;
          card.isProvisioning = true;
        });

        var someMeetingsAreNotProvisioned = function (productProvStatus) {
          return _.some(productProvStatus, function (status) {
            return status.productName === 'WX' && status.status !== 'PROVISIONED';
          });
        };

        $scope.$on('$destroy', meetingServicesSetupSuccessDeregister);

        card.orgEventHandler = function (data) {
          if (data.success && data.isTestOrg && card.allLicenses && card.allLicenses.length === 0) {
            card.enabled = true; //If we are a test org and allLicenses is empty, enable the card.
          }
        };

        card.showMeetingSettings = function () {
          $state.go('setupwizardmodal', {
            currentTab: 'meetingSettings',
            onlyShowSingleTab: true,
            showStandardModal: true,
          });
        };

        function filterLicenses(licenses) {
          return _.filter(licenses, function (l) {
            //    (['CF', 'EE', 'MC', 'SC', 'TC', 'EC']).contains(l.offername);
            return l.licenseType === 'CONFERENCING' && card.helper.isntCancelledOrSuspended(l);
          });
        }

        return card;
      },
    };
  }
})();
