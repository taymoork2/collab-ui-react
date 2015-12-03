'use strict';
describe('HelpdeskCardsService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var HelpdeskCardsService;
  var LicenseService;

  beforeEach(inject(function (_HelpdeskCardsService_, _LicenseService_) {
    HelpdeskCardsService = _HelpdeskCardsService_;
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
      var messageCard = HelpdeskCardsService.getMessageCardForUser(null);
      expect(messageCard).toEqual(emptyCard());
      messageCard = HelpdeskCardsService.getMessageCardForUser({});
      expect(messageCard).toEqual(emptyCard());
      var meetingCard = HelpdeskCardsService.getMeetingCardForUser(null);
      expect(meetingCard).toEqual(emptyMeetingCard());
      meetingCard = HelpdeskCardsService.getMeetingCardForUser({});
      expect(meetingCard).toEqual(emptyMeetingCard());
      var callCard = HelpdeskCardsService.getCallCardForUser(null);
      expect(callCard).toEqual(emptyCard());
      callCard = HelpdeskCardsService.getCallCardForUser({});
      expect(callCard).toEqual(emptyCard());
      var hybridCard = HelpdeskCardsService.getHybridServicesCardForUser(null);
      expect(hybridCard).toEqual(emptyHybridCard());
      hybridCard = HelpdeskCardsService.getHybridServicesCardForUser({});
      expect(hybridCard).toEqual(emptyHybridCard());
    });

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

  describe('Org Cards', function () {
    var org = {
      services: ['spark-device-mgmt', 'ciscouc', 'webex-squared', 'rubbish']
    };
    var licenses = [{
      type: 'MESSAGING',
      volume: 100,
      usage: 50
    }, {
      type: 'CONFERENCING',
      volume: 100,
      usage: 50
    }, {
      type: 'COMMUNICATIONS',
      volume: 100,
      usage: 50
    }, {
      type: 'SHARED_DEVICES',
      volume: 100,
      usage: 50
    }, {
      type: 'RUBBISH',
      volume: 100,
      usage: 50
    }];

    beforeEach(function () {
      spyOn(LicenseService, 'orgIsEntitledTo').and.callThrough();
      spyOn(LicenseService, 'filterLicensesAndSetDisplayName').and.callThrough();
    });

    it('should return correct message card for org', function () {
      var card = HelpdeskCardsService.getMessageCardForOrg(org, licenses);
      expect(LicenseService.orgIsEntitledTo).toHaveBeenCalled();
      expect(LicenseService.filterLicensesAndSetDisplayName).toHaveBeenCalled();
      expect(card.entitled).toBeTruthy();
      expect(card.licenses.length).toEqual(1);
      expect(card.totalVolume).toEqual(100);
      expect(card.totalUsage).toEqual(50);
      expect(card.usagePercentage).toEqual(50);
      var license = _.first(card.licenses);
      expect(license.type).toEqual('MESSAGING');
      expect(license.volume).toEqual(100);
      expect(license.usage).toEqual(50);
      expect(license.displayName).toEqual('helpdesk.licenseTypes.MESSAGING');
    });

    it('should return correct meeting card for org', function () {
      var card = HelpdeskCardsService.getMeetingCardForOrg(org, licenses);
      //expect(LicenseService.orgIsEntitledTo).toHaveBeenCalled();
      expect(LicenseService.filterLicensesAndSetDisplayName).toHaveBeenCalled();
      expect(card.entitled).toBeTruthy();
      expect(card.licenses.length).toEqual(1);
      expect(card.totalVolume).toEqual(100);
      expect(card.totalUsage).toEqual(50);
      expect(card.usagePercentage).toEqual(50);
      var license = _.first(card.licenses);
      expect(license.type).toEqual('CONFERENCING');
      expect(license.volume).toEqual(100);
      expect(license.usage).toEqual(50);
      expect(license.displayName).toEqual('helpdesk.licenseTypes.CONFERENCING');
    });

    it('should return correct call card for org', function () {
      var card = HelpdeskCardsService.getCallCardForOrg(org, licenses);
      expect(LicenseService.orgIsEntitledTo).toHaveBeenCalled();
      expect(LicenseService.filterLicensesAndSetDisplayName).toHaveBeenCalled();
      expect(card.entitled).toBeTruthy();
      expect(card.licenses.length).toEqual(1);
      expect(card.totalVolume).toEqual(100);
      expect(card.totalUsage).toEqual(50);
      expect(card.usagePercentage).toEqual(50);
      var license = _.first(card.licenses);
      expect(license.type).toEqual('COMMUNICATIONS');
      expect(license.volume).toEqual(100);
      expect(license.usage).toEqual(50);
      expect(license.displayName).toEqual('helpdesk.licenseTypes.COMMUNICATIONS');
    });

    it('should return correct room systems card for org', function () {
      var card = HelpdeskCardsService.getRoomSystemsCardForOrg(org, licenses);
      expect(LicenseService.orgIsEntitledTo).toHaveBeenCalled();
      expect(LicenseService.filterLicensesAndSetDisplayName).toHaveBeenCalled();
      expect(card.entitled).toBeTruthy();
      expect(card.licenses.length).toEqual(1);
      expect(card.totalVolume).toEqual(100);
      expect(card.totalUsage).toEqual(50);
      expect(card.usagePercentage).toEqual(50);
      var license = _.first(card.licenses);
      expect(license.type).toEqual('SHARED_DEVICES');
      expect(license.volume).toEqual(100);
      expect(license.usage).toEqual(50);
      expect(license.displayName).toEqual('helpdesk.licenseTypes.SHARED_DEVICES');
    });

  });

});
