(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewCardFactory', OverviewCardFactory);

  var OfferName = require('modules/core/shared/offer-name').OfferName;
  var OfferType = require('modules/core/shared/offer-name').OfferType;
  var HealthStatusID = require('./overview.keys').HealthStatusID;

  /* @ngInject */
  function OverviewCardFactory(FeatureToggleService, OverviewBroadsoftCard, OverviewHybridServicesCard, OverviewUsersCard, OverviewCareCard) {
    // license-card info added here to allow for maintaining card order
    // TODO: all the cards need to be converted to components, not just the license-cards
    // and code cleaned up here and in the html so that we're no longer using ng-include
    return {
      // Fetch cards that utilize ng-include
      createBroadsoftCard: OverviewBroadsoftCard.createCard,
      createCareCard: OverviewCareCard.createCard,
      createHybridServicesCard: OverviewHybridServicesCard.createCard,
      createUsersCard: OverviewUsersCard.createCard,
      // data for cards using the license-card component
      getCallCard: function () {
        var config = {
          defaultMessage: 'overview.cards.call.notEnabledText',
          icon: 'icon-circle-call',
          licenseDescription: 'overview.totalUserLicenses',
          statusId: HealthStatusID.SparkCall,
          title: 'overview.cards.call.title',
          offerType: [OfferType.COMMUNICATION],
          settingsUrlObject: {
            url: '/services/call-settings',
          },
        };
        FeatureToggleService.supports(FeatureToggleService.features.hI1484).then(function (supported) {
          if (supported) {
            config.settingsUrlObject.url = '/services/call-settings-location';
          }
        });
        return config;
      },
      getMeetingCard: function () {
        return {
          defaultMessage: 'overview.cards.meeting.notEnabledText',
          icon: 'icon-circle-group',
          licenseDescription: 'overview.totalUserLicenses',
          statusId: HealthStatusID.SparkMeeting,
          title: 'overview.cards.meeting.title',
          offerType: [OfferType.CONFERENCING],
          settingsUrlObject: {
            requireSites: true,
            url: '/site-list',
          },
        };
      },
      getMessageCard: function () {
        return {
          defaultMessage: 'overview.cards.message.notEnabledText',
          icon: 'icon-circle-message',
          licenseDescription: 'overview.totalUserLicenses',
          statusId: HealthStatusID.SparkMessage,
          title: 'overview.cards.message.title',
          // accepts either OfferType or OfferName
          offerType: [OfferType.MESSAGING],
        };
      },
      getRoomsCard: function () {
        return {
          defaultMessage: 'overview.cards.roomSystem.notEnabledText',
          icon: 'icon-circle-telepresence',
          licenseDescription: 'overview.totalLicenses',
          statusId: HealthStatusID.SparkMeeting,
          title: 'overview.cards.roomSystem.title',
          offerType: [OfferName.SD, OfferName.SB],
          settingsUrlObject: {
            url: '/devices',
          },
        };
      },
    };
  }
})();
