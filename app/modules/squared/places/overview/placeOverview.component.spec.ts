describe('placeOverview component', () => {
  let Authinfo, FeatureToggleService, CsdmCodeService, $httpBackend, UrlConfig,
    $state, $scope, $q, Userservice, ServiceDescriptorService, PlaceCallOverviewService, LocationsService;

  let $stateParams;
  let $componentController;
  let controller;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Squared'));

  beforeEach(inject((_$q_,
                     _Authinfo_,
                     _$httpBackend_,
                     _UrlConfig_,
                     _$state_,
                     _$stateParams_,
                     $rootScope,
                     _$componentController_,
                     _CsdmCodeService_,
                     _FeatureToggleService_,
                     _ServiceDescriptorService_,
                     _PlaceCallOverviewService_,
                     _LocationsService_,
                     _Userservice_) => {
    $q = _$q_;
    Authinfo = _Authinfo_;
    $httpBackend = _$httpBackend_;
    UrlConfig = _UrlConfig_;
    $state = _$state_;
    $stateParams = _$stateParams_;
    $componentController = _$componentController_;
    $scope = $rootScope.$new();
    CsdmCodeService = _CsdmCodeService_;
    FeatureToggleService = _FeatureToggleService_;
    Userservice = _Userservice_;
    ServiceDescriptorService = _ServiceDescriptorService_;
    PlaceCallOverviewService = _PlaceCallOverviewService_;
    LocationsService = _LocationsService_;
  }));

  const initController = (stateParams, scope, $state) => {
    return $componentController('placeOverview', {
      $stateParams: stateParams,
      $scope: scope,
      $state: $state,
      CsdmCodeService: CsdmCodeService,
    }, null);
  };

  describe('on init', () => {
    let showATA, showHybrid, deviceName, displayName, email, userCisUuid, placeCisUuid, orgId, PlaceCallOverviewData, siteLanguages, locationData;
    let adminFirstName, adminLastName, adminDisplayName, adminUserName, adminCisUuid, adminOrgId,
      goStateData;
    beforeEach(() => {

      showATA = true;
      showHybrid = true;
      deviceName = 'deviceName';
      displayName = 'displayName';
      email = 'email@address.com';
      userCisUuid = 'userCisUuid';
      placeCisUuid = 'placeCisUuid';
      orgId = 'orgId';
      adminFirstName = 'adminFirstName';
      adminLastName = 'adminLastName';
      adminDisplayName = 'adminDisplayName';
      adminUserName = 'adminUserName';
      adminCisUuid = 'adminCisUuid';
      adminOrgId = 'adminOrgId';
      PlaceCallOverviewData = {
        siteLevelPreferredLanguage: 'en_US',
        preferredLanguageOptions: ['de_DE', 'en_US'],
        placesPreferredLanguage: 'de_DE',
        defaultPreferredLanugage: 'de_DE',
        preferredLanguage: 'de_DE',
      };
      siteLanguages = ['de_DE', 'en_US'];
      locationData = [{
        uuid: '123',
        name: 'Home Office',
        routingPrefix: '8100',
        userCount: 10,
        placeCount: 3,
      }];

      spyOn(CsdmCodeService, 'createCodeForExisting').and.returnValue($q.resolve('0q9u09as09vu0a9sv'));
      spyOn(FeatureToggleService, 'csdmATAGetStatus').and.returnValue($q.resolve(showATA));
      spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));
      spyOn(FeatureToggleService, 'csdmPlaceGuiSettingsGetStatus').and.returnValue($q.resolve({}));
      spyOn(ServiceDescriptorService, 'getServices').and.returnValue($q.resolve([]));
      $httpBackend.whenGET(UrlConfig.getCsdmServiceUrl() + '/organization/' + orgId + '/upgradeChannels').respond(200);
      spyOn(Authinfo, 'getOrgId').and.returnValue(orgId);
      spyOn(Authinfo, 'getConferenceServicesWithoutSiteUrl').and.returnValue([]);
      spyOn(Authinfo, 'isSquaredUC').and.returnValue(false);
      Authinfo.displayName = displayName;
      spyOn(Authinfo, 'getUserId').and.returnValue(userCisUuid);
      spyOn(Authinfo, 'getPrimaryEmail').and.returnValue(email);
      spyOn(PlaceCallOverviewService, 'getPlaceCallOverviewData').and.returnValue($q.resolve(PlaceCallOverviewData));
      spyOn(PlaceCallOverviewService, 'getSiteLanguages').and.returnValue($q.resolve(siteLanguages));
      spyOn(LocationsService, 'getLocation').and.returnValue($q.resolve(locationData));
      const currentUser: any = {
        success: true,
        roles: ['ciscouc.devops', 'ciscouc.devsupport'],
        meta: { organizationID: adminOrgId },
        name: { givenName: adminFirstName, familyName: adminLastName },
        userName: adminUserName,
        displayName: adminDisplayName,
        id: adminCisUuid,
      };

      spyOn(Userservice, 'getUser').and.callFake((_, callback) => {
        callback(currentUser, 200);
      });
    });

    describe('with hybrid toggles', () => {
      it('for hybrid calendar it should return true that a feature is on', () => {
        spyOn(FeatureToggleService, 'csdmHybridCallGetStatus').and.returnValue($q.resolve(false));
        spyOn(FeatureToggleService, 'csdmPlaceCalendarGetStatus').and.returnValue($q.resolve(true));

        $stateParams = { currentPlace: { displayName: deviceName, type: 'cloudberry', cisUuid: 'sa0va9u02' } };
        controller = initController($stateParams, $scope, $state);

        controller.$onInit();
        $scope.$apply();

        expect(controller.anyHybridServiceToggle()).toBe(true);
      });

      it('for hybrid calendar it should return true that a feature is on', () => {
        spyOn(FeatureToggleService, 'csdmHybridCallGetStatus').and.returnValue($q.resolve(true));
        spyOn(FeatureToggleService, 'csdmPlaceCalendarGetStatus').and.returnValue($q.resolve(false));

        $stateParams = { currentPlace: { displayName: deviceName, type: 'cloudberry', cisUuid: 'sa0va9u02' } };
        controller = initController($stateParams, $scope, $state);

        controller.$onInit();
        $scope.$apply();

        expect(controller.anyHybridServiceToggle()).toBe(true);
      });

      it('off for hybrid call and calendar should return false that a feature is on', () => {
        spyOn(FeatureToggleService, 'csdmHybridCallGetStatus').and.returnValue($q.resolve(false));
        spyOn(FeatureToggleService, 'csdmPlaceCalendarGetStatus').and.returnValue($q.resolve(false));

        $stateParams = { currentPlace: { displayName: deviceName, type: 'cloudberry', cisUuid: 'sa0va9u02' } };
        controller = initController($stateParams, $scope, $state);

        controller.$onInit();
        $scope.$apply();

        expect(controller.anyHybridServiceToggle()).toBe(false);
      });
    });

    describe('and invoke onGenerateOtpFn', () => {
      beforeEach(() => {
        spyOn(FeatureToggleService, 'csdmHybridCallGetStatus').and.returnValue($q.resolve(showHybrid));
        spyOn(FeatureToggleService, 'csdmPlaceCalendarGetStatus').and.returnValue($q.resolve({}));

        spyOn($state, 'go').and.callFake((_stateName, stateData) => {
          goStateData = stateData;
        });

      });

      describe('with a cloudberry device', () => {

        beforeEach(() => {
          $stateParams = { currentPlace: { displayName: deviceName, type: 'cloudberry', cisUuid: placeCisUuid } };
          controller = initController($stateParams, $scope, $state);
          controller.showATA = showATA;
          controller.csdmHybridCallFeature = showHybrid;
        });

        it('should supply ShowActivationCodeCtrl with all the prerequisites', () => {
          controller.$onInit();
          controller.onGenerateOtpFn();
          $scope.$apply();

          expect($state.go).toHaveBeenCalled();
          expect(goStateData.wizard).toBeDefined();
          const wizardData = goStateData.wizard.state();
          expect(wizardData).toEqual(//jasmine.anything()
            {
              data: {
                function: 'showCode',
                showATA: true,
                csdmHybridCallFeature: true,
                csdmHybridCalendarFeature: false,
                hybridCalendarEnabledOnOrg: false,
                hybridCallEnabledOnOrg: false,
                admin: {
                  firstName: adminFirstName,
                  lastName: adminLastName,
                  displayName: adminDisplayName,
                  userName: adminUserName,
                  cisUuid: adminCisUuid,
                  organizationId: adminOrgId,
                },
                account: {
                  type: 'shared',
                  deviceType: 'cloudberry',
                  cisUuid: placeCisUuid,
                  name: deviceName,
                  organizationId: orgId,
                },
                recipient: { cisUuid: userCisUuid, organizationId: adminOrgId, displayName: adminDisplayName, email: email },
                title: 'addDeviceWizard.newCode',
              },
              history: jasmine.anything(),
              currentStateName: jasmine.anything(),
              wizardState: jasmine.anything(),

            },
          );
        });
      });

      describe('with a huron device', () => {

        beforeEach(() => {
          $stateParams = { currentPlace: { displayName: deviceName, type: 'huron', cisUuid: placeCisUuid } };
          controller = initController($stateParams, $scope, $state);
          controller.adminDisplayName = displayName;
          controller.showATA = showATA;
          controller.csdmHybridCallFeature = showHybrid;
        });

        it('should supply ShowActivationCodeCtrl with all the prerequisites', () => {
          controller.$onInit();
          controller.onGenerateOtpFn();
          $scope.$apply();

          expect($state.go).toHaveBeenCalled();
          expect(goStateData.wizard).toBeDefined();
          const wizardData = goStateData.wizard.state();
          expect(wizardData).toEqual(//jasmine.anything()
            {
              data: {
                function: 'showCode',
                showATA: true,
                csdmHybridCallFeature: showHybrid,
                csdmHybridCalendarFeature: false,
                hybridCalendarEnabledOnOrg: false,
                hybridCallEnabledOnOrg: false,
                admin: {
                  firstName: adminFirstName,
                  lastName: adminLastName,
                  displayName: adminDisplayName,
                  userName: adminUserName,
                  cisUuid: adminCisUuid,
                  organizationId: adminOrgId,
                },
                account: {
                  type: 'shared',
                  deviceType: 'huron',
                  cisUuid: placeCisUuid,
                  organizationId: orgId,
                  name: deviceName,
                },
                recipient: { cisUuid: userCisUuid, organizationId: adminOrgId, displayName: adminDisplayName, email: email },
                title: 'addDeviceWizard.newCode',
              },
              history: jasmine.anything(),
              currentStateName: jasmine.anything(),
              wizardState: jasmine.anything(),
            },
          );
        });
      });
    });
  });

  describe('invoke editCloudberryServices', () => {
    let goStateData;
    let showATA, showHybrid, deviceName, orgId, entitlements, placeUuid, siteLanguages, locationData;
    beforeEach(() => {
      showATA = true;
      showHybrid = true;
      deviceName = 'deviceName';
      orgId = 'orgId';
      entitlements = ['entitlement'];
      placeUuid = '9avs8y9q2v9aw98';
      siteLanguages = ['de_DE', 'en_US'];
      locationData = [{
        uuid: '123',
        name: 'Home Office',
        routingPrefix: '8100',
        userCount: 10,
        placeCount: 3,
      }];

      spyOn(FeatureToggleService, 'csdmATAGetStatus').and.returnValue($q.resolve(showATA));
      spyOn(FeatureToggleService, 'csdmHybridCallGetStatus').and.returnValue($q.resolve(showHybrid));
      spyOn(FeatureToggleService, 'csdmPlaceCalendarGetStatus').and.returnValue($q.resolve({}));
      spyOn(ServiceDescriptorService, 'getServices').and.returnValue($q.resolve([]));
      spyOn(PlaceCallOverviewService, 'getSiteLanguages').and.returnValue($q.resolve(siteLanguages));
      spyOn(LocationsService, 'getLocation').and.returnValue($q.resolve(locationData));
      $httpBackend.whenGET('https://cmi.huron-int.com/api/v1/voice/customers/sites').respond([]);
      $httpBackend.whenGET('https://cmi.huron-int.com/api/v2/customers/places/9avs8y9q2v9aw98').respond([]);

      const currentUser: any = {
        success: true,
        roles: ['ciscouc.devops', 'ciscouc.devsupport'],
        meta: { organizationID: orgId },
      };

      spyOn(Userservice, 'getUser').and.callFake((uid, callback) => {
        currentUser.id = uid;
        callback(currentUser, 200);
      });
      spyOn($state, 'go').and.callFake((_stateName, stateData) => {
        goStateData = stateData;
      });
      $httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond(200);
      $httpBackend.whenGET(UrlConfig.getCsdmServiceUrl() + '/organization/null/upgradeChannels').respond(200);

      $stateParams = {
        currentPlace: {
          displayName: deviceName,
          type: 'cloudberry',
          cisUuid: placeUuid,
          entitlements: entitlements,
        },
      };
      controller = initController($stateParams, $scope, $state);
    });

    it('should supply addDeviceFlow.editCloudberryServices with all the prereq', () => {
      controller.$onInit();
      controller.editCloudberryServices();
      $scope.$apply();

      expect($state.go).toHaveBeenCalled();
      expect(goStateData.wizard).toBeDefined();
      const wizardData = goStateData.wizard.state();
      expect(wizardData).toEqual(
        {
          data: {
            function: 'editServices',
            title: 'usersPreview.editServices',
            csdmHybridCallFeature: false,
            csdmHybridCalendarFeature: false,
            hybridCalendarEnabledOnOrg: false,
            hybridCallEnabledOnOrg: false,
            account: {
              deviceType: 'cloudberry',
              type: 'shared',
              name: deviceName,
              cisUuid: placeUuid,
              entitlements: jasmine.anything(),
              externalLinkedAccounts: undefined,
            },
          },
          history: jasmine.anything(),
          currentStateName: jasmine.anything(),
          wizardState: jasmine.anything(),
        },
      );
    });
  });
});
