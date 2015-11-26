(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewMeetingCard', OverviewMeetingCard);

  /* @ngInject */
  function OverviewMeetingCard(OverviewHelper) {
    var card = this;
    this.icon = 'icon-circle-group';
    this.desc = 'overview.cards.meeting.desc';
    this.name = 'overview.cards.meeting.title';
    this.cardClass = 'meetings';
    this.notEnabledText = 'overview.cards.meeting.notEnabledText';
    this.notEnabledFooter = 'overview.contactPartner';
    this.trial = false;
    this.enabled = false;
    this.settingsUrl = '';
    this.helper = OverviewHelper;

    this.healthStatusUpdatedHandler = function messageHealthEventHandler(data) {
      _.each(data.components, function (component) {
        if (component.name == 'Media/Calling') {
          card.healthStatus = card.helper.mapStatus(card.healthStatus, component.status);
        }
      });
    };

    this.reportDataEventHandler = function (event, response) {
      if (!response.data.success) return;
      if (event.name === 'groupCallsLoaded' && response.data.spanType === 'month' && response.data.intervalCount >= 2) {
        card.current = Math.round(response.data.data[response.data.data.length - 1].count);
        card.previous = Math.round(response.data.data[response.data.data.length - 2].count);
      }
    };

    this.licenseEventHandler = function (licenses) {
      this.allLicenses = licenses;

      card.trial = _.some(filterLicenses(licenses), {
        'isTrial': true
      });

      var hasSites = _.some(licenses, function (l) {
        return l.siteUrl;
      });

      this.settingsUrl = hasSites ? '#/site-list' : '';

      if (filterLicenses(licenses).length > 0) {
        card.enabled = true; //don't disable if no licenses in case test org..
      }
    };

    this.orgEventHandler = function (data) {
      if (data.success && data.isTestOrg && this.allLicenses && this.allLicenses.length === 0) {
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

})();
