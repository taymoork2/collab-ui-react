'use strict';
describe('HelpdeskCardsService', function() {
  beforeEach(module('wx2AdminWebClientApp'));

  var HelpdeskCardsService;

  beforeEach(inject(function(_HelpdeskCardsService_) {
    HelpdeskCardsService = _HelpdeskCardsService_;
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

  describe('User Cards', function() {

    it('handle card for undefined or empty user', function() {
      var mc1 = HelpdeskCardsService.getMessageCardForUser(null);
      var mc2 = HelpdeskCardsService.getMessageCardForUser({});
      var mc3 = HelpdeskCardsService.getMeetingCardForUser(null);
      var mc4 = HelpdeskCardsService.getMeetingCardForUser({});
      var mc5 = HelpdeskCardsService.getCallCardForUser(null);
      var mc6 = HelpdeskCardsService.getCallCardForUser({});
      var mc7 = HelpdeskCardsService.getHybridServicesCardForUser(null);
      var mc8 = HelpdeskCardsService.getHybridServicesCardForUser({});
      expect(mc1).toEqual(emptyCard());
      expect(mc2).toEqual(emptyCard());
      expect(mc3).toEqual(emptyMeetingCard());
      expect(mc4).toEqual(emptyMeetingCard());
      expect(mc5).toEqual(emptyCard());
      expect(mc6).toEqual(emptyCard());
      expect(mc7).toEqual(emptyHybridCard());
      expect(mc8).toEqual(emptyHybridCard());
    });

    it('Should return correct message card for user', function() {
      var card = HelpdeskCardsService.getMessageCardForUser({});
      expect(card.entitled).toBeFalsy();
      expect(card.entitlements.length).toEqual(0);

      card = HelpdeskCardsService.getMessageCardForUser({
        entitlements: []
      });
      expect(card.entitled).toBeFalsy();
      expect(card.entitlements.length).toEqual(0);

      card = HelpdeskCardsService.getMessageCardForUser({
        entitlements: ['webex-squared']
      });
      expect(card.entitled).toBeTruthy();
      expect(card.entitlements.length).toEqual(1);
      expect(card.entitlements[0]).toEqual('helpdesk.entitlements.webex-squared');

      // Entitled, but no license (free)
      card = HelpdeskCardsService.getMessageCardForUser({
        entitlements: ['webex-squared', 'squared-room-moderation']
      });
      expect(card.entitled).toBeTruthy();
      expect(card.entitlements.length).toEqual(1);
      expect(card.entitlements[0]).toEqual('helpdesk.entitlements.squared-room-moderation.free');

      // Entitled and with license (Paid)
      card = HelpdeskCardsService.getMessageCardForUser({
        entitlements: ['webex-squared', 'squared-room-moderation'],
        licenseID: ['MS_62b343df-bdd5-463b-8895-d07fc3a94832']
      });
      expect(card.entitled).toBeTruthy();
      expect(card.entitlements.length).toEqual(1);
      expect(card.entitlements[0]).toEqual('helpdesk.entitlements.squared-room-moderation.paid');
    });
  });

  describe('Org Cards', function() {

  });

});
