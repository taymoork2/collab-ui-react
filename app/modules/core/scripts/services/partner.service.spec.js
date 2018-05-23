'use strict';

describe('Partner Service -', function () {
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));

  var $httpBackend, $translate, $scope, Analytics, Authinfo, Config, PartnerService, UrlConfig;

  var testData;

  beforeEach(inject(function (_$httpBackend_, $rootScope, _$translate_, _Analytics_, _Authinfo_, _Config_, _PartnerService_, _UrlConfig_) {
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    $translate = _$translate_;
    Analytics = _Analytics_;
    Authinfo = _Authinfo_;
    Config = _Config_;
    PartnerService = _PartnerService_;
    UrlConfig = _UrlConfig_;

    testData = _.cloneDeep(getJSONFixture('core/json/partner/partner.service.json'));
    spyOn(Authinfo, 'getOrgId').and.returnValue('12345');
    spyOn(Authinfo, 'getUserId').and.returnValue('123');
    spyOn(Authinfo, 'getPrimaryEmail').and.returnValue('fake-primaryEmail');
    spyOn(Authinfo, 'getManagedOrgs').and.returnValue([]);
    spyOn(Analytics, 'trackPartnerActions');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
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
    expect(PartnerService.getLicense(testData.licenses, Config.offerCodes.MS)[0]).toEqual(testData.licenses[0]);
    expect(PartnerService.getLicense(testData.licenses, Config.offerCodes.CF)[0]).toEqual(testData.licenses[1]);
    expect(PartnerService.getLicense(testData.licenses, Config.offerCodes.CO)[0]).toEqual(testData.licenses[2]);
    expect(PartnerService.getLicense(testData.licenses, Config.offerCodes.CDC)[0]).toEqual(testData.licenses[6]);
  });

  it('should successfully return a boolean on whether or not a license is available from calling isLicenseInfoAvailable', function () {
    expect(PartnerService.isLicenseInfoAvailable(testData.customers[0])).toBe(true);
    testData.customers[0].licenseList = [];
    expect(PartnerService.isLicenseInfoAvailable(testData.customers[0])).toBe(true);
    delete testData.customers[0].licenseList;
    expect(PartnerService.isLicenseInfoAvailable(testData.customers[0])).toBe(false);
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
    expect(customerActive.notes.sortOrder).toBe(PartnerService.customerStatus.NOTE_DAYS_LEFT);
    expect(customerActive.notes.daysLeft).toBe(45);
    expect(customerActive.notes.text).toBe('customerPage.daysLeftToPurchase');

    // Customer's isTrial, status, and daysLeft properties are true, "ACTIVE", and 0.
    var customerExpireToday = testData.customers[1];
    PartnerService.setNotesSortOrder(customerExpireToday);
    expect(customerExpireToday.notes.sortOrder).toBe(PartnerService.customerStatus.NOTE_DAYS_LEFT);
    expect(customerExpireToday.notes.daysLeft).toBe(0);
    expect(customerExpireToday.notes.text).toBe('customerPage.expiringToday');

    // Customer's status and daysLeft properties are "ACTIVE" and -30
    var customerExpired = testData.customers[2];
    PartnerService.setNotesSortOrder(customerExpired);
    expect(customerExpired.notes.sortOrder).toBe(PartnerService.customerStatus.NOTE_DAYS_LEFT);
    expect(customerExpired.notes.daysLeft).toBe(-25);
    expect(customerExpired.notes.text).toBe('customerPage.expiredWithGracePeriod');

    // Customer's status property is "PENDING"
    var customerNoLicense = testData.customers[3];
    PartnerService.setNotesSortOrder(customerNoLicense);
    expect(customerNoLicense.notes.sortOrder).toBe(undefined);
    expect(customerNoLicense.notes.text).toBe('customerPage.licenseInfoNotAvailable');

    // Customer does not have a licenseList property
    customerNoLicense = testData.customers[4];
    PartnerService.setNotesSortOrder(customerNoLicense);
    expect(customerNoLicense.notes.sortOrder).toBe(undefined);
    expect(customerNoLicense.notes.text).toBe('customerPage.licenseInfoNotAvailable');

    // Customer status property is "CANCELED"
    var customerCanceled = testData.customers[5];
    PartnerService.setNotesSortOrder(customerCanceled);
    expect(customerCanceled.notes.sortOrder).toBe(undefined);
    expect(customerCanceled.notes.text).toBe('customerPage.suspended');
  });

  it('should successfully return an array of customers with additional properties from calling loadRetrievedDataToList', function () {
    var returnList = PartnerService.loadRetrievedDataToList(_.get(testData, 'managedOrgsResponse.data.organizations', []), {
      isTrialData: true,
      isCareEnabled: true,
      isAdvanceCareEnabled: true,
    });
    var activeList = _.filter(returnList, {
      state: 'ACTIVE',
    });
    var expiredList = _.filter(returnList, {
      state: 'EXPIRED',
    });
    // Five customers, three active, two expired
    expect(returnList.length).toBe(5);
    expect(activeList.length).toBe(3);
    expect(expiredList.length).toBe(2);

    // Three licenses converted to License List. First license has four entitlements
    expect(returnList[0].licenseList.length).toBe(4);
    expect(returnList[0].licenseList[0].features.length).toBe(4);
    expect(returnList[0].licenseList[0].features).toEqual(testData.managedOrgsResponse.data.organizations[0].licenses[0].features);

    // Verify additional properties are set to the corresponding license object and added to customer object.
    expect(activeList[1].conferencing.features.length).toBe(3);
    expect(activeList[1].messaging.features.length).toBe(4);
    expect(activeList[1].care.features.length).toBe(4);
    expect(activeList[1].advanceCare.features.length).toBe(5);
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
    var offers = _.map(returnList, 'offers');

    expect(offers.length).toBe(returnList.length);

    for (var i = 0; i < returnList.length; i++) {
      expect(returnList[i].licenses).not.toBe(0);
    }
  });

  it('should successfully return a list customer orgs with orderedServices property from calling loadRetrievedDataToList with isCareEnabled being true', function () {
    Authinfo.getPrimaryEmail.and.returnValue('partner@company.com');

    var returnList = PartnerService.loadRetrievedDataToList(_.get(testData, 'managedOrgsResponse.data.organizations', []), {
      isTrialData: true,
      isCareEnabled: true,
      isAdvanceCareEnabled: true,
    });
    var expectedServices = ['messaging', 'communications', 'webex', 'roomSystems', 'sparkBoard', 'care', 'advanceCare'];
    var expectedServicesManagedByOthers = ['conferencing'];

    // Verify the ordered service property
    expect(returnList[0].orderedServices.servicesManagedByCurrentPartner.length).toBe(7);
    expect(returnList[0].orderedServices.servicesManagedByCurrentPartner).toEqual(expectedServices);
    expect(returnList[0].orderedServices.servicesManagedByAnotherPartner.length).toBe(1);
    expect(returnList[0].orderedServices.servicesManagedByAnotherPartner).toEqual(expectedServicesManagedByOthers);
    // accountStatus should reflect value returned by getAccountStatus()
    expect(returnList[0].accountStatus).toBe('trial');
  });

  it('should successfully return a list customer orgs with orderedServices property from calling loadRetrievedDataToList with isCareEnabled being false', function () {
    Authinfo.getPrimaryEmail.and.returnValue('partner@company.com');

    // Make the messaging service appear to have been provisiond by the customer
    delete testData.managedOrgsResponse.data.organizations[0].licenses[0].partnerEmail;

    var returnList = PartnerService.loadRetrievedDataToList(_.get(testData, 'managedOrgsResponse.data.organizations', []), {
      isTrialData: true,
      isCareEnabled: false,
      isAdvanceCareEnabled: false,
    });
    var expectedServices = ['communications', 'webex', 'roomSystems', 'sparkBoard'];
    var expectedServicesManagedByOthers = ['conferencing'];
    var expectedServicesManagedByCustomer = ['messaging'];

    // Verify the ordered service property
    expect(returnList[0].orderedServices.servicesManagedByCurrentPartner.length).toBe(4);
    expect(returnList[0].orderedServices.servicesManagedByCurrentPartner).toEqual(expectedServices);
    expect(returnList[0].orderedServices.servicesManagedByAnotherPartner.length).toBe(1);
    expect(returnList[0].orderedServices.servicesManagedByAnotherPartner).toEqual(expectedServicesManagedByOthers);
    expect(returnList[0].orderedServices.servicesManagedByCustomer.length).toBe(1);
    expect(returnList[0].orderedServices.servicesManagedByCustomer).toEqual(expectedServicesManagedByCustomer);
  });

  it('should successfully return an array of customers from calling exportCSV', function () {
    var url = UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/managedOrgs';
    $httpBackend.expectGET(url).respond(testData.managedOrgsResponse.status, testData.managedOrgsResponse.data);
    var promise = PartnerService.exportCSV(false);
    promise.then(function (customers) {
      expect(customers).toEqual(testData.exportCSVResult);
    });
    $httpBackend.flush();
  });

  it('should successfully return an array of customers with care entitlements from calling exportCSV', function () {
    var url = UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/managedOrgs';
    $httpBackend.whenGET(url).respond(testData.managedOrgsResponse.status, testData.managedOrgsResponse.data);
    var promise = PartnerService.exportCSV(true);
    promise.then(function (customers) {
      expect(customers).toEqual(testData.exportCSVResultWithCare);
    });
    $httpBackend.flush();
  });

  describe('updateOrgForCustomerView function', function () {
    beforeEach(installPromiseMatchers);
    it('should execute and call the appropriate back end url', function () {
      var url = UrlConfig.getAdminServiceUrl() + 'organizations/12345/users/123/actions/configureCustomerAdmin/invoke?customerOrgId=1a1';
      $httpBackend.expectPOST(url).respond(200);
      var promise = PartnerService.updateOrgForCustomerView('1a1');
      $scope.$apply();
      $httpBackend.flush();
      expect(promise).toBeResolved();
    });
  });

  describe('modifyManagedOrgs function', function () {
    beforeEach(installPromiseMatchers);

    it('should call a patch if organization is not matched', function () {
      var url = UrlConfig.getAdminServiceUrl() + 'organization/12345/users/roles';
      $httpBackend.expectPATCH(url).respond(200);
      PartnerService.modifyManagedOrgs('fake-customer-org-id-1');
      $scope.$apply();
      $httpBackend.flush();
    });

    it('should resolve but not patch if organization is already managed', function () {
      Authinfo.getManagedOrgs.and.returnValue(['fake-customer-org-id-1']);
      var promise = PartnerService.modifyManagedOrgs('fake-customer-org-id-1');
      expect(promise).toBeResolved();
    });
  });

  describe('canAdminTrial function', function () {
    var licenses;
    beforeEach(function () {
      licenses = _.cloneDeep(testData.licenses);
      _.forEach(licenses, function (license) {
        license.isTrial = true;
        license.partnerOrgId = 'other-partner-org2-id';
        license.partnerEmail = 'otherPartner@othercompany.com';
      });
      $scope.$digest();
    });
    afterEach(function () {
      licenses = null;
    });

    it('should return false if the partnerOrgId property on any license does not match the org id of the logged in user', function () {
      expect(PartnerService.canAdminTrial(licenses)).toBe(false);
    });

    it('should return true if the partnerOrgId property on any license matches the org id of the logged in user', function () {
      licenses[1].partnerOrgId = '12345';
      expect(PartnerService.canAdminTrial(licenses)).toBe(true);
    });

    it('should return if the partnerOrgId property is undefined and email in any service matches the email of the logged in user', function () {
      _.each(licenses, function (license) {
        license.partnerOrgId = undefined;
      });
      licenses[0].partnerEmail = 'fake-primaryEmail';
      expect(PartnerService.canAdminTrial(licenses)).toBe(true);
    });

    it('should return false if the partnerOrgId is null and email is null in all services', function () {
      _.each(licenses, function (license) {
        license.partnerOrgId = undefined;
        license.partnerEmail = undefined;
      });
      expect(PartnerService.canAdminTrial(licenses)).toBe(false);
    });
  });

  describe('isServiceManagedByCurrentPartner', function () {
    var services;

    beforeEach(function () {
      services = getJSONFixture('core/json/partner/partner.service.json').services;
      Authinfo.getPrimaryEmail.and.returnValue(services.messaging.partnerEmail);
      Authinfo.getOrgId.and.returnValue(services.messaging.partnerOrgId);
    });

    it('should return true by matching partner email', function () {
      var serviceObj = {
        partnerEmail: services.messaging.partnerEmail,
      };
      expect(PartnerService.isServiceManagedByCurrentPartner(serviceObj)).toBe(true);
    });

    it('should return true by matching partner org', function () {
      var serviceObj = {
        partnerOrgId: services.messaging.partnerOrgId,
      };
      expect(PartnerService.isServiceManagedByCurrentPartner(serviceObj)).toBe(true);
    });

    it('should return true by making isServiceNotLicensed return true', function () {
      var serviceObj = {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
      };
      expect(PartnerService.isServiceManagedByCurrentPartner(serviceObj)).toBe(true);
    });

    it('should return false by not matching partner email and partner org id and making isServiceNotLicensed return false', function () {
      var serviceObj = {
        volume: 1,
      };
      expect(PartnerService.isServiceManagedByCurrentPartner(serviceObj)).toBe(false);
    });

    describe('testing with payload data', function () {
      it('should return true for messaging service (licensed and managed by current partner)', function () {
        expect(PartnerService.isServiceManagedByCurrentPartner(services.messaging)).toBe(true);
      });

      it('should return false for conferencing service (licensed and managed by a different partner)', function () {
        expect(PartnerService.isServiceManagedByCurrentPartner(services.conferencing)).toBe(false);
      });

      it('should return true for communications service (not licensed)', function () {
        expect(PartnerService.isServiceManagedByCurrentPartner(services.communications)).toBe(true);
      });

      it('should return true for webexEEConferencing service (licensed, without partnerOrdId properties, ' +
      'and managed by current partner)', function () {
        expect(PartnerService.isServiceManagedByCurrentPartner(services.webexEEConferencing)).toBe(true);
      });

      it('should return true for roomSystems service (licensed, without partnerEmail properties, and managed by current partner)', function () {
        expect(PartnerService.isServiceManagedByCurrentPartner(services.roomSystems)).toBe(true);
      });

      it('should return false for sparkBoard service (licensed and managed by a different partner)', function () {
        expect(PartnerService.isServiceManagedByCurrentPartner(services.sparkBoard)).toBe(false);
      });

      it('should return false for care service (licensed and without partnerOrgId or partnerEmail properties)', function () {
        expect(PartnerService.isServiceManagedByCurrentPartner(services.care)).toBe(false);
      });

      it('should return false for advance care service (licensed and without partnerOrgId or partnerEmail properties)', function () {
        expect(PartnerService.isServiceManagedByCurrentPartner(services.advanceCare)).toBe(false);
      });
    });
  });

  describe('helper functions -', function () {
    describe('getTrialMeetingServices', function () {
      var licenses;
      beforeEach(function () {
        licenses = _.cloneDeep(testData.licenses);
      });
      afterEach(function () {
        licenses = null;
      });
      it('should return a list of meeting and webex for services for trials', function () {
        licenses.push({
          licenseId: 'EE_abdd0d28-a886-452a-b2b0-97861baa2a54',
          offerName: 'EE',
          licenseType: 'CONFERENCING',
          volume: 100,
          isTrial: true,
        });
        var list = PartnerService.getTrialMeetingServices(licenses);
        expect(list.length).toBe(2);
      });

      it('should return a list of meeting and webex for services ONLY for trials', function () {
        licenses.push({
          licenseId: 'EE_abdd0d28-a886-452a-b2b0-97861baa2a54',
          offerName: 'EE',
          licenseType: 'CONFERENCING',
          volume: 100,
          isTrial: false,
        });

        var list = PartnerService.getTrialMeetingServices(licenses);
        expect(list.length).toBe(1);
      });
    });

    describe('parseLicensesAndOffers -', function () {
      it('should return a default object if "offers" property is an empty list', function () {
        var data = PartnerService.parseLicensesAndOffers();
        expect(data.licenses).toBe(0);
        expect(data.deviceLicenses).toBe(0);
        expect(data.isSquaredUcOffer).toBe(false);
        expect(data.usage).toBe(0);
        expect(data.offer).toEqual({
          trialServices: [],
        });
      });

      it('should return an object with "usage" copied from the input\'s "offers" last element\'s "usageCount" property', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            usageCount: 1,
          }],
        }, { isCareEnabled: true, isAdvanceCareEnabled: true });
        expect(data.usage).toBe(1);
      });

      it('should return an object with "license" copied from the input\'s "offers" last element\'s "licenseCount" property', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            licenseCount: 10,
          }],
        }, { isCareEnabled: true });
        expect(data.licenses).toBe(10);

        data = PartnerService.parseLicensesAndOffers({
          offers: [{
            licenseCount: 10,
          }, {
            licenseCount: 30,
          }, {
            licenseCount: 20,
          }],
        }, { isCareEnabled: true, isAdvanceCareEnabled: true });
        expect(data.licenses).toBe(20);
      });

      it('should return an object with "deviceLicenses" copied from the input\'s "offers" last element\'s "licenseCount" property, if the offers "id" property matches `Config.offerTypes.roomSystems`', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.roomSystems,
            licenseCount: 10,
          }],
        }, { isCareEnabled: true, isAdvanceCareEnabled: true });
        expect(data.deviceLicenses).toBe(10);
      });

      it('should return an object with "deviceLicenses" copied from the input\'s "offers" last element\'s "licenseCount" property, if the offers "id" property matches `Config.offerTypes.sparkBoard`', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.sparkBoard,
            licenseCount: 10,
          }],
        }, { isCareEnabled: true, isAdvanceCareEnabled: true });
        expect(data.deviceLicenses).toBe(10);
      });

      it('should return an object with "deviceLicenses" set to zero if no device licenses present in the offers', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.call,
            licenseCount: 10,
          }],
        }, { isCareEnabled: true, isAdvanceCareEnabled: true });
        expect(data.deviceLicenses).toBe(0);
      });

      it('should return an object with "deviceLicenses" being the sum of both SD and SB copied from the input\'s "offers" last element\'s of both offer type "licenseCount" property, if the offers "id" property matches `Config.offerTypes.roomSystems`', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.roomSystems,
            licenseCount: 10,
          }, {
            id: Config.offerTypes.sparkBoard,
            licenseCount: 15,
          }],
        }, { isCareEnabled: true, isAdvanceCareEnabled: true });
        expect(data.deviceLicenses).toBe(25);
      });


      it('should return an object with "deviceLicenses" being the sum of the last SD and the last SB offer type elements', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.roomSystems,
            //TODO the bug in the backend returns as example; three equal elements of the same offer type (same license count). this test with difference in count is to highlighth that it is the last element we are picking.
            licenseCount: 8,
          }, {
            id: Config.offerTypes.roomSystems,
            licenseCount: 9,
          }, {
            id: Config.offerTypes.roomSystems,
            licenseCount: 10,
          }, {
            id: Config.offerTypes.sparkBoard,
            licenseCount: 14,
          }, {
            id: Config.offerTypes.sparkBoard,
            licenseCount: 15,
          }],
        }, { isCareEnabled: true, isAdvanceCareEnabled: true });
        expect(data.deviceLicenses).toBe(25);
      });

      it('should return an object with its "offer.trialServices" array containing object with the name translated "trials.message" l10n key, if the offers "id" property matches `Config.offerTypes.spark1` or `Config.offerTypes.message`', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.spark1,
          }],
        }, { isCareEnabled: true, isAdvanceCareEnabled: true });
        expect(_.map(data.offer.trialServices, function (o) { return o.name; })).toContain($translate.instant('trials.message'));

        data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.message,
          }],
        }, { isCareEnabled: true, isAdvanceCareEnabled: true });
        expect(_.map(data.offer.trialServices, function (o) { return o.name; })).toContain($translate.instant('trials.message'));
      });

      it('should return an object with its "offer.trialServices" array containing object with the name translated "trials.care" l10n key, if the offers "id" property matches `Config.offerTypes.care` and atlasCareTrials feature is enabled for the org', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.care,
          }],
        }, { isCareEnabled: true, isAdvanceCareEnabled: false });
        expect(_.map(data.offer.trialServices, function (o) { return o.name; })).toContain($translate.instant('customerPage.care'));
      });

      it('should return an object with its "offer.trialServices" array empty and without the translated "trials.care" l10n key, if atlasCareTrials feature is disabled for the org', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.care,
          }],
        }, { isCareEnabled: false, isAdvanceCareEnabled: false });
        expect(data.offer.trialServices.length).toEqual(0);
      });

      it('should return an object with its "offer.trialServices" array containing object with the name translated "trials.advanceCare" l10n key, if the offers "id" property matches `Config.offerTypes.advanceCare` and atlasCareTrials feature is enabled for the org', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.advanceCare,
          }],
        }, { isCareEnabled: false, isAdvanceCareEnabled: true });
        expect(_.map(data.offer.trialServices, function (o) { return o.name; })).toContain($translate.instant('customerPage.care'));
      });

      it('should return an object with its "offer.trialServices" array empty and without the translated "trials.advanceCare" l10n key, if atlasCareTrials feature is disabled for the org', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.advanceCare,
          }],
        }, { isCareEnabled: false, isAdvanceCareEnabled: false });
        expect(data.offer.trialServices.length).toEqual(0);
      });

      it('should return an object with its "offer.trialServices" array containing object with the name translated "trials.collab" l10n key, if the offers "id" property matches `Config.offerTypes.collab`', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.collab,
          }],
        }, { isCareEnabled: true, isAdvanceCareEnabled: true });
        expect(_.map(data.offer.trialServices, function (o) { return o.name; })).toContain($translate.instant('trials.message'));
      });

      it('should return an object with its "offer.trialServices" array containing object with the name translated "trials.squaredUC" l10n key, if the offers "id" property matches `Config.offerTypes.call` or `Config.offerTypes.squaredUC`', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.call,
          }],
        }, { isCareEnabled: true, isAdvanceCareEnabled: true });
        expect(_.map(data.offer.trialServices, function (o) { return o.name; })).toContain($translate.instant('trials.call'));

        data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.squaredUC,
          }],
        }, { isCareEnabled: true, isAdvanceCareEnabled: true });
        expect(_.map(data.offer.trialServices, function (o) { return o.name; })).toContain($translate.instant('trials.call'));
      });

      it('should return an object with "isSquaredUcOffer" property set to `true`, only if any of the offers "id" property matches `Config.offerTypes.call` or `Config.offerTypes.squaredUC`', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.call,
          }],
        }, { isCareEnabled: true, isAdvanceCareEnabled: true });
        expect(data.isSquaredUcOffer).toBe(true);

        data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.squaredUC,
          }],
        }, { isCareEnabled: true, isAdvanceCareEnabled: true });
        expect(data.isSquaredUcOffer).toBe(true);

        data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.spark1,
          }, {
            id: Config.offerTypes.squaredUC,
          }, // presence anywhere in this list will set the property to true
          {
            id: Config.offerTypes.collab,
          },
          ],
        }, { isCareEnabled: true, isAdvanceCareEnabled: true });
        expect(data.isSquaredUcOffer).toBe(true);
      });

      it('should set isSquaredUcOffer to true, only if any of the "licenseType" property matches the value for Config.licenseTypes.COMMUNICATION', function () {
        var data = PartnerService.parseLicensesAndOffers({
          licenses: [{
            licenseType: Config.licenseTypes.COMMUNICATION,
          }],
        }, { isCareEnabled: true, isAdvanceCareEnabled: true });
        expect(data.isSquaredUcOffer).toBe(true);

        data = PartnerService.parseLicensesAndOffers({
          licenses: [{
            licenseType: Config.licenseTypes.MESSAGING,
          }, {
            licenseType: Config.licenseTypes.COMMUNICATION,
          }, // presence anywhere in this list should set the property to true
          {
            licenseType: Config.licenseTypes.CONFERENCING,
          },
          ],
        }, { isCareEnabled: true, isAdvanceCareEnabled: true });
        expect(data.isSquaredUcOffer).toBe(true);

        data = PartnerService.parseLicensesAndOffers({
          licenses: [{
            licenseType: Config.licenseTypes.MESSAGING,
          }, {
            licenseType: Config.licenseTypes.CONFERENCING,
          }],
        }, { isCareEnabled: true, isAdvanceCareEnabled: true });
        expect(data.isSquaredUcOffer).toBe(false);
      });

      it('should not throw errors when licenses have undefined values', function () {
        var data = PartnerService.parseLicensesAndOffers({
          licenses: [
            undefined, {
              licenseType: undefined,
            },
          ],
        }, { isCareEnabled: true, isAdvanceCareEnabled: true });
        expect(data.isSquaredUcOffer).toBe(false);

        data = PartnerService.parseLicensesAndOffers({
          licenses: [{
            licenseType: undefined,
          }, {
            licenseType: Config.licenseTypes.COMMUNICATION,
          },
          undefined,
          ],
        }, true);
        expect(data.isSquaredUcOffer).toBe(true);
      }, true);

      it('should return an object with its "offer.trialServices" array containing object with the name translated "customerPage.EE" l10n key, if the offers "id" property matches `Config.offerTypes.webex` or `Config.offerTypes.meetings`', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.webex,
          }],
        }, { isCareEnabled: true, isAdvanceCareEnabled: true });
        expect(_.map(data.offer.trialServices, function (o) { return o.name; })).toContain($translate.instant('customerPage.EE'));

        data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.meetings,
          }],
        }, { isCareEnabled: true, isAdvanceCareEnabled: true });
        expect(_.map(data.offer.trialServices, function (o) { return o.name; })).toContain($translate.instant('customerPage.EE'));
      });

      it('should return an object with its "offer.trialServices" array containing object with the name translated "subscriptions.room" l10n key, if the offers "id" property matches `Config.offerTypes.roomSystems`', function () {
        var data = PartnerService.parseLicensesAndOffers({
          offers: [{
            id: Config.offerTypes.roomSystems,
          }],
        }, { isCareEnabled: true, isAdvanceCareEnabled: true });
        expect(data.isRoomSystems).toBe(true);
        expect(_.map(data.offer.trialServices, function (o) { return o.name; })).toContain($translate.instant('subscriptions.room'));
      });
    });

    describe('related to getFreeOrActiveServices ', function () {
      it('should createConferenceMapping with conferencing license type', function () {
        var result = PartnerService.helpers.createConferenceMapping();
        expect(result[Config.offerCodes.CF].licenseType).toBe(Config.licenseTypes.CONFERENCING);
      });

      it('should createRoomDeviceMapping with SHARED_DEVICES license type', function () {
        var result = PartnerService.helpers.createRoomDeviceMapping();
        expect(result[Config.offerCodes.SD].licenseType).toBe(Config.licenseTypes.SHARED_DEVICES);
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

      it('should return TRUE from isDisplayableService for trial license if looking for trials', function () {
        var licenseInfo = {
          licenseType: Config.licenseTypes.MESSAGING,
          volume: 10,
          isTrial: true,
        };
        var isTrial = true;
        expect(PartnerService.helpers.isDisplayableService(licenseInfo, isTrial)).toBe(true);
      });

      it('should return FALSE from isDisplayableService for trial license if NOT looking for trials', function () {
        var licenseInfo = {
          licenseType: Config.licenseTypes.MESSAGING,
          volume: 10,
          isTrial: true,
        };
        var options = { isTrial: false };
        expect(PartnerService.helpers.isDisplayableService(licenseInfo, options)).toBe(false);
      });

      it('should return FALSE from isDisplayableService for storage license', function () {
        var licenseInfo = {
          licenseType: Config.licenseTypes.STORAGE,
          volume: 10,
        };
        var options = { isTrial: false, isCareEnabled: true, isAdvanceCareEnabled: true };
        expect(PartnerService.helpers.isDisplayableService(licenseInfo, options)).toBe(false);
      });

      it('should return FALSE from isDisplayableService for audio license', function () {
        var licenseInfo = {
          licenseType: Config.licenseTypes.AUDIO,
          volume: 10,
        };
        var options = { isTrial: false, isCareEnabled: true, isAdvanceCareEnabled: true };
        expect(PartnerService.helpers.isDisplayableService(licenseInfo, options)).toBe(false);
      });

      it('should return the value of the toggle  from isDisplayableService for care license', function () {
        var licenseInfo = {
          licenseType: Config.licenseTypes.CARE,
          volume: 10,
        };
        var options = { isTrial: false, isCareEnabled: false, isAdvanceCareEnabled: false };
        expect(PartnerService.helpers.isDisplayableService(licenseInfo, options)).toBe(false);
        options.isCareEnabled = true;
        options.isAdvanceCareEnabled = false;
        expect(PartnerService.helpers.isDisplayableService(licenseInfo, options)).toBe(true);
        options.isCareEnabled = false;
        options.isAdvanceCareEnabled = true;
        expect(PartnerService.helpers.isDisplayableService(licenseInfo, options)).toBe(false);
        options.isCareEnabled = true;
        options.isAdvanceCareEnabled = true;
        expect(PartnerService.helpers.isDisplayableService(licenseInfo, options)).toBe(true);
      });

      it('should return the value of the toggle  from isDisplayableService for Advance Care license', function () {
        var licenseInfo = {
          licenseType: Config.licenseTypes.ADVANCE_CARE,
          volume: 10,
        };
        var options = { isTrial: false, isCareEnabled: false, isAdvanceCareEnabled: false };
        expect(PartnerService.helpers.isDisplayableService(licenseInfo, options)).toBe(false);
        options.isCareEnabled = false;
        options.isAdvanceCareEnabled = true;
        expect(PartnerService.helpers.isDisplayableService(licenseInfo, options)).toBe(true);
        options.isCareEnabled = true;
        options.isAdvanceCareEnabled = false;
        expect(PartnerService.helpers.isDisplayableService(licenseInfo, options)).toBe(false);
        options.isCareEnabled = true;
        options.isAdvanceCareEnabled = true;
        expect(PartnerService.helpers.isDisplayableService(licenseInfo, options)).toBe(true);
      });

      it('should return TRUE from isDisplayableService for care license for paid conference license ', function () {
        var licenseInfo = {
          licenseType: Config.licenseTypes.CONFERENCING,
          volume: 10,
        };
        var options = { isTrial: false, isCareEnabled: true, isAdvanceCareEnabled: true };
        expect(PartnerService.helpers.isDisplayableService(licenseInfo, options)).toBe(true);
      });

      it('should build a meeting service given conferencing mapping', function () {
        var mapping = PartnerService.helpers.createConferenceMapping();
        var licenseInfo = {
          volume: 20,
        };
        var result = new PartnerService.helpers.LicensedService(licenseInfo, mapping);
        expect(result.icon).toBe('icon-circle-group');
        expect(result.qty).toBe(20);
      });
      it('should build a non meeting service given license mapping', function () {
        var mapping = PartnerService.helpers.createLicenseMapping();
        var licenseInfo = {
          licenseType: 'MESSAGING',
          volume: 10,
        };
        var result = new PartnerService.helpers.LicensedService(licenseInfo, mapping);
        expect(result.licenseType).toBe(Config.licenseTypes.MESSAGING);
        expect(result.qty).toBe(10);
      });

      it('should add a service if there is not already one with the same name', function () {
        var service = {
          qty: 20,
          name: 'Spark Room System',
        };
        var services = [{
          qty: 10,
          name: 'Messaging',
        }, {
          qty: 20,
          name: 'Call',
        }];
        PartnerService.helpers.addService(services, service);
        expect(services.length).toBe(3);
      });

      it('should  sum quantities if there is already service with the same name', function () {
        var service = {
          qty: 20,
          name: 'Spark Room System',
        };
        var services = [{
          qty: 10,
          name: 'Spark Room System',
        }, {
          qty: 20,
          name: 'Call',
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
          licenseList: testData.partialLicenseDataWithPaid,
        };
      });

      it('should return an object without free/paid services if none or only multiple conferencing services', function () {
        var result = PartnerService.getFreeOrActiveServices(customer, { isTrial: false });
        var meetingServices = _.find(result, {
          isMeeting: true,
        });
        expect(meetingServices).toBeDefined();
        expect(result.length).toBe(1);
      });

      it('should return  an array of free/paid services if present ', function () {
        customer.licenseList[3].isTrial = false;
        var options = { isCareEnabled: true, isTrial: false };
        var result = PartnerService.getFreeOrActiveServices(customer, options);
        expect(result).toBeDefined();
        expect(result.length).toBe(2);
      });

      it('should return an array containing an object with  array of meeting services and total license quantity when multiple conf. services are active ', function () {
        var options = { isCareEnabled: true, isTrial: false };
        var result = PartnerService.getFreeOrActiveServices(customer, options);
        var meeting = _.find(result, {
          isMeeting: true,
        });
        expect(meeting).toBeDefined();
        expect(meeting.sub.length).toBe(3);
        expect(meeting.qty).toBe(500);
      });

      it('should return an array with a meeting and no meeting subarray when only 1 conferencing service', function () {
        var options = { isCareEnabled: true, isTrial: false };
        _.each(customer.licenseList, function (license) {
          license.isTrial = true;
        });
        customer.licenseList[2].isTrial = false;
        var result = PartnerService.getFreeOrActiveServices(customer, options);
        expect(result).toBeDefined();
        expect(result[0].licenseType).toBe(Config.licenseTypes.CONFERENCING);
        expect(result[0].sub).not.toBeDefined();
      });

      it('should return an array with (1) shared devices when spark board or room system is present', function () {
        var options = { isCareEnabled: true, isTrial: false };
        var licenses = _.cloneDeep(customer.licenseList);
        licenses.push({
          offerName: 'SB',
          licenseType: 'SHARED_DEVICES',
          volume: 100,
          isTrial: false,
        });
        _.each(licenses, function (license) {
          license.isTrial = true;
        });
        licenses[6].isTrial = false;
        customer = {
          licenseList: licenses,
        };
        var result = PartnerService.getFreeOrActiveServices(customer, options);
        expect(result).toBeDefined();
        expect(result[0].licenseType).toBe(Config.licenseTypes.SHARED_DEVICES);
        expect(result[0].sub).toBeDefined();
        expect(result[0].sub.length).toBe(1);
      });

      it('should return an array with (2) shared devices when both spark board and room system are present', function () {
        var options = { isCareEnabled: true, isTrial: false };
        var licenses = _.cloneDeep(customer.licenseList);
        licenses.push({
          offerName: 'SB',
          licenseType: 'SHARED_DEVICES',
          volume: 100,
          isTrial: false,
        });
        licenses.push({
          offerName: 'SD',
          licenseType: 'SHARED_DEVICES',
          volume: 50,
          isTrial: false,
        });
        _.each(licenses, function (license) {
          license.isTrial = true;
        });
        licenses[6].isTrial = false;
        licenses[7].isTrial = false;
        customer = {
          licenseList: licenses,
        };
        var result = PartnerService.getFreeOrActiveServices(customer, options);
        expect(result).toBeDefined();
        expect(result[0].licenseType).toBe(Config.licenseTypes.SHARED_DEVICES);
        expect(result[0].qty).toBe(150);
        expect(result[0].sub).toBeDefined();
        expect(result[0].sub.length).toBe(2);
      });
    });

    describe('massage data', function () {
      it('should set the correct purchase status', function () {
        // ACTIVE
        expect(PartnerService.helpers.calculatePurchaseStatus(testData.customers[6])).toBe(true);
        // ACTIVE, all licenses trials
        expect(PartnerService.helpers.calculatePurchaseStatus(testData.customers[0])).toBe(false);
        // ACTIVE, mixture of purchased and trial licenses
        testData.customers[0].licenseList[0].isTrial = false;
        expect(PartnerService.helpers.calculatePurchaseStatus(testData.customers[0])).toBe(true);
        // PENDING, all licenses trials
        expect(PartnerService.helpers.calculatePurchaseStatus(testData.customers[3])).toBe(false);
        // PENDING, mixture of purchased and trial licenses
        testData.customers[3].licenseList[0].isTrial = false;
        expect(PartnerService.helpers.calculatePurchaseStatus(testData.customers[3])).toBe(false);
      });

      it('should set the service count properly', function () {
        var dataPurchased = testData.customers[5];
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

      it('should return the correct account status', function () {
        var data = testData.customers[7];

        // daysLeft < 0 means expired
        data.daysLeft = -1;
        expect(PartnerService.getAccountStatus(data)).toBe('expired');

        // daysLeft >= 0 means active trial
        data.daysLeft = 0;
        expect(PartnerService.getAccountStatus(data)).toBe('trial');

        // No 'named' licenses marked as 'isTrial' means 'active' (purchased)
        data.daysLeft = -1;
        data.communications.isTrial = false;
        expect(PartnerService.getAccountStatus(data)).toBe('active');

        // Purchased set when some
        data.purchased = true;
        expect(PartnerService.getAccountStatus(data)).toBe('active');
      });
    });

    describe('isServiceNotLicensed', function () {
      it('should return true if "volume" property is undefined and the total number of properties is 4', function () {
        var unlicensedServiceObj = {
          1: 1,
          2: 2,
          3: 3,
          4: 4,
        };
        var result = PartnerService.helpers.isServiceNotLicensed(unlicensedServiceObj);
        expect(result).toBe(true);
      });

      it('should return false if "volume" property is defined', function () {
        var licensedServiceObj = {
          volume: 0,
        };
        var result = PartnerService.helpers.isServiceNotLicensed(licensedServiceObj);
        expect(result).toBe(false);
      });

      it('should return false if the total number of properties is not 4', function () {
        var licensedServiceObj = {
          1: 1,
          2: 2,
          3: 3,
          4: 4,
          5: 5,
        };
        var result = PartnerService.helpers.isServiceNotLicensed(licensedServiceObj);
        expect(result).toBe(false);

        // remove 1 property, total properties is now 4
        delete licensedServiceObj['5'];
        result = PartnerService.helpers.isServiceNotLicensed(licensedServiceObj);
        expect(result).toBe(true);

        // remove 1 property, total properties is now 3
        delete licensedServiceObj['4'];
        result = PartnerService.helpers.isServiceNotLicensed(licensedServiceObj);
        expect(result).toBe(false);
      });

      describe('testing with payload data', function () {
        var services;

        beforeEach(function () {
          services = getJSONFixture('core/json/partner/partner.service.json').services;
        });

        it('should return false for messaging service (licensed)', function () {
          expect(PartnerService.helpers.isServiceNotLicensed(services.messaging)).toBe(false);
        });

        it('should return true for communications service (not licensed)', function () {
          expect(PartnerService.helpers.isServiceNotLicensed(services.communications)).toBe(true);
        });

        it('should return false for sparkBoard service (licensed, but without volume property)', function () {
          services.sparkBoard.volume = undefined;
          expect(PartnerService.helpers.isServiceNotLicensed(services.sparkBoard)).toBe(false);
        });
      });
    });
  });
});
