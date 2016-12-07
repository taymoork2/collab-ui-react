'use strict';

describe('HelpdeskCardsService', function () {
  beforeEach(angular.mock.module('Squared'));

  var HelpdeskCardsOrgService;
  var LicenseService;
  var HelpdeskHuronService;
  var FusionClusterService;
  var $scope, q;
  var CloudConnectorService;

  beforeEach(inject(function (_HelpdeskCardsOrgService_, _$q_, _LicenseService_, _$rootScope_, _HelpdeskHuronService_, _FusionClusterService_, _CloudConnectorService_) {
    HelpdeskCardsOrgService = _HelpdeskCardsOrgService_;
    LicenseService = _LicenseService_;
    HelpdeskHuronService = _HelpdeskHuronService_;
    FusionClusterService = _FusionClusterService_;
    $scope = _$rootScope_.$new();
    q = _$q_;
    CloudConnectorService = _CloudConnectorService_;
    spyOn(FusionClusterService, 'getAll').and.returnValue(q.resolve(getJSONFixture('hercules/fusion-cluster-service-test-clusters.json')));
  }));

  describe('Org Cards', function () {
    var org = {
      services: ['spark-room-system', 'ciscouc', 'webex-squared', 'rubbish']
    };
    var licenses = [{
      offerCode: 'MS',
      type: 'MESSAGING',
      volume: 100,
      usage: 50
    }, {
      offerCode: 'CF',
      type: 'CONFERENCING',
      volume: 100,
      usage: 50
    }, {
      offerCode: 'CO',
      type: 'COMMUNICATION',
      volume: 200,
      usage: 100
    }, {
      offerCode: 'SD',
      type: 'SHARED_DEVICES',
      volume: 100,
      usage: 50
    }, {
      offerCode: 'RB',
      type: 'RUBBISH',
      volume: 100,
      usage: 50
    }];

    beforeEach(function () {
      spyOn(LicenseService, 'orgIsEntitledTo').and.callThrough();
    });

    it('should return correct message card for org', function () {
      var card = HelpdeskCardsOrgService.getMessageCardForOrg(org, licenses);
      expect(LicenseService.orgIsEntitledTo).toHaveBeenCalled();
      expect(card.entitled).toBeTruthy();
      expect(card.aggregatedLicenses.length).toEqual(1);
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
      expect(card.aggregatedLicenses.length).toEqual(1);
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
      expect(card.aggregatedLicenses.length).toEqual(1);
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
      sinon.stub(HelpdeskHuronService, 'getOrgSiteInfo');
      var deferredSiteInfoResult = q.defer();
      deferredSiteInfoResult.resolve({
        "steeringDigit": "7",
        "siteSteeringDigit": "4",
        "siteCode": "100",
        "mediaTraversalMode": "TURNOnly",
        "uuid": "7b9ad03e-8c78-4ffa-8680-df50664bcce4"
      });
      HelpdeskHuronService.getOrgSiteInfo.returns(deferredSiteInfoResult.promise);

      sinon.stub(HelpdeskHuronService, 'getTenantInfo');
      var deferredTenantInfoResult = q.defer();
      deferredTenantInfoResult.resolve({
        "name": "SomeTestCustomer",
        "regionCode": "940",
        "uuid": "7b9ad03e-8c78-4ffa-8680-df50664bcce4"
      });
      HelpdeskHuronService.getTenantInfo.returns(deferredTenantInfoResult.promise);

      var card = HelpdeskCardsOrgService.getCallCardForOrg(org, licenses, true, true);
      $scope.$apply();

      expect(LicenseService.orgIsEntitledTo).toHaveBeenCalled();
      expect(card.entitled).toBeTruthy();
      expect(card.aggregatedLicenses.length).toEqual(1);
      var aggregatedLicense = _.head(card.aggregatedLicenses);
      expect(aggregatedLicense.totalVolume).toEqual(200);
      expect(aggregatedLicense.totalUsage).toEqual(100);
      expect(aggregatedLicense.displayName).toEqual('helpdesk.licenseDisplayNames.CO');
      var license = _.head(aggregatedLicense.licenses);
      expect(license.type).toEqual('COMMUNICATION');
      expect(license.volume).toEqual(200);
      expect(license.usage).toEqual(100);
      expect(card.voiceMailPrefix).toBe("4100");
      expect(card.outboundDialDigit).toBe("7");
      expect(card.dialing).toEqual("helpdesk.dialingPlan.local");
      expect(card.areaCode).toBe("940");
    });

    it('should return correct room systems card for org', function () {
      var card = HelpdeskCardsOrgService.getRoomSystemsCardForOrg(org, licenses);
      expect(LicenseService.orgIsEntitledTo).toHaveBeenCalled();
      expect(card.entitled).toBeTruthy();
      expect(card.aggregatedLicenses.length).toEqual(1);
      var aggregatedLicense = _.head(card.aggregatedLicenses);
      expect(aggregatedLicense.totalVolume).toEqual(100);
      expect(aggregatedLicense.totalUsage).toEqual(50);
      expect(aggregatedLicense.displayName).toEqual('helpdesk.licenseDisplayNames.SD');
      var license = _.head(aggregatedLicense.licenses);
      expect(license.type).toEqual('SHARED_DEVICES');
      expect(license.volume).toEqual(100);
      expect(license.usage).toEqual(50);
    });

    it('should return correct hybrid service card for org with only calendar setup', function () {
      var org = {
        services: ['squared-fusion-mgmt', 'squared-fusion-cal', 'squared-fusion-uc', 'squared-fusion-media']
      };
      var card = HelpdeskCardsOrgService.getHybridServicesCardForOrg(org);
      $scope.$apply();

      expect(card.entitled).toBeTruthy();
      expect(card.services.length).toEqual(3);

      expect(card.services[0].serviceId).toEqual("squared-fusion-cal");
      expect(card.services[0].status).toEqual('operational');
      expect(card.services[0].setup).toBeTruthy();
      expect(card.services[0].statusCss).toEqual('success');

      expect(card.services[1].serviceId).toEqual("squared-fusion-uc");
      expect(card.services[1].status).toEqual('operational');
      expect(card.services[1].setup).toBeTruthy();
      expect(card.services[1].statusCss).toEqual('success');

      expect(card.services[2].serviceId).toEqual("squared-fusion-media");
      expect(card.services[2].status).toEqual('setupNotComplete');
      expect(card.services[2].setup).toBeFalsy();
      expect(card.services[2].statusCss).toEqual('default');

    });

    it('should return correct hybrid service card when google calendar is enabled', function () {
      spyOn(CloudConnectorService, 'getService').and.returnValue(q.resolve({ serviceId: 'squared-fusion-gcal', setup: true, status: 'OK', statusCss: 'success' }));
      var org = {
        services: ['squared-fusion-mgmt', 'squared-fusion-gcal']
      };
      var card = HelpdeskCardsOrgService.getHybridServicesCardForOrg(org);
      $scope.$apply();

      expect(card.entitled).toBeTruthy();
      expect(card.services.length).toEqual(1);

      expect(card.services[0].serviceId).toEqual('squared-fusion-gcal');
      expect(card.services[0].status).toEqual('OK');
      expect(card.services[0].setup).toBeTruthy();
      expect(card.services[0].statusCss).toEqual('success');

    });

  });

});
