'use strict';

describe('Partner Service', function () {
  beforeEach(module('Core'));

  var $httpBackend, $rootScope, PartnerService, Authinfo, Config;

  var testData;

  beforeEach(function () {
    module(function ($provide) {
      Authinfo = {
        getOrgId: function () {
          return '12345';
        }
      };

      $provide.value('Authinfo', Authinfo);
    });
  });

  beforeEach(inject(function (_$httpBackend_, _$rootScope_, _PartnerService_, _Config_, _Authinfo_) {
    $httpBackend = _$httpBackend_;
    PartnerService = _PartnerService_;
    Config = _Config_;
    Authinfo = _Authinfo_;
    $rootScope = _$rootScope_;

    testData = getJSONFixture('core/json/partner/partnerservice.json');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should successfully match the values of all the properties in customerStatus', function () {
    expect(PartnerService.customerStatus.FREE).toBe(0);
    expect(PartnerService.customerStatus.TRIAL).toBe(1);
    expect(PartnerService.customerStatus.ACTIVE).toBe(2);
    expect(PartnerService.customerStatus.CANCELED).toBe(99);
    expect(PartnerService.customerStatus.NO_LICENSE).toBe(-1);
    expect(PartnerService.customerStatus.NOTE_EXPIRED).toBe(0);
    expect(PartnerService.customerStatus.NOTE_EXPIRE_TODAY).toBe(0);
    expect(PartnerService.customerStatus.NOTE_NO_LICENSE).toBe(0);
    expect(PartnerService.customerStatus.NOTE_CANCELED).toBe(0);
    expect(PartnerService.customerStatus.NOTE_NOT_EXPIRED).toBe(99);
  });

  it('should successfully return an array of 3 customers from calling getTrialsList', function () {
    $httpBackend.whenGET(PartnerService.trialsUrl).respond(testData.trialsResponse.status, testData.trialsResponse.data);

    PartnerService.getTrialsList(function (data, status) {
      expect(status).toBe(200);
      expect(data.trials.length).toBe(3);
      expect(data.trials).toEqual(testData.trialsResponse.data.trials);
    });

    $httpBackend.flush();
  });

  it('should successfully return an array of 5 customers from calling getManagedOrgsList', function () {

  });

  it('should successfully return a boolean on whether or not a license is a trial license from calling isLicenseATrial', function () {
    expect(PartnerService.isLicenseATrial(testData.licenses[0])).toBe(true);
    expect(PartnerService.isLicenseATrial(testData.freeLicense)).toBe(false);
    expect(PartnerService.isLicenseATrial(testData.activeLicense)).toBe(false);
  });

  it('should successfully return a boolean on whether or not a license is an active license from calling isLicenseActive', function () {

  });

  it('should successfully return a boolean on whether or not a license is a free license from calling isLicenseFree', function () {

  });

  it('should successfully return the corresponding license object or an empty object from calling getLicense', function () {
    expect(PartnerService.getLicense(testData.licenses, "messaging")).toEqual(testData.licenses[0]);
    expect(PartnerService.getLicense(testData.licenses, "conferencing")).toEqual(testData.licenses[1]);
    expect(PartnerService.getLicense(testData.licenses, "communications")).toEqual(testData.licenses[2]);
  });

  it('should successfully return a boolean on whether or not a license is available from calling isLicenseInfoAvailable', function () {

  });

  it('should successfully add sortOrder property to license from calling setServiceSortOrder', function () {

  });

  it('should successfully add notes property to customer from calling setNotesSortOrder', function () {

  });

  it('should successfully return an array of customers with additional properties from calling loadRetrievedDataToList', function () {

  });

  it('should successfully return an array of customers from calling exportCSV', function () {

  });
});
