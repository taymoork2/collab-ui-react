'use strict';
describe('HelpdeskCardsService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var HelpdeskCardsOrgService;
  var LicenseService;
  var HelpdeskService;
  var $scope, q;
  var $httpBackend;

  beforeEach(inject(function (_$httpBackend_, _HelpdeskCardsOrgService_, _HelpdeskService_, _$q_, _LicenseService_, _$rootScope_) {
    HelpdeskCardsOrgService = _HelpdeskCardsOrgService_;
    LicenseService = _LicenseService_;
    HelpdeskService = _HelpdeskService_;
    $scope = _$rootScope_.$new();
    q = _$q_;

    $httpBackend = _$httpBackend_;
    $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});

  }));

  describe('Org Cards', function () {
    var org = {
      services: ['spark-device-mgmt', 'ciscouc', 'webex-squared', 'rubbish']
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
      type: 'COMMUNICATIONS',
      volume: 100,
      usage: 50
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
      spyOn(LicenseService, 'filterAndExtendLicenses').and.callThrough();
    });

    it('should return correct message card for org', function () {
      var card = HelpdeskCardsOrgService.getMessageCardForOrg(org, licenses);
      expect(LicenseService.orgIsEntitledTo).toHaveBeenCalled();
      expect(LicenseService.filterAndExtendLicenses).toHaveBeenCalled();
      expect(card.entitled).toBeTruthy();
      expect(card.licenses.length).toEqual(1);
      expect(card.totalVolume).toEqual(100);
      expect(card.totalUsage).toEqual(50);
      expect(card.usagePercentage).toEqual(50);
      var license = _.first(card.licenses);
      expect(license.type).toEqual('MESSAGING');
      expect(license.volume).toEqual(100);
      expect(license.usage).toEqual(50);
      expect(license.displayName).toEqual('helpdesk.licenseDisplayNames.MS');
    });

    it('should return correct meeting card for org', function () {
      var card = HelpdeskCardsOrgService.getMeetingCardForOrg(org, licenses);
      //expect(LicenseService.orgIsEntitledTo).toHaveBeenCalled();
      expect(LicenseService.filterAndExtendLicenses).toHaveBeenCalled();
      expect(card.entitled).toBeTruthy();
      expect(card.licenses.length).toEqual(1);
      expect(card.totalVolume).toEqual(100);
      expect(card.totalUsage).toEqual(50);
      expect(card.usagePercentage).toEqual(50);
      var license = _.first(card.licenses);
      expect(license.type).toEqual('CONFERENCING');
      expect(license.volume).toEqual(100);
      expect(license.usage).toEqual(50);
      expect(license.displayName).toEqual('helpdesk.licenseDisplayNames.CF');
    });

    it('should return correct call card for org', function () {
      var card = HelpdeskCardsOrgService.getCallCardForOrg(org, licenses);
      expect(LicenseService.orgIsEntitledTo).toHaveBeenCalled();
      expect(LicenseService.filterAndExtendLicenses).toHaveBeenCalled();
      expect(card.entitled).toBeTruthy();
      expect(card.licenses.length).toEqual(1);
      expect(card.totalVolume).toEqual(100);
      expect(card.totalUsage).toEqual(50);
      expect(card.usagePercentage).toEqual(50);
      var license = _.first(card.licenses);
      expect(license.type).toEqual('COMMUNICATIONS');
      expect(license.volume).toEqual(100);
      expect(license.usage).toEqual(50);
      expect(license.displayName).toEqual('helpdesk.licenseDisplayNames.CO');
    });

    it('should return correct room systems card for org', function () {
      var card = HelpdeskCardsOrgService.getRoomSystemsCardForOrg(org, licenses);
      expect(LicenseService.orgIsEntitledTo).toHaveBeenCalled();
      expect(LicenseService.filterAndExtendLicenses).toHaveBeenCalled();
      expect(card.entitled).toBeTruthy();
      expect(card.licenses.length).toEqual(1);
      expect(card.totalVolume).toEqual(100);
      expect(card.totalUsage).toEqual(50);
      expect(card.usagePercentage).toEqual(50);
      var license = _.first(card.licenses);
      expect(license.type).toEqual('SHARED_DEVICES');
      expect(license.volume).toEqual(100);
      expect(license.usage).toEqual(50);
      expect(license.displayName).toEqual('helpdesk.licenseDisplayNames.SD');
    });

    it('should return correct hybrid service card for org', function () {
      sinon.stub(HelpdeskService, 'getHybridServices');
      var deferred = q.defer();
      deferred.resolve([{
        "acknowledged": false,
        "emailSubscribers": "",
        "enabled": true,
        "id": "squared-fusion-uc"
      }, {
        "acknowledged": false,
        "emailSubscribers": "",
        "enabled": false,
        "id": "squared-fusion-cal"
      }]);
      HelpdeskService.getHybridServices.returns(deferred.promise);

      var org = {
        services: ['squared-fusion-mgmt', 'squared-fusion-cal']
      };
      var card = HelpdeskCardsOrgService.getHybridServicesCardForOrg(org);
      $scope.$apply();

      expect(card.enabledHybridServices.length).toEqual(1);
      expect(card.enabledHybridServices[0].id).toEqual("squared-fusion-uc");

      expect(card.availableHybridServices.length).toEqual(1);
      expect(card.availableHybridServices[0].id).toEqual("squared-fusion-cal");

    });

    it('should return correct user card for org', function () {
      sinon.stub(LicenseService, 'getUnlicensedUsersCount');
      var deferred = q.defer();
      deferred.resolve("42");
      LicenseService.getUnlicensedUsersCount.returns(deferred.promise);

      org.ssoEnabled = true;
      org.dirsyncEnabled = true;
      var card = HelpdeskCardsOrgService.getUserCardForOrg(org);

      $scope.$apply();

      expect(card.ssoEnabled).toBeTruthy();
      expect(card.dirsyncEnabled).toBeTruthy();
      expect(card.unlicensedUserCount).toEqual('42');

    });

  });

});
