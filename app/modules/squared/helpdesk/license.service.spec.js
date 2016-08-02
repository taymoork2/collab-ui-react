'use strict';
describe('LicenseService', function () {
  beforeEach(angular.mock.module('Squared'));

  var LicenseService;

  beforeEach(inject(function (_LicenseService_) {
    LicenseService = _LicenseService_;
  }));

  describe('Fetching data from helpdesk backend', function () {

    var $httpBackend, urlBase, q;
    beforeEach(inject(function (UrlConfig, _$q_, _$httpBackend_) {
      q = _$q_;
      urlBase = UrlConfig.getAdminServiceUrl();
      $httpBackend = _$httpBackend_;
    }));

    it('should get backend data from helpdesk/licences/<orgId>', function () {
      var licensesMock = [{
        "type": "MESSAGING",
        "name": "Messaging",
        "status": "ACTIVE",
        "volume": 100,
        "isTrial": false
      }, {
        "type": "CONFERENCING",
        "name": "Conferencing",
        "status": "ACTIVE",
        "volume": 99,
        "isTrial": true,
        "trialExpiresInDays": 49
      }];

      $httpBackend
        .when('GET', urlBase + 'helpdesk/licenses/1234')
        .respond(licensesMock);

      LicenseService.getLicensesInOrg('1234').then(function (res) {
        expect(res.length).toBe(2);
        expect(res[0].volume).toBe(100);
        expect(res[1].volume).toBe(99);
      });

    });

    afterEach(function () {
      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

  });

  it('Should return the expected result when userIsEntitledTo', function () {
    expect(LicenseService.userIsEntitledTo(null, 'squared-fusion-mgmt')).toBeFalsy();
    expect(LicenseService.userIsEntitledTo({}, 'squared-fusion-mgmt')).toBeFalsy();
    expect(LicenseService.userIsEntitledTo({
      entitlements: []
    }, 'squared-fusion-mgmt')).toBeFalsy();
    expect(LicenseService.userIsEntitledTo({
      entitlements: ['squared-fusion-uc']
    }, 'squared-fusion-mgmt')).toBeFalsy();
    expect(LicenseService.userIsEntitledTo({
      entitlements: ['squared-fusion-mgmt']
    }, 'squared-fusion-mgmt')).toBeTruthy();
  });

  it('Should return the expected result when orgIsEntitledTo', function () {
    expect(LicenseService.orgIsEntitledTo(null, 'squared-fusion-mgmt')).toBeFalsy();
    expect(LicenseService.orgIsEntitledTo({}, 'squared-fusion-mgmt')).toBeFalsy();
    expect(LicenseService.orgIsEntitledTo({
      services: []
    }, 'squared-fusion-mgmt')).toBeFalsy();
    expect(LicenseService.orgIsEntitledTo({
      services: ['squared-fusion-uc']
    }, 'squared-fusion-mgmt')).toBeFalsy();
    expect(LicenseService.orgIsEntitledTo({
      services: ['squared-fusion-mgmt']
    }, 'squared-fusion-mgmt')).toBeTruthy();
  });

  it('Should return the expected result when userIsLicensedFor', function () {
    expect(LicenseService.userIsLicensedFor(null, 'MS')).toBeFalsy();
    expect(LicenseService.userIsLicensedFor({}, 'MS')).toBeFalsy();
    expect(LicenseService.userIsLicensedFor({
      licenseID: []
    }, 'MS')).toBeFalsy();
    expect(LicenseService.userIsLicensedFor({
      licenseID: ['MC_f36c1a2c-20d6-460d-9f55-01fc85d52e04_100_t30citest.webex.com']
    }, 'MS')).toBeFalsy();
    expect(LicenseService.userIsLicensedFor({
      licenseID: ['MS_62b343df-bdd5-463b-8895-d07fc3a94832']
    }, 'MS')).toBeTruthy();
    expect(LicenseService.userIsLicensedFor({
      licenseID: ['MC_f36c1a2c-20d6-460d-9f55-01fc85d52e04_100_t30citest.webex.com']
    }, 'MC')).toBeTruthy();
    expect(LicenseService.userIsLicensedFor({
      licenseID: ['CO_f36c1a2c-20d6-460d-9f55-01fc85d52e04', 'MS_62b343df-bdd5-463b-8895-d07fc3a94832']
    }, 'CO')).toBeTruthy();
  });

  it('Should parse UserLicenses correctly', function () {
    // Messaging
    var license = new LicenseService.UserLicense('MS_62b343df-bdd5-463b-8895-d07fc3a94832');
    expect(license.offerCode).toEqual('MS');
    expect(license.id).toEqual('62b343df-bdd5-463b-8895-d07fc3a94832');
    expect(license.displayName).toEqual('onboardModal.paidMsg');

    // Meeting Center
    license = new LicenseService.UserLicense('MC_f36c1a2c-20d6-460d-9f55-01fc85d52e04_100_t30citest.webex.com');
    expect(license.offerCode).toEqual('MC');
    expect(license.id).toEqual('f36c1a2c-20d6-460d-9f55-01fc85d52e04');
    expect(license.displayName).toEqual('onboardModal.meetingCenter');
    expect(license.capacity).toEqual('100');
    expect(license.webExSite).toEqual('t30citest.webex.com');
  });

  it('Should aggregatedLicenses correctly', function () {
    var licenses = [{
      "offerCode": "MS",
      "type": "MESSAGING",
      "name": "Messaging",
      "status": "ACTIVE",
      "volume": 10,
      "isTrial": false,
      "usage": 5
    }, {
      "offerCode": "MS",
      "type": "MESSAGING",
      "name": "Messaging",
      "status": "ACTIVE",
      "volume": 20,
      "isTrial": false,
      "usage": 10
    }, {
      "offerCode": "MS",
      "type": "MESSAGING",
      "name": "Messaging",
      "status": "SUSPENDED",
      "volume": 100,
      "isTrial": false,
      "usage": 50
    }, {
      "offerCode": "MC",
      "type": "CONFERENCING",
      "name": "Meeting Center",
      "status": "ACTIVE",
      "volume": 1000,
      "isTrial": false,
      "usage": 50,
      "capacity": 25,
      "siteUrl": "mock.webex.com"
    }, {
      "offerCode": "MC",
      "type": "CONFERENCING",
      "name": "Meeting Center",
      "status": "ACTIVE",
      "volume": 1000,
      "isTrial": false,
      "usage": 150,
      "capacity": 25,
      "siteUrl": "mock.webex.com"
    }, {
      "offerCode": "MC",
      "type": "CONFERENCING",
      "name": "Meeting Center",
      "status": "ACTIVE",
      "volume": 300,
      "isTrial": false,
      "usage": 15,
      "capacity": 200,
      "siteUrl": "ladidadi.webex.com"
    }, {
      "offerCode": "TC",
      "type": "CONFERENCING",
      "name": "Training Center",
      "status": "ACTIVE",
      "volume": 250,
      "isTrial": false,
      "usage": 250,
      "capacity": 25,
      "siteUrl": "mock.webex.com"
    }, {
      "offerCode": "TC",
      "type": "CONFERENCING",
      "name": "Training Center",
      "status": "PENDING",
      "volume": 1000,
      "isTrial": false,
      "usage": 250,
      "capacity": 25,
      "siteUrl": "mock.webex.com"
    }, {
      "offerCode": "CMR",
      "type": "CONFERENCING",
      "name": "CMR",
      "status": "ACTIVE",
      "volume": 250,
      "isTrial": false,
      "usage": 250,
      "capacity": 25,
      "siteUrl": "mock.webex.com"
    }, {
      "offerCode": "CF",
      "type": "CONFERENCING",
      "name": "Conferencing",
      "status": "ACTIVE",
      "volume": 100,
      "isTrial": true,
      "trialExpiresInDays": 49
    }, {
      "offerCode": "CF",
      "type": "CONFERENCING",
      "name": "Conferencing",
      "status": "EXPIRED",
      "volume": 500,
      "isTrial": true,
      "trialExpiresInDays": 0
    }, {
      "offerCode": "CO",
      "type": "COMMUNICATION",
      "name": "Communication",
      "status": "ACTIVE",
      "volume": 1000,
      "isTrial": true,
      "trialExpiresInDays": 100
    }, {
      "type": "SHARED_DEVICES",
      "name": "Shared Devices",
      "status": "ACTIVE",
      "volume": 50,
      "isTrial": false
    }];

    // MESSAGING
    var aggregated = LicenseService.aggregatedLicenses(licenses, 'MESSAGING');
    expect(aggregated.length).toEqual(1);
    var aggregate = aggregated[0];
    expect(aggregate.totalVolume).toEqual(130);
    expect(aggregate.totalUsage).toEqual(65);
    expect(aggregate.usagePercentage).toEqual(50);
    expect(aggregate.displayName).toEqual('helpdesk.licenseDisplayNames.MS');
    expect(aggregate.isTrial).toBeFalsy();
    expect(aggregate.licenses.length).toEqual(3);

    // CONFERENCING
    // The conferencing ones should be aggregated into 4: MC-mock.webex.com (2), MC-ladidadi.webex.com (1), TC (2), CMR (1), CF (2)
    aggregated = LicenseService.aggregatedLicenses(licenses, 'CONFERENCING');
    expect(aggregated.length).toEqual(5);

    // MC-mock.webex.com
    aggregate = _.find(aggregated, {
      key: 'MC#25#mock.webex.com'
    });
    expect(aggregate.totalVolume).toEqual(2000);
    expect(aggregate.totalUsage).toEqual(200);
    expect(aggregate.usagePercentage).toEqual(10);
    expect(aggregate.displayName).toEqual('helpdesk.licenseDisplayNames.MC');
    expect(aggregate.isTrial).toBeFalsy();
    expect(aggregate.licenses.length).toEqual(2);

    // MC-ladidadi.webex.com
    aggregate = _.find(aggregated, {
      key: 'MC#200#ladidadi.webex.com'
    });
    expect(aggregate.totalVolume).toEqual(300);
    expect(aggregate.totalUsage).toEqual(15);
    expect(aggregate.usagePercentage).toEqual(5);
    expect(aggregate.displayName).toEqual('helpdesk.licenseDisplayNames.MC');
    expect(aggregate.isTrial).toBeFalsy();
    expect(aggregate.licenses.length).toEqual(1);

    // TC
    aggregate = _.find(aggregated, {
      key: 'TC#25#mock.webex.com'
    });
    expect(aggregate.totalVolume).toEqual(1250);
    expect(aggregate.totalUsage).toEqual(500);
    expect(aggregate.usagePercentage).toEqual(40);
    expect(aggregate.displayName).toEqual('helpdesk.licenseDisplayNames.TC');
    expect(aggregate.isTrial).toBeFalsy();
    expect(aggregate.licenses.length).toEqual(2);

    // CMR
    aggregate = _.find(aggregated, {
      key: 'CMR#25#mock.webex.com'
    });
    expect(aggregate.totalVolume).toEqual(250);
    expect(aggregate.totalUsage).toEqual(250);
    expect(aggregate.usagePercentage).toEqual(100);
    expect(aggregate.displayName).toEqual('helpdesk.licenseDisplayNames.CMR');
    expect(aggregate.isTrial).toBeFalsy();
    expect(aggregate.licenses.length).toEqual(1);

    // CF
    aggregate = _.find(aggregated, {
      key: 'CF#0'
    });
    expect(aggregate.totalVolume).toEqual(600);
    expect(aggregate.totalUsage).toEqual(0);
    expect(aggregate.usagePercentage).toEqual(0);
    expect(aggregate.displayName).toEqual('helpdesk.licenseDisplayNames.CF');
    expect(aggregate.isTrial).toBeTruthy();
    expect(aggregate.licenses.length).toEqual(2);

  });

});
