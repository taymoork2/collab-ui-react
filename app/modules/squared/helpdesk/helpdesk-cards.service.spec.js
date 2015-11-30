'use strict';
describe('HelpdeskCardsService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var HelpdeskCardsService;

  beforeEach(inject(function (_HelpdeskCardsService_) {
    HelpdeskCardsService = _HelpdeskCardsService_;
  }));

  it('Should return correct message card for user', function () {
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
