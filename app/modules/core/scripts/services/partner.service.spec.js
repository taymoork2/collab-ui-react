'use strict';

describe('Partner Service -', function () {
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));

  var $httpBackend, $q, $translate, $scope, Analytics, Auth, Authinfo, Config, PartnerService, TrialService, UrlConfig;

  var testData;

  beforeEach(function () {
    angular.mock.module(function ($provide) {
      Authinfo = {
        getOrgId: function () {
          return '12345';
        }
      };

      $provide.value('Authinfo', Authinfo);
    });
  });

  beforeEach(inject(function (_$httpBackend_, _$q_, $rootScope, _$translate_, _Analytics_, _Auth_, _Authinfo_, _Config_, _PartnerService_, _TrialService_, _UrlConfig_) {
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $translate = _$translate_;
    Analytics = _Analytics_;
    Auth = _Auth_;
    Authinfo = _Authinfo_;
    Config = _Config_;
    PartnerService = _PartnerService_;
    TrialService = _TrialService_;
    UrlConfig = _UrlConfig_;

    testData = getJSONFixture('core/json/partner/partner.service.json');
    spyOn(Auth, 'getAuthorizationUrlList').and.returnValue($q.when({}));
    spyOn(Analytics, 'trackUserPatch');
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

    TrialService.getTrialsList(function (data, status) {
      expect(status).toBe(200);
      expect(data.trials.length).toBe(3);
      expect(data.trials).toEqual(testData.trialsResponse.data.trials);
    });

    $httpBackend.flush();
  });

  it('should successfully return an array of 5 customers from calling getManagedOrgsList', function () {
    $httpBackend.whenGET(PartnerService.managedOrgsUrl).respond(testData.managedOrgsResponse.status, testData.managedOrgsResponse.data);

    PartnerService.getManagedOrgsList(function (data, status) {
      expect(status).toBe(200);
      expect(data.organizations.length).toBe(5);
      expect(data.organizations).toEqual(testData.managedOrgsResponse.data.organizations);
    });

    $httpBackend.flush();
  });

  it('should successfully return an array of 5 customers from calling getManagedOrgsList with customerName search', function () {
    var url = UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/managedOrgs' + '?customerName=searchStr';
    $httpBackend.whenGET(url).respond(testData.managedOrgsResponse.data);
    PartnerService.getManagedOrgsList('searchStr').then(function (response) {
      expect(response.data.organizations).toEqual(testData.managedOrgsResponse.data.organizations);
      expect(response.data.organizations.length).toBe(5);
      expect(response.status).toBe(200);
    });
    $httpBackend.flush();
  });

  it('should successfully return a boolean on whether or not a license is a trial license from calling isLicenseATrial', function () {
    expect(PartnerService.isLicenseATrial(testData.licenses[0])).toBe(true);
    expect(PartnerService.isLicenseATrial(testData.licenses[3])).toBe(false);
    expect(PartnerService.isLicenseATrial(testData.licenses[4])).toBe(false);
  });

  it('should successfully return a boolean on whether or not a license is an active license from calling isLicenseActive', function () {
    expect(PartnerService.isLicenseActive(testData.licenses[0])).toBe(false);
    expect(PartnerService.isLicenseActive(testData.licenses[3])).toBe(false);
    expect(PartnerService.isLicenseActive(testData.licenses[4])).toBe(true);
  });

  it('should successfully return a boolean on whether or not a license is a free license from calling isLicenseFree', function () {
    expect(PartnerService.isLicenseFree(testData.licenses[0])).toBe(false);
    expect(PartnerService.isLicenseFree(testData.licenses[3])).toBe(true);
    expect(PartnerService.isLicenseFree(testData.licenses[4])).toBe(false);
  });

  it('should successfully return the corresponding license object or an empty object from calling getLicense', function () {
    expect(PartnerService.getLicense(testData.licenses, Config.offerCodes.MS)).toEqual(testData.licenses[0]);
    expect(PartnerService.getLicense(testData.licenses, Config.offerCodes.CF)).toEqual(testData.licenses[1]);
    expect(PartnerService.getLicense(testData.licenses, Config.offerCodes.CO)).toEqual(testData.licenses[2]);
    expect(PartnerService.getLicense(testData.licenses, Config.offerCodes.CDC)).toEqual(testData.licenses[6]);
  });

  it('should successfully return a boolean on whether or not a license is available from calling isLicenseInfoAvailable', function () {
    var licenses = [];
    expect(PartnerService.isLicenseInfoAvailable(licenses)).toBe(true);
    expect(PartnerService.isLicenseInfoAvailable(testData.licenses)).toBe(true);
  });

  it('should successfully add sortOrder property to license from calling setServiceSortOrder', function () {
    var license = {};
    PartnerService.setServiceSortOrder(license);
    expect(license.sortOrder).toBe(PartnerService.customerStatus.NO_LICENSE);

    // Status is "FREE".
    var customerActive = testData.licenses[3];
    PartnerService.setServiceSortOrder(customerActive);
    expect(customerActive.sortOrder).toBe(PartnerService.customerStatus.FREE);

    // Status is "TRIAL".
    var customerTrial = testData.licenses[0];
    PartnerService.setServiceSortOrder(customerTrial);
    expect(customerTrial.sortOrder).toBe(PartnerService.customerStatus.TRIAL);

    // Status is "ACTIVE"
    var customerFree = testData.licenses[4];
    PartnerService.setServiceSortOrder(customerFree);
    expect(customerFree.sortOrder).toBe(PartnerService.customerStatus.ACTIVE);

    // Status is "CANCELED"
    var customerCanceled = testData.licenses[5];
    PartnerService.setServiceSortOrder(customerCanceled);
    expect(customerCanceled.sortOrder).toBe(PartnerService.customerStatus.CANCELED);
  });

  it('should successfully add notes property to customer from calling setNotesSortOrder', function () {
    // Customer's status and daysLeft properties are "ACTIVE" and 45.
    var customerActive = testData.customers[0];
    PartnerService.setNotesSortOrder(customerActive);
    expect(customerActive.notes.sortOrder).toBe(PartnerService.customerStatus.NOTE_NOT_EXPIRED);
    expect(customerActive.notes.daysLeft).toBe(45);
    expect(customerActive.notes.text).toBe('customerPage.daysLeftToPurchase');

    // Customer's isTrial, status, and daysLeft properties are true, "ACTIVE", and 0.
    var customerExpireToday = testData.customers[1];
    PartnerService.setNotesSortOrder(customerExpireToday);
    expect(customerExpireToday.notes.sortOrder).toBe(PartnerService.customerStatus.NOTE_EXPIRE_TODAY);
    expect(customerExpireToday.notes.daysLeft).toBe(0);
    expect(customerExpireToday.notes.text).toBe('customerPage.expiringToday');

    // Customer's status and daysLeft properties are "ACTIVE" and -30
    var customerExpired = testData.customers[2];
    PartnerService.setNotesSortOrder(customerExpired);
    expect(customerExpired.notes.sortOrder).toBe(PartnerService.customerStatus.NOTE_EXPIRED);
    expect(customerExpired.notes.daysLeft).toBe(-25);
    expect(customerExpired.notes.text).toBe('customerPage.expiredWithGracePeriod');

    // Customer's status property is "PENDING"
    var customerNoLicense = testData.customers[3];
    PartnerService.setNotesSortOrder(customerNoLicense);
    expect(customerNoLicense.notes.sortOrder).toBe(PartnerService.customerStatus.NOTE_NO_LICENSE);
    expect(customerNoLicense.notes.text).toBe('customerPage.licenseInfoNotAvailable');

    // Customer does not have a licenseList property
    customerNoLicense = testData.customers[4];
    PartnerService.setNotesSortOrder(customerNoLicense);
    expect(customerNoLicense.notes.sortOrder).toBe(PartnerService.customerStatus.NOTE_NO_LICENSE);
    expect(customerNoLicense.notes.text).toBe('customerPage.licenseInfoNotAvailable');

    // Customer status property is "CANCELED"
    var customerCanceled = testData.customers[5];
    PartnerService.setNotesSortOrder(customerCanceled);
    expect(customerCanceled.notes.sortOrder).toBe(PartnerService.customerStatus.NOTE_CANCELED);
    expect(customerCanceled.notes.text).toBe('customerPage.suspended');
  });

  it('should successfully return an array of customers with additional properties from calling loadRetrievedDataToList', function () {
    var returnList = PartnerService.loadRetrievedDataToList(_.get(testData, 'managedOrgsResponse.data.organizations', []), true, true);
    var activeList = _.filter(returnList, {
      state: "ACTIVE"
    });
    var expiredList = _.filter(returnList, {
      state: "EXPIRED"
    });
    // Five customers, three active, two expired
    expect(returnList.length).toBe(5);
    expect(activeList.length).toBe(3);
    expect(expiredList.length).toBe(2);

    // Three licenses converted to License List. First license has four entitlements
    expect(returnList[0].licenseList.length).toBe(3);
    expect(returnList[0].licenseList[0].features.length).toBe(4);
    expect(returnList[0].licenseList[0].features).toEqual(testData.managedOrgsResponse.data.organizations[0].licenses[0].features);

    // Verify additional properties are set to the corresponding license object and added to customer object.
    expect(activeList[1].conferencing.features.length).toBe(3);
    expect(activeList[1].messaging.features.length).toBe(4);
    expect(activeList[1].care.features.length).toBe(4);
  });

  it('should successfully return an object containing email, orgid, and orgname from getAdminOrg', function () {
    var myOrg = getJSONFixture('core/json/organizations/Orgservice.json').getOrg;
    var returnList = PartnerService.loadRetrievedDataToList([myOrg], false, true);

    expect(returnList[0].customerOrgId).toBe(myOrg.id);
    expect(returnList[0].customerName).toBe(myOrg.displayName);
    expect(returnList[0].customerEmail).toBe(myOrg.email);
  });

  it('should verify that every org has a list of offers', function () {
    var returnList = PartnerService.loadRetrievedDataToList(testData.managedOrgsResponse.data.organizations, [], true);
    var offers = _.pluck(returnList, 'offers');

    expect(offers.length).toBe(returnList.length);

    for (var i = 0; i < returnList.length; i++) {
      expect(returnList[i].licenses).not.toBe(0);
    }
  });

  it('should successfully return an array of customers from calling exportCSV', function () {
    $httpBackend.whenGET(PartnerService.managedOrgsUrl).respond(testData.managedOrgsResponse.status, testData.managedOrgsResponse.data);
    var promise = PartnerService.exportCSV(false);
    promise.then(function (customers) {
      expect(customers).toEqual(testData.exportCSVResult);
    });
    $httpBackend.flush();
  });

  it('should successfully return an array of customers with care entitlements from calling exportCSV', function () {
    $httpBackend.whenGET(PartnerService.managedOrgsUrl).respond(testData.managedOrgsResponse.status, testData.managedOrgsResponse.data);
    var promise = PartnerService.exportCSV(true);
    promise.then(function (customers) {
      expect(customers).toEqual(testData.exportCSVResultWithCare);
    });
    $httpBackend.flush();
  });

  describe('modifyManagedOrgs function', function () {
    beforeEach(function () {
      Auth.getAuthorizationUrlList.and.returnValue($q.when(testData.getAuthorizationUrlListResponse));
      $scope.$apply();
    });

    it('should call a patch if organization is not matched', function () {
      PartnerService.modifyManagedOrgs('b3f09da0-7729-47a5-8091-1aa07a3c8671');
      $httpBackend.expectPATCH('https://identity.webex.com/identity/scim/12345/v1/Users/' + testData.getAuthorizationUrlListResponse.data.uuid).respond(200, testData.getAuthorizationUrlListResponse);
      $httpBackend.flush();
    });
  });

  describe('helper functions -', function () {
    describe('parseLicensesAndOffers -', function () {
      it('should return a default object if "offers" property is an empty list', function () {
        var data = PartnerService.parseLicensesAndOffers();
        expect(data.licenses).toBe(0);
        expect(data.deviceLicenses).toBe(0);
        expect(data.isSquaredUcOffer).toBe(false);
        expect(data.usage).toBe(0);
        expect(data.offer).toEqual({
          trialServices: []
        });
      });

      it('should return an object with "usage" copied from the input\'s "offers" last element\'s "usageCount" property', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            usageCount: 1
          }]
        }, true);
        expect(data.usage).toBe(1);
      });

      it('should return an object with "license" copied from the input\'s "offers" last element\'s "licenseCount" property', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            licenseCount: 10
          }]
        }, true);
        expect(data.licenses).toBe(10);

        data = PartnerService.parseLicensesAndOffers({
          offers: [{
            licenseCount: 10
          }, {
            licenseCount: 30
          }, {
            licenseCount: 20
          }]
        }, true);
        expect(data.licenses).toBe(20);
      });

      it('should return an object with "deviceLicenses" copied from the input\'s "offers" last element\'s "licenseCount" property, if the offers "id" property matches `Config.offerTypes.roomSystems`', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.roomSystems,
            licenseCount: 10,
          }]
        }, true);
        expect(data.deviceLicenses).toBe(10);
      });

      it('should return an object with its "offer.trialServices" array containing object with the name translated "trials.message" l10n key, if the offers "id" property matches `Config.offerTypes.spark1` or `Config.offerTypes.message`', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.spark1
          }]
        }, true);
        expect(_.map(data.offer.trialServices, function (o) { return o.name; })).toContain($translate.instant('trials.message'));

        data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.message
          }]
        }, true);
        expect(_.map(data.offer.trialServices, function (o) { return o.name; })).toContain($translate.instant('trials.message'));
      });

      it('should return an object with its "offer.trialServices" array containing object with the name translated "trials.care" l10n key, if the offers "id" property matches `Config.offerTypes.care` and atlasCareTrials feature is enabled for the org', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.care
          }]
        }, true);
        expect(_.map(data.offer.trialServices, function (o) { return o.name; })).toContain($translate.instant('trials.care'));
      });

      it('should return an object with its "offer.trialServices" array empty and without the translated "trials.care" l10n key, if atlasCareTrials feature is disabled for the org', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.care
          }]
        }, false);
        expect(data.offer.trialServices.length).toEqual(0);
      });

      it('should return an object with its "offer.trialServices" array containing object with the name translated "trials.collab" l10n key, if the offers "id" property matches `Config.offerTypes.collab`', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.collab
          }]
        }, true);
        expect(_.map(data.offer.trialServices, function (o) { return o.name; })).toContain($translate.instant('trials.message'));
      });

      it('should return an object with its "offer.trialServices" array containing object with the name translated "trials.squaredUC" l10n key, if the offers "id" property matches `Config.offerTypes.call` or `Config.offerTypes.squaredUC`', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.call
          }]
        }, true);
        expect(_.map(data.offer.trialServices, function (o) { return o.name; })).toContain($translate.instant('trials.call'));

        data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.squaredUC
          }]
        }, true);
        expect(_.map(data.offer.trialServices, function (o) { return o.name; })).toContain($translate.instant('trials.call'));
      });

      it('should return an object with "isSquaredUcOffer" property set to `true`, only if any of the offers "id" property matches `Config.offerTypes.call` or `Config.offerTypes.squaredUC`', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.call
          }]
        }, true);
        expect(data.isSquaredUcOffer).toBe(true);

        data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.squaredUC
          }]
        }, true);
        expect(data.isSquaredUcOffer).toBe(true);

        data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.spark1
          }, {
            id: Config.offerTypes.squaredUC
          }, // presence anywhere in this list will set the property to true
          {
            id: Config.offerTypes.collab
          },
          ]
        }, true);
        expect(data.isSquaredUcOffer).toBe(true);
      });

      it('should set isSquaredUcOffer to true, only if any of the "licenseType" property matches the value for Config.licenseTypes.COMMUNICATION', function () {
        var data = PartnerService.parseLicensesAndOffers({
          licenses: [{
            licenseType: Config.licenseTypes.COMMUNICATION
          }]
        }, true);
        expect(data.isSquaredUcOffer).toBe(true);

        data = PartnerService.parseLicensesAndOffers({
          licenses: [{
            licenseType: Config.licenseTypes.MESSAGING
          }, {
            licenseType: Config.licenseTypes.COMMUNICATION
          }, // presence anywhere in this list should set the property to true
          {
            licenseType: Config.licenseTypes.CONFERENCING
          }
          ]
        }, true);
        expect(data.isSquaredUcOffer).toBe(true);

        data = PartnerService.parseLicensesAndOffers({
          licenses: [{
            licenseType: Config.licenseTypes.MESSAGING
          }, {
            licenseType: Config.licenseTypes.CONFERENCING
          }]
        }, true);
        expect(data.isSquaredUcOffer).toBe(false);
      });

      it('should not throw errors when licenses have undefined values', function () {
        var data = PartnerService.parseLicensesAndOffers({
          licenses: [
            undefined, {
              licenseType: undefined
            }
          ]
        }, true);
        expect(data.isSquaredUcOffer).toBe(false);

        data = PartnerService.parseLicensesAndOffers({
          licenses: [{
            licenseType: undefined
          }, {
            licenseType: Config.licenseTypes.COMMUNICATION
          },
            undefined
          ]
        }, true);
        expect(data.isSquaredUcOffer).toBe(true);
      }, true);

      it('should return an object with its "offer.trialServices" array containing object with the name translated "customerPage.EE" l10n key, if the offers "id" property matches `Config.offerTypes.webex` or `Config.offerTypes.meetings`', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.webex
          }]
        }, true);
        expect(_.map(data.offer.trialServices, function (o) { return o.name; })).toContain($translate.instant('customerPage.EE'));

        data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.meetings
          }]
        }, true);
        expect(_.map(data.offer.trialServices, function (o) { return o.name; })).toContain($translate.instant('customerPage.EE'));
      });

      it('should return an object with its "offer.trialServices" array containing object with the name translated "trials.roomSystem" l10n key, if the offers "id" property matches `Config.offerTypes.roomSystems`', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.roomSystems
          }]
        }, true);
        expect(_.map(data.offer.trialServices, function (o) { return o.name; })).toContain($translate.instant('trials.roomSystem'));
      });
    });

    describe('Helper functions related to getFreeOrActiveServices ', function () {
      it('should createConferenceMapping with conferencing license type', function () {
        var result = PartnerService.helpers.createConferenceMapping();
        expect(result[Config.offerCodes.CF].licenseType).toBe(Config.licenseTypes.CONFERENCING);
      });

      it('should  createLicenseMapping with proper icons', function () {
        var result = PartnerService.helpers.createLicenseMapping();
        expect(result[Config.licenseTypes.COMMUNICATION].icon).toBe('icon-circle-call');

      });

      it('should  create FreeServicesMapping consisting of Messaging, Call, and Conferencing (CF) ', function () {
        var result = PartnerService.helpers.createFreeServicesMapping();
        expect(result.length).toBe(3);
        expect(result[0].code).toBe(Config.offerCodes.MS);
        expect(result[1].code).toBe(Config.offerCodes.CF);
        expect(result[2].code).toBe(Config.offerCodes.CO);

      });

      it('should return false from isDisplayablePaidService for trial license', function () {
        var licenseInfo = {
          licenseType: Config.licenseTypes.MESSAGING,
          volume: 10,
          isTrial: true
        };
        expect(PartnerService.helpers.isDisplayablePaidService(licenseInfo, true)).toBe(false);
      });

      it('should return false from isDisplayablePaidService for storage license', function () {
        var licenseInfo = {
          licenseType: Config.licenseTypes.STORAGE,
          volume: 10
        };
        expect(PartnerService.helpers.isDisplayablePaidService(licenseInfo, true)).toBe(false);
      });

      it('should return the value of the toggle  from isDisplayablePaidService for care license', function () {
        var licenseInfo = {
          licenseType: Config.licenseTypes.CARE,
          volume: 10
        };
        expect(PartnerService.helpers.isDisplayablePaidService(licenseInfo, false)).toBe(false);
        expect(PartnerService.helpers.isDisplayablePaidService(licenseInfo, true)).toBe(true);
      });

      it('should return true from isDisplayablePaidService for care license for paid conference license ', function () {
        var licenseInfo = {
          licenseType: Config.licenseTypes.CONFERENCING,
          volume: 10
        };
        expect(PartnerService.helpers.isDisplayablePaidService(licenseInfo, true)).toBe(true);
      });

      it('should build a meeting service given conferencing mapping', function () {
        var mapping = PartnerService.helpers.createConferenceMapping();
        var licenseInfo = {
          volume: 20
        };
        var result = PartnerService.helpers.buildService(licenseInfo, mapping);
        expect(result.icon).toBe('icon-circle-group');
        expect(result.qty).toBe(20);

      });
      it('should build a non meeting service given license mapping', function () {
        var mapping = PartnerService.helpers.createLicenseMapping();
        var licenseInfo = {
          licenseType: 'MESSAGING',
          volume: 10
        };
        var result = PartnerService.helpers.buildService(licenseInfo, mapping);
        expect(result.licenseType).toBe(Config.licenseTypes.MESSAGING);
        expect(result.qty).toBe(10);

      });

      it('should add a service if there is not already one with the same name', function () {
        var service = {
          qty: 20,
          name: 'Spark Room System'
        };
        var services = [{
          qty: 10,
          name: 'Messaging'
        }, {
          qty: 20,
          name: 'Call'
        }];
        PartnerService.helpers.addService(services, service);
        expect(services.length).toBe(3);

      });

      it('should  sum quantities if there is already service with the same name', function () {
        var service = {
          qty: 20,
          name: 'Spark Room System'
        };
        var services = [{
          qty: 10,
          name: 'Spark Room System'
        }, {
          qty: 20,
          name: 'Call'
        }];

        PartnerService.helpers.addService(services, service);
        expect(services.length).toBe(2);
        expect(services[0].qty).toBe(30);
      });
    });

    describe('getFreeOrActiveServices ', function () {
      var customer;

      beforeEach(function () {
        customer = {
          licenseList: testData.partialLicenseDataWithPaid
        };
      });

      it('should return an object without free/paid services if none or only multiple conferencing services', function () {
        var result = PartnerService.getFreeOrActiveServices(customer, true);
        var meetingServices = _.find(result, {
          isMeeting: true
        });
        expect(meetingServices).toBeDefined();
        expect(result.length).toBe(1);
      });

      it('should return  an array of free/paid services if present ', function () {
        customer.licenseList[3].isTrial = false;
        var result = PartnerService.getFreeOrActiveServices(customer, true);
        expect(result).toBeDefined();
        expect(result.length).toBe(2);
      });

      it('should return an array containing an object with  array of meeting services and total license quantity when multiple conf. services are active ', function () {
        var result = PartnerService.getFreeOrActiveServices(customer, true);
        var meeting = _.find(result, {
          isMeeting: true
        });
        expect(meeting).toBeDefined();
        expect(meeting.sub.length).toBe(3);
        expect(meeting.qty).toBe(500);
      });

      it('should return an array with a meeting and no meeting subarray when only 1 conferencing service', function () {
        _.each(customer.licenseList, function (license) {
          license.isTrial = true;
        });
        customer.licenseList[2].isTrial = false;
        var result = PartnerService.getFreeOrActiveServices(customer, true);
        // expect(result.meetingPaidServices).not.toBeDefined();
        expect(result).toBeDefined();
        expect(result[0].licenseType).toBe(Config.licenseTypes.CONFERENCING);
        expect(result[0].sub).not.toBeDefined();
      });
    });

    describe('massage data helpers', function () {
      it('should set the correct purchase status', function () {
        // purchased
        var dataPurchased = testData.customers[6];
        expect(PartnerService.helpers.calculatePurchaseStatus(dataPurchased)).toBe(true);
        // active, but on trial
        var dataNotPurchased1 = testData.customers[0];
        expect(PartnerService.helpers.calculatePurchaseStatus(dataNotPurchased1)).toBe(false);
        // not active
        var dataNotPurchased2 = testData.customers[3];
        expect(PartnerService.helpers.calculatePurchaseStatus(dataNotPurchased2)).toBe(false);
      });

      it('should set the service count properly', function () {
        var dataPurchased = testData.customers[6];
        dataPurchased.purchased = true;//this would be calculated in calculatePurchaseStatus
        expect(PartnerService.helpers.calculateTotalLicenses(dataPurchased)).toBe(200);

        var dataNotPurchased = testData.customers[7];
        dataNotPurchased.purchased = false;
        expect(PartnerService.helpers.calculateTotalLicenses(dataNotPurchased)).toBe(15);
      });

      it('should set the service column count correctly', function () {
        var dataNoWebex = testData.customers[7];
        expect(PartnerService.helpers.countUniqueServices(dataNoWebex)).toBe(1);

        var dataWithWebex = testData.customers[8];// This has 2 webex's in it, should only count 1
        expect(PartnerService.helpers.countUniqueServices(dataWithWebex)).toBe(2);
      });
    });
  });
});
