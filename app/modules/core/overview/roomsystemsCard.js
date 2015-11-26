(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewRoomSystemsCard', OverviewRoomSystemsCard);

  /* @ngInject */
  function OverviewRoomSystemsCard(OverviewHelper) {
    var card = this;
    this.icon = 'icon-circle-telepresence';
    this.desc = 'overview.cards.roomSystem.desc';
    this.name = 'overview.cards.roomSystem.title';
    this.cardClass = 'gray';
    this.enabled = false;
    this.trial = false;
    this.notEnabledText = 'overview.cards.roomSystem.notEnabledText';
    this.notEnabledFooter = 'overview.contactPartner';
    this.currentTitle = 'overview.cards.roomSystem.currentTitle';
    this.previousTitle = 'overview.cards.roomSystem.previousTitle';
    this.settingsUrl = '#/devices';
    this.helper = OverviewHelper;

    this.healthStatusUpdatedHandler = function roomSystemHealthEventHandler(data) {
      var room = _.find(data.components, {
        name: 'Rooms'
      });
      if (room) {
        card.healthStatus = card.helper.mapStatus(card.healthStatus, room.status);
      }
    };

    this.reportDataEventHandler = function (event, response) {

      if (!response.data.success) return;
      if (event.name == 'activeRoomsLoaded' && response.data.spanType == 'week' && response.data.intervalCount >= 2) {
        card.current = Math.round(response.data.data[response.data.data.length - 1].count);
        card.previous = Math.round(response.data.data[response.data.data.length - 2].count);
      }
    };

    this.licenseEventHandler = function (licenses) {

      this.allLicenses = licenses;
      card.trial = _.some(filterLicenses(licenses), {
        'isTrial': true
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

    this.orgEventHandler = function (data) {
      if (data.success && data.isTestOrg && this.allLicenses && this.allLicenses.length === 0) {
        card.enabled = true; //If we are a test org and allLicenses is empty, enable the card.
      }
    };

    return card;
  }

})();
