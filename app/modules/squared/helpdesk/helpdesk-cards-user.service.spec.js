'use strict';
describe('HelpdeskCardsService', function () {
  beforeEach(angular.mock.module('Squared'));

  var HelpdeskCardsUserService;
  var LicenseService;

  beforeEach(inject(function (_HelpdeskCardsUserService_, _LicenseService_) {
    HelpdeskCardsUserService = _HelpdeskCardsUserService_;
    LicenseService = _LicenseService_;
  }));

  var entFalse = {
    entitled: false
  };

  function emptyCard() {
    return {
      entitled: false,
      entitlements: []
    };
  }

  function emptyMeetingCard() {
    return {
      entitled: false,
      entitlements: [],
      licensesByWebExSite: {}
    };
  }

  function emptyHybridCard() {
    return {
      entitled: false,
      cal: entFalse,
      uc: entFalse,
      ec: entFalse
    };
  }

  describe('User Cards', function () {

    it('handle card for undefined or empty user', function () {
      var messageCard = HelpdeskCardsUserService.getMessageCardForUser(null);
      expect(messageCard).toEqual(emptyCard());
      messageCard = HelpdeskCardsUserService.getMessageCardForUser({});
      expect(messageCard).toEqual(emptyCard());
      var meetingCard = HelpdeskCardsUserService.getMeetingCardForUser(null);
      expect(meetingCard).toEqual(emptyMeetingCard());
      meetingCard = HelpdeskCardsUserService.getMeetingCardForUser({});
      expect(meetingCard).toEqual(emptyMeetingCard());
      var callCard = HelpdeskCardsUserService.getCallCardForUser(null);
      expect(callCard).toEqual(emptyCard());
      callCard = HelpdeskCardsUserService.getCallCardForUser({});
      expect(callCard).toEqual(emptyCard());
      var hybridCard = HelpdeskCardsUserService.getHybridServicesCardForUser(null);
      expect(hybridCard).toEqual(emptyHybridCard());
      hybridCard = HelpdeskCardsUserService.getHybridServicesCardForUser({});
      expect(hybridCard).toEqual(emptyHybridCard());
    });

    it('Should return correct message card for user', function () {
      var card = HelpdeskCardsUserService.getMessageCardForUser({});
      expect(card.entitled).toBeFalsy();
      expect(card.entitlements.length).toEqual(0);

      card = HelpdeskCardsUserService.getMessageCardForUser({
        entitlements: []
      });
      expect(card.entitled).toBeFalsy();
      expect(card.entitlements.length).toEqual(0);

      card = HelpdeskCardsUserService.getMessageCardForUser({
        entitlements: ['webex-squared']
      });
      expect(card.entitled).toBeTruthy();
      expect(card.entitlements.length).toEqual(1);
      expect(card.entitlements[0]).toEqual('helpdesk.entitlements.webex-squared');

      // Entitled, but no license (free)
      card = HelpdeskCardsUserService.getMessageCardForUser({
        entitlements: ['webex-squared', 'squared-room-moderation']
      });
      expect(card.entitled).toBeTruthy();
      expect(card.entitlements.length).toEqual(1);
      expect(card.entitlements[0]).toEqual('helpdesk.entitlements.squared-room-moderation.free');

      // Entitled and with license (Paid)
      card = HelpdeskCardsUserService.getMessageCardForUser({
        entitlements: ['webex-squared', 'squared-room-moderation'],
        licenseID: ['MS_62b343df-bdd5-463b-8895-d07fc3a94832']
      });
      expect(card.entitled).toBeTruthy();
      expect(card.entitlements.length).toEqual(1);
      expect(card.entitlements[0]).toEqual('helpdesk.entitlements.squared-room-moderation.paid');
    });

    it('Should return correct meeting card for user', function () {
      var card = HelpdeskCardsUserService.getMeetingCardForUser({});
      expect(card.entitled).toBeFalsy();
      expect(card.entitlements.length).toEqual(0);

      card = HelpdeskCardsUserService.getMeetingCardForUser({
        entitlements: []
      });
      expect(card.entitled).toBeFalsy();
      expect(card.entitlements.length).toEqual(0);

      // Entitled, but no license (free)
      card = HelpdeskCardsUserService.getMeetingCardForUser({
        entitlements: ['squared-syncup']
      });
      expect(card.entitled).toBeTruthy();
      expect(card.entitlements.length).toEqual(1);
      expect(card.entitlements[0]).toEqual('helpdesk.entitlements.squared-syncup.free');

      // Entitled and with license (Paid)
      card = HelpdeskCardsUserService.getMeetingCardForUser({
        entitlements: ['squared-syncup'],
        licenseID: ['CF_56b343df-bdd5-463b-8895-d07fc3a94877']
      });
      expect(card.entitled).toBeTruthy();
      expect(card.entitlements.length).toEqual(1);
      expect(card.entitlements[0]).toEqual('helpdesk.entitlements.squared-syncup.paid');

      // WebEx 11 (meetings)
      card = HelpdeskCardsUserService.getMeetingCardForUser({
        entitlements: ['meetings']
      });
      expect(card.entitled).toBeTruthy();
      expect(card.entitlements.length).toEqual(1);
      expect(card.entitlements[0]).toEqual('helpdesk.entitlements.meetings');

      // WebEx no licenses (cloudmeetings)
      card = HelpdeskCardsUserService.getMeetingCardForUser({
        entitlements: ['cloudmeetings']
      });
      expect(card.entitled).toBeTruthy();
      expect(card.entitlements.length).toEqual(0);

      // WebEx with licenses (cloudmeetings)
      card = HelpdeskCardsUserService.getMeetingCardForUser({
        entitlements: ['cloudmeetings'],
        licenseID: ['MC_56b343df-bdd5-463b-8895-d07fc3a94877_100_testing.webex.com']
      });
      expect(card.entitled).toBeTruthy();
      expect(_.size(card.licensesByWebExSite)).toEqual(1);
      expect(_.size(card.licensesByWebExSite['testing.webex.com'])).toEqual(1);
    });

  });

});
