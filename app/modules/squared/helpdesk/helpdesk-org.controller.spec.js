'use strict';

describe('Controller: HelpdeskOrgController', function () {
  beforeEach(angular.mock.module('Squared'));

  var Authinfo, q, $stateParams, HelpdeskService, LicenseService, $controller, $translate, $scope, orgController, Config, FeatureToggleService, HelpdeskHuronService, Notification, Orgservice;

  beforeEach(inject(function (_$controller_, _$q_, _$rootScope_, _$stateParams_, _$translate_, _Authinfo_, _Config_, _FeatureToggleService_, _HelpdeskHuronService_, _HelpdeskService_, _LicenseService_, _Notification_, _Orgservice_) {
    HelpdeskService = _HelpdeskService_;
    FeatureToggleService = _FeatureToggleService_;
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    Config = _Config_;
    $stateParams = _$stateParams_;
    q = _$q_;
    LicenseService = _LicenseService_;
    $translate = _$translate_;
    Authinfo = _Authinfo_;
    HelpdeskHuronService = _HelpdeskHuronService_;
    Notification = _Notification_;
    Orgservice = _Orgservice_;
  }));

  describe('Org controller', function () {
    // Missing a lot of tests here !!!
  });

  describe('Org controller trials', function () {
    beforeEach(function () {
      $stateParams.id = 'whatever';

      orgController = $controller('HelpdeskOrgController', {
        HelpdeskService: HelpdeskService,
        $translate: $translate,
        $scope: $scope,
        LicenseService: LicenseService,
        Config: Config,
        $stateParams: $stateParams,
      });
    });

    it('is trials if isEFT is true in org settings', function () {
      var orgSetting = {
        isEFT: true,
      };
      var orgSettings = [JSON.stringify(orgSetting)];
      expect(orgController.isTrials(orgSettings)).toBeTruthy();
    });

    it('is not trials if isEFT is false in org settings', function () {
      var orgSetting = {
        isEFT: false,
      };
      var orgSettings = [JSON.stringify(orgSetting)];
      expect(orgController.isTrials(orgSettings)).toBeFalsy();
    });

    it('is not defined as trials if no org settings available', function () {
      var orgSettings = undefined;
      expect(orgController.isTrials(orgSettings)).toBeFalsy();
    });
  });

  describe('Org controller error notification', function () {
    beforeEach(function () {
      spyOn(FeatureToggleService, 'supports').and.returnValue(q.resolve(false));
    });

    it('call errorResponse and supply the response data when promise is rejected', function () {
      spyOn(Notification, 'errorResponse');
      spyOn(HelpdeskService, 'getOrg');
      var rejectData = {
        data: {
          errorCode: 420000,
        },
      };
      var promise = q.reject(rejectData);
      HelpdeskService.getOrg.and.returnValue(promise);
      $scope.$apply();

      orgController = $controller('HelpdeskOrgController', {
        HelpdeskService: HelpdeskService,
        $scope: $scope,
        Notification: Notification,
      });
      $scope.$apply();
      expect(Notification.errorResponse).toHaveBeenCalled();
      expect(Notification.errorResponse).toHaveBeenCalledWith(rejectData, 'helpdesk.unexpectedError');
    });
  });

  describe('read only access', function () {
    beforeEach(function () {
      spyOn(HelpdeskService, 'usersWithRole').and.returnValue(q.resolve({}));
      spyOn(HelpdeskService, 'getServiceOrders').and.returnValue(q.resolve([{}]));
      spyOn(LicenseService, 'getLicensesInOrg').and.returnValue(q.resolve({}));
      spyOn(HelpdeskHuronService, 'getOrgSiteInfo').and.returnValue(q.resolve([{}]));
      spyOn(HelpdeskHuronService, 'getTenantInfo').and.returnValue(q.resolve({}));

      spyOn(Authinfo, 'getOrgId');
      Authinfo.getOrgId.and.returnValue('ce8d17f8-1734-4a54-8510-fae65acc505e');

      spyOn(HelpdeskService, 'getOrgDisplayName').and.returnValue(q.resolve('Marvel'));
      spyOn(FeatureToggleService, 'supports').and.returnValue(q.resolve(false));
    });

    it('sets cardsAvailable and adminUsersAvailable to true when data has been collected', function () {
      spyOn(HelpdeskService, 'getOrg');
      HelpdeskService.getOrg.and.returnValue(q.resolve({
        id: 'whatever',
        displayName: 'Marvel',
        managedBy: [{
          orgId: 'ce8d17f8-1734-4a54-8510-fae65acc505e',
        }],
        orgSettings: ['{"isEFT":true, "allowReadOnlyAccess": true}'],
      }));

      orgController = $controller('HelpdeskOrgController', {
        HelpdeskService: HelpdeskService,
        FeatureToggleService: FeatureToggleService,
        $translate: $translate,
        $scope: $scope,
        LicenseService: LicenseService,
        Config: Config,
        $stateParams: $stateParams,
        Authinfo: Authinfo,
      });
      expect(orgController.cardsAvailable).toBeFalsy();
      expect(orgController.adminUsersAvailable).toBeFalsy();
      $scope.$apply();
      expect(orgController.cardsAvailable).toBeTruthy();
      expect(orgController.adminUsersAvailable).toBeTruthy();
    });

    it('call card elements should be equal to data from Site and Tenant API calls', function () {
      spyOn(HelpdeskService, 'getOrg');
      var deferredOrgLookupResult = q.defer();
      deferredOrgLookupResult.resolve({
        id: 'whatever',
        displayName: 'Marvel',
        managedBy: [{
          orgId: 'ce8d17f8-1734-4a54-8510-fae65acc505e',
        }],
        orgSettings: ['{"isEFT":true, "allowReadOnlyAccess": true}'],
      });
      HelpdeskService.getOrg.and.returnValue(deferredOrgLookupResult.promise);

      FeatureToggleService.supports.and.returnValue(q.resolve(true));

      var deferredSiteInfoResult = q.defer();
      deferredSiteInfoResult.resolve({
        steeringDigit: '7',
        siteSteeringDigit: '4',
        siteCode: '100',
        mediaTraversalMode: 'TURNOnly',
        uuid: '7b9ad03e-8c78-4ffa-8680-df50664bcce4',
      });
      HelpdeskHuronService.getOrgSiteInfo.and.returnValue(deferredSiteInfoResult.promise);

      var deferredTenantInfoResult = q.defer();
      deferredTenantInfoResult.resolve({
        name: 'SomeTestCustomer',
        regionCode: '940',
        uuid: '7b9ad03e-8c78-4ffa-8680-df50664bcce4',
      });
      HelpdeskHuronService.getTenantInfo.and.returnValue(deferredTenantInfoResult.promise);

      orgController = $controller('HelpdeskOrgController', {
        HelpdeskService: HelpdeskService,
        FeatureToggleService: FeatureToggleService,
        $translate: $translate,
        $scope: $scope,
        LicenseService: LicenseService,
        Config: Config,
        $stateParams: $stateParams,
        Authinfo: Authinfo,
      });
      $scope.$apply();
      expect(orgController.callCard.voiceMailPrefix).toBe('4100');
      expect(orgController.callCard.outboundDialDigit).toBe('7');
      expect(orgController.callCard.dialing).toEqual('helpdesk.dialingPlan.local');
    });

    it('call card elements should be equal to data from Site and Tenant API calls', function () {
      spyOn(HelpdeskService, 'getOrg');
      var deferredOrgLookupResult = q.defer();
      deferredOrgLookupResult.resolve({
        id: 'whatever',
        displayName: 'Marvel',
        managedBy: [{
          orgId: 'ce8d17f8-1734-4a54-8510-fae65acc505e',
        }],
        orgSettings: ['{"isEFT":true, "allowReadOnlyAccess": true}'],
      });
      HelpdeskService.getOrg.and.returnValue(deferredOrgLookupResult.promise);

      FeatureToggleService.supports.and.returnValue(q.resolve(true));

      var deferredSiteInfoResult = q.defer();
      deferredSiteInfoResult.resolve({
        steeringDigit: '7',
        siteSteeringDigit: '4',
        siteCode: '100',
      });
      HelpdeskHuronService.getOrgSiteInfo.and.returnValue(deferredSiteInfoResult.promise);

      var deferredTenantInfoResult = q.defer();
      deferredTenantInfoResult.resolve({
        name: 'SomeTestCustomer',
        regionCode: '',
      });
      HelpdeskHuronService.getTenantInfo.and.returnValue(deferredTenantInfoResult.promise);

      orgController = $controller('HelpdeskOrgController', {
        HelpdeskService: HelpdeskService,
        FeatureToggleService: FeatureToggleService,
        $translate: $translate,
        $scope: $scope,
        LicenseService: LicenseService,
        Config: Config,
        $stateParams: $stateParams,
        Authinfo: Authinfo,
      });
      $scope.$apply();
      expect(orgController.callCard.voiceMailPrefix).toBe('4100');
      expect(orgController.callCard.outboundDialDigit).toBe('7');
      expect(orgController.callCard.dialing).toEqual('helpdesk.dialingPlan.national');
    });

    it('extended information feature toggle is default false', function () {
      spyOn(HelpdeskService, 'getOrg');
      var deferredOrgLookupResult = q.defer();
      deferredOrgLookupResult.resolve({
        id: 'whatever',
        displayName: 'Marvel',
        managedBy: [{
          orgId: 'ce8d17f8-1734-4a54-8510-fae65acc505e',
        }],
        orgSettings: ['{"isEFT":true, "allowReadOnlyAccess": true}'],
      });
      HelpdeskService.getOrg.and.returnValue(deferredOrgLookupResult.promise);

      orgController = $controller('HelpdeskOrgController', {
        HelpdeskService: HelpdeskService,
        FeatureToggleService: FeatureToggleService,
        $translate: $translate,
        $scope: $scope,
        LicenseService: LicenseService,
        Config: Config,
        $stateParams: $stateParams,
        Authinfo: Authinfo,
      });
      $scope.$apply();
      expect(orgController.supportsExtendedInformation).toBeFalsy();
    });

    it('extended information feature toggle is true when toggle is active from service', function () {
      spyOn(HelpdeskService, 'getOrg');
      var deferredOrgLookupResult = q.defer();
      deferredOrgLookupResult.resolve({
        id: 'whatever',
        displayName: 'Marvel',
        managedBy: [{
          orgId: 'ce8d17f8-1734-4a54-8510-fae65acc505e',
        }],
        orgSettings: ['{"isEFT":true, "allowReadOnlyAccess": true}'],
      });
      HelpdeskService.getOrg.and.returnValue(deferredOrgLookupResult.promise);

      FeatureToggleService.supports.and.returnValue(q.resolve(true));

      orgController = $controller('HelpdeskOrgController', {
        HelpdeskService: HelpdeskService,
        FeatureToggleService: FeatureToggleService,
        $translate: $translate,
        $scope: $scope,
        LicenseService: LicenseService,
        Config: Config,
        $stateParams: $stateParams,
        Authinfo: Authinfo,
      });
      $scope.$apply();
      expect(orgController.supportsExtendedInformation).toBeTruthy();
    });

    it('allow read only access for marvel partners', function () {
      spyOn(HelpdeskService, 'getOrg');
      var deferredOrgLookupResult = q.defer();
      deferredOrgLookupResult.resolve({
        id: 'whatever',
        displayName: 'Marvel',
        managedBy: [{
          orgId: 'ce8d17f8-1734-4a54-8510-fae65acc505e',
        }],
        orgSettings: ['{"isEFT":true, "allowReadOnlyAccess": true}'],
      });
      HelpdeskService.getOrg.and.returnValue(deferredOrgLookupResult.promise);

      orgController = $controller('HelpdeskOrgController', {
        HelpdeskService: HelpdeskService,
        $translate: $translate,
        $scope: $scope,
        LicenseService: LicenseService,
        Config: Config,
        $stateParams: $stateParams,
        Authinfo: Authinfo,
      });
      $scope.$apply();
      expect(orgController.allowLaunchAtlas).toBeTruthy();
    });

    it('dont allow read only access for marvel partners', function () {
      spyOn(HelpdeskService, 'getOrg');
      var deferredOrgLookupResult = q.defer();
      deferredOrgLookupResult.resolve({
        id: 'whatever',
        displayName: 'Marvel',
        managedBy: [{
          orgId: 'ce8d17f8-1734-4a54-8510-fae65acc505e',
        }],
        orgSettings: ['{"isEFT":true, "allowReadOnlyAccess": false}'],
      });
      HelpdeskService.getOrg.and.returnValue(deferredOrgLookupResult.promise);

      orgController = $controller('HelpdeskOrgController', {
        HelpdeskService: HelpdeskService,
        $translate: $translate,
        $scope: $scope,
        LicenseService: LicenseService,
        Config: Config,
        $stateParams: $stateParams,
      });
      $scope.$apply();
      expect(orgController.allowLaunchAtlas).toBeFalsy();
    });

    it('allow read only access for arkadin partners', function () {
      spyOn(HelpdeskService, 'getOrg');
      var deferredOrgLookupResult = q.defer();
      deferredOrgLookupResult.resolve({
        id: 'whatever',
        displayName: 'Marvel',
        managedBy: [{
          orgId: 'd5235404-6637-4050-9978-e3d0f4338c36',
        }],
        orgSettings: ['{"isEFT":true, "allowReadOnlyAccess": true}'],
      });
      HelpdeskService.getOrg.and.returnValue(deferredOrgLookupResult.promise);

      orgController = $controller('HelpdeskOrgController', {
        HelpdeskService: HelpdeskService,
        $translate: $translate,
        $scope: $scope,
        LicenseService: LicenseService,
        Config: Config,
        $stateParams: $stateParams,
        Authinfo: Authinfo,
      });
      $scope.$apply();
      expect(orgController.allowLaunchAtlas).toBeTruthy();
    });

    it('dont allow read only access for arkadin partners', function () {
      spyOn(HelpdeskService, 'getOrg');
      var deferredOrgLookupResult = q.defer();
      deferredOrgLookupResult.resolve({
        id: 'whatever',
        displayName: 'Marvel',
        managedBy: [{
          orgId: 'd5235404-6637-4050-9978-e3d0f4338c36',
        }],
        orgSettings: ['{"isEFT":true, "allowReadOnlyAccess": false}'],
      });
      HelpdeskService.getOrg.and.returnValue(deferredOrgLookupResult.promise);

      orgController = $controller('HelpdeskOrgController', {
        HelpdeskService: HelpdeskService,
        $translate: $translate,
        $scope: $scope,
        LicenseService: LicenseService,
        Config: Config,
        $stateParams: $stateParams,
      });
      $scope.$apply();
      expect(orgController.allowLaunchAtlas).toBeFalsy();
    });
  });

  describe('service Order System', function () {
    beforeEach(function () {
      spyOn(HelpdeskService, 'usersWithRole').and.returnValue(q.resolve({}));
      spyOn(LicenseService, 'getLicensesInOrg').and.returnValue(q.resolve({}));
      spyOn(Authinfo, 'getOrgId');
      Authinfo.getOrgId.and.returnValue('ce8d17f8-1734-4a54-8510-fae65acc505e');
      spyOn(HelpdeskService, 'getOrgDisplayName').and.returnValue(q.resolve('Marvel'));
      spyOn(FeatureToggleService, 'supports').and.returnValue(q.resolve(false));
      spyOn(HelpdeskHuronService, 'getOrgSiteInfo').and.returnValue(q.resolve({}));
      spyOn(HelpdeskHuronService, 'getTenantInfo').and.returnValue(q.resolve({}));

      spyOn(HelpdeskService, 'getOrg');
      HelpdeskService.getOrg.and.returnValue(q.resolve({
        id: 'whatever',
        displayName: 'Marvel',
        managedBy: [{
          orgId: 'ce8d17f8-1734-4a54-8510-fae65acc505e',
        }],
        orgSettings: ['{}'],
      }));

      orgController = $controller('HelpdeskOrgController', {
        HelpdeskService: HelpdeskService,
        $translate: $translate,
        $scope: $scope,
        LicenseService: LicenseService,
        Config: Config,
        $stateParams: $stateParams,
      });
    });

    it('shows name based on one known orderingTool code', function () {
      spyOn(HelpdeskService, 'getServiceOrders').and.returnValue(q.resolve([{ orderingTool: 'APP_DIRECT' }, { orderingTool: 'Ibm' }]));
      $scope.$apply();
      orgController.findServiceOrders('12345');
      expect(orgController.orderSystems.length).toBe(1);
      expect(orgController.orderSystems).toEqual(['Partner Marketplace']);
    });

    it('shows names based on four known orderingTool codes', function () {
      spyOn(HelpdeskService, 'getServiceOrders').and.returnValue(q.resolve([{ orderingTool: 'DIGITAL_RIVER' }, { orderingTool: 'CCW' }, { orderingTool: 'CCW_CSB' }, { orderingTool: 'ATLAS_SITE_MGMT' }, { orderingTool: 'CCW_CDC' }]));
      $scope.$apply();
      orgController.findServiceOrders('12345');
      expect(orgController.orderSystems.length).toBe(3);
      expect(orgController.orderSystems).toEqual(['Cisco Online Marketplace', 'Cisco Commerce', 'CCE']);
    });

    it('shows actual value from service order if unknown orderingTool code', function () {
      spyOn(HelpdeskService, 'getServiceOrders').and.returnValue(q.resolve([{ orderingTool: 'ABCD' }]));
      $scope.$apply();
      orgController.findServiceOrders('12345');
      expect(orgController.orderSystems.length).toBe(1);
      expect(orgController.orderSystems).toEqual(['ABCD']);
    });

    it('shows empty if empty orderingTool list', function () {
      spyOn(HelpdeskService, 'getServiceOrders').and.returnValue(q.resolve([{}]));
      $scope.$apply();
      orgController.findServiceOrders('12345');
      expect(orgController.orderSystems).toEqual([undefined]);
    });
  });

  describe('Edit Org Name', function () {
    beforeEach(function () {
      installPromiseMatchers();

      spyOn(Orgservice, 'validateDisplayName');
      // we don't care about init logic
      spyOn(HelpdeskService, 'getOrg').and.returnValue(q.reject());
      spyOn(FeatureToggleService, 'supports').and.returnValue(q.reject());

      $stateParams.id = 'whatever';
      orgController = $controller('HelpdeskOrgController', {
        $scope: $scope,
        $stateParams: $stateParams,
      });
    });

    it('should resolve validators if validateDisplayName resolves true', function () {
      Orgservice.validateDisplayName.and.returnValue(q.resolve(true));

      var validationPromises = {};
      _.forEach(orgController.editOrgAsyncValidators, function (validator, key) {
        validationPromises[key] = validator();
      });
      $scope.$apply();

      expect(validationPromises.failure).toBeResolved();
      expect(validationPromises.duplicate).toBeResolved();
    });

    it('should reject duplicate validator if validateDisplayName resolves false', function () {
      Orgservice.validateDisplayName.and.returnValue(q.resolve(false));

      var validationPromises = {};
      _.forEach(orgController.editOrgAsyncValidators, function (validator, key) {
        validationPromises[key] = validator();
      });
      $scope.$apply();

      expect(validationPromises.failure).toBeResolved();
      expect(validationPromises.duplicate).toBeRejected();
    });

    it('should reject failure validator if validateDisplayName throws an error', function () {
      Orgservice.validateDisplayName.and.returnValue(q.reject());

      var validationPromises = {};
      _.forEach(orgController.editOrgAsyncValidators, function (validator, key) {
        validationPromises[key] = validator();
      });
      $scope.$apply();

      expect(validationPromises.failure).toBeRejected();
      expect(validationPromises.duplicate).toBeResolved();
    });
  });
});
