'use strict';
describe('LicenseService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var LicenseService;

  beforeEach(inject(function (_LicenseService_) {
    LicenseService = _LicenseService_;
  }));

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
    expect(license.volume).toEqual('100');
    expect(license.webExSite).toEqual('t30citest.webex.com');
  });

});
