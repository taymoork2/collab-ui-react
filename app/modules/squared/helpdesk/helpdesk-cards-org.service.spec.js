'use strict';

describe('HelpdeskCardsService', function () {
  beforeEach(angular.mock.module('Squared'));

  var HelpdeskCardsOrgService;
  var LicenseService;
  var HelpdeskHuronService;
  var $scope, q;

  beforeEach(inject(function (_HelpdeskCardsOrgService_, _$q_, _LicenseService_, _$rootScope_, _HelpdeskHuronService_) {
    HelpdeskCardsOrgService = _HelpdeskCardsOrgService_;
    LicenseService = _LicenseService_;
    HelpdeskHuronService = _HelpdeskHuronService_;
    $scope = _$rootScope_.$new();
    q = _$q_;
  }));

  describe('Org Cards', function () {
    var org = {
      services: ['spark-room-system', 'ciscouc', 'webex-squared', 'rubbish', 'cloud-contact-center'],
    };
    var licenses = [{
      offerCode: 'MS',
      type: 'MESSAGING',
      volume: 100,
      usage: 50,
    }, {
      offerCode: 'CF',
      type: 'CONFERENCING',
      volume: 100,
      usage: 50,
    }, {
      offerCode: 'CO',
      type: 'COMMUNICATION',
      volume: 200,
      usage: 100,
    }, {
      offerCode: 'SD',
      type: 'SHARED_DEVICES',
      volume: 100,
      usage: 50,
    }, {
      offerCode: 'RB',
      type: 'RUBBISH',
      volume: 100,
      usage: 50,
    }, {
      offerCode: 'CDC',
      type: 'CARE',
      volume: 101,
      usage: 51,
    }];

    beforeEach(function () {
      spyOn(LicenseService, 'orgIsEntitledTo').and.callThrough();
    });

    afterEach(function () {
      HelpdeskCardsOrgService = LicenseService = HelpdeskHuronService = $scope = q = undefined;
    });

    it('should return correct message card for org', function () {
      var card = HelpdeskCardsOrgService.getMessageCardForOrg(org, licenses);
      expect(LicenseService.orgIsEntitledTo).toHaveBeenCalled();
      expect(card.entitled).toBeTruthy();
      expect(card.aggregatedLicenses.length).toBe(1);
      var aggregatedLicense = _.head(card.aggregatedLicenses);
      expect(aggregatedLicense.totalVolume).toEqual(100);
      expect(aggregatedLicense.totalUsage).toEqual(50);
      expect(aggregatedLicense.displayName).toEqual('helpdesk.licenseDisplayNames.MS');
      var license = _.head(aggregatedLicense.licenses);
      expect(license.type).toEqual('MESSAGING');
      expect(license.volume).toEqual(100);
      expect(license.usage).toEqual(50);
    });

    it('should return correct meeting card for org', function () {
      var card = HelpdeskCardsOrgService.getMeetingCardForOrg(org, licenses);
      expect(card.entitled).toBeTruthy();
      expect(card.aggregatedLicenses.length).toBe(1);
      var aggregatedLicense = _.head(card.aggregatedLicenses);
      expect(aggregatedLicense.totalVolume).toEqual(100);
      expect(aggregatedLicense.totalUsage).toEqual(50);
      expect(aggregatedLicense.displayName).toEqual('helpdesk.licenseDisplayNames.CF');
      var license = _.head(aggregatedLicense.licenses);
      expect(license.type).toEqual('CONFERENCING');
      expect(license.volume).toEqual(100);
      expect(license.usage).toEqual(50);
    });

    it('should return correct call card for org', function () {
      var card = HelpdeskCardsOrgService.getCallCardForOrg(org, licenses, false, false);
      expect(LicenseService.orgIsEntitledTo).toHaveBeenCalled();
      expect(card.entitled).toBeTruthy();
      expect(card.aggregatedLicenses.length).toBe(1);
      var aggregatedLicense = _.head(card.aggregatedLicenses);
      expect(aggregatedLicense.totalVolume).toEqual(200);
      expect(aggregatedLicense.totalUsage).toEqual(100);
      expect(aggregatedLicense.displayName).toEqual('helpdesk.licenseDisplayNames.CO');
      var license = _.head(aggregatedLicense.licenses);
      expect(license.type).toEqual('COMMUNICATION');
      expect(license.volume).toEqual(200);
      expect(license.usage).toEqual(100);
      expect(card.voiceMailPrefix).not.toBeDefined();
      expect(card.outboundDialDigit).not.toBeDefined();
      expect(card.dialing).not.toBeDefined();
    });

    it('should return correct call card for org with huron-site-dial-digit & huron-local-dialing features', function () {
      spyOn(HelpdeskHuronService, 'getOrgSiteInfo');
      var deferredSiteInfoResult = q.defer();
      deferredSiteInfoResult.resolve({
        steeringDigit: null,
        siteSteeringDigit: '4',
        routingPrefix: '7100',
        siteCode: '100',
        extensionLength: '10',
        mediaTraversalMode: 'TURNOnly',
        uuid: '7b9ad03e-8c78-4ffa-8680-df50664bcce4',
      });
      HelpdeskHuronService.getOrgSiteInfo.and.returnValue(deferredSiteInfoResult.promise);

      spyOn(HelpdeskHuronService, 'getTenantInfo');
      var deferredTenantInfoResult = q.defer();
      deferredTenantInfoResult.resolve({
        name: 'SomeTestCustomer',
        regionCode: '940',
        uuid: '7b9ad03e-8c78-4ffa-8680-df50664bcce4',
      });
      HelpdeskHuronService.getTenantInfo.and.returnValue(deferredTenantInfoResult.promise);

      var card = HelpdeskCardsOrgService.getCallCardForOrg(org, licenses, true, true);
      $scope.$apply();

      expect(LicenseService.orgIsEntitledTo).toHaveBeenCalled();
      expect(card.entitled).toBeTruthy();
      expect(card.aggregatedLicenses.length).toBe(1);
      var aggregatedLicense = _.head(card.aggregatedLicenses);
      expect(aggregatedLicense.totalVolume).toEqual(200);
      expect(aggregatedLicense.totalUsage).toEqual(100);
      expect(aggregatedLicense.displayName).toEqual('helpdesk.licenseDisplayNames.CO');
      var license = _.head(aggregatedLicense.licenses);
      expect(license.type).toEqual('COMMUNICATION');
      expect(license.volume).toEqual(200);
      expect(license.usage).toEqual(100);
      expect(card.voiceMailPrefix).toBe('4100');
      expect(card.routingPrefix).toBe('7100');
      expect(card.outboundDialDigit).toEqual('helpdesk.none');
      expect(card.extensionLength).toBe('10');
      expect(card.dialing).toEqual('helpdesk.dialingPlan.local');
      expect(card.areaCode).toBe('940');
    });

    it('should return correct room systems card for org', function () {
      var card = HelpdeskCardsOrgService.getRoomSystemsCardForOrg(org, licenses);
      expect(LicenseService.orgIsEntitledTo).toHaveBeenCalled();
      expect(card.entitled).toBeTruthy();
      expect(card.aggregatedLicenses.length).toBe(1);
      var aggregatedLicense = _.head(card.aggregatedLicenses);
      expect(aggregatedLicense.totalVolume).toEqual(100);
      expect(aggregatedLicense.totalUsage).toEqual(50);
      expect(aggregatedLicense.displayName).toEqual('helpdesk.licenseDisplayNames.SD');
      var license = _.head(aggregatedLicense.licenses);
      expect(license.type).toEqual('SHARED_DEVICES');
      expect(license.volume).toEqual(100);
      expect(license.usage).toEqual(50);
    });

    it('should return care card for org', function () {
      var card = HelpdeskCardsOrgService.getCareCardForOrg(org, licenses);
      expect(LicenseService.orgIsEntitledTo).toHaveBeenCalled();
      expect(card.entitled).toBeTruthy();
      expect(card.aggregatedLicenses.length).toBe(1);
      var aggregatedLicense = _.head(card.aggregatedLicenses);
      expect(aggregatedLicense.totalVolume).toEqual(101);
      expect(aggregatedLicense.totalUsage).toEqual(51);
      expect(aggregatedLicense.displayName).toEqual('helpdesk.licenseDisplayNames.CDC');
      var license = _.head(aggregatedLicense.licenses);
      expect(license.type).toEqual('CARE');
      expect(license.volume).toEqual(101);
      expect(license.usage).toEqual(51);
    });
  });
});
