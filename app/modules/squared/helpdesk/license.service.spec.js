'use strict';
describe('LicenseService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var LicenseService;

  beforeEach(inject(function (_LicenseService_) {
    LicenseService = _LicenseService_;
  }));

  describe('Fetching data from helpdesk backend', function () {

    var $httpBackend, urlBase, q;
    beforeEach(inject(function (_Config_, _LicenseService_, _$q_, _$httpBackend_) {
      q = _$q_;
      urlBase = _Config_.getAdminServiceUrl();
      $httpBackend = _$httpBackend_;
      $httpBackend
        .when('GET', 'l10n/en_US.json')
        .respond({});
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

  it('Should filterAndExtendLicenses correctly', function () {
    var licenses = [{
      "offerCode": "MS",
      "type": "MESSAGING",
      "name": "Messaging",
      "status": "ACTIVE",
      "volume": 10,
      "isTrial": false
    }, {
      "offerCode": "CF",
      "type": "CONFERENCING",
      "name": "Conferencing",
      "status": "ACTIVE",
      "volume": 100,
      "isTrial": true,
      "trialExpiresInDays": 49
    }, {
      "offerCode": "CO",
      "type": "COMMUNICATIONS",
      "name": "Communications",
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
    var filtered = LicenseService.filterAndExtendLicenses(licenses, 'MESSAGING');
    expect(filtered.length).toEqual(1);
    expect(filtered[0].volume).toEqual(10);
    expect(filtered[0].displayName).toEqual('helpdesk.licenseDisplayNames.MS');

    filtered = LicenseService.filterAndExtendLicenses(licenses, 'CONFERENCING');
    expect(filtered.length).toEqual(1);
    expect(filtered[0].volume).toEqual(100);
    expect(filtered[0].displayName).toEqual('helpdesk.licenseDisplayNames.CF');

    filtered = LicenseService.filterAndExtendLicenses(licenses, 'COMMUNICATIONS');
    expect(filtered.length).toEqual(1);
    expect(filtered[0].volume).toEqual(1000);
    expect(filtered[0].displayName).toEqual('helpdesk.licenseDisplayNames.CO');
  });

});
