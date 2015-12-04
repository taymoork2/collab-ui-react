'use strict';
describe('HelpdeskCardsService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var HelpdeskCardsOrgService;
  var LicenseService;

  beforeEach(inject(function (_HelpdeskCardsOrgService_, _LicenseService_) {
    HelpdeskCardsOrgService = _HelpdeskCardsOrgService_;
    LicenseService = _LicenseService_;
  }));

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
      var card = HelpdeskCardsOrgService.getMessageCardForOrg(org, licenses);
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
      var card = HelpdeskCardsOrgService.getMeetingCardForOrg(org, licenses);
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
      var card = HelpdeskCardsOrgService.getCallCardForOrg(org, licenses);
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
      var card = HelpdeskCardsOrgService.getRoomSystemsCardForOrg(org, licenses);
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
