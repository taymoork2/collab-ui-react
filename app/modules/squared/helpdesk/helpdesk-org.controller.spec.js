'use strict';
describe('Controller: HelpdeskOrgController', function () {
  beforeEach(angular.mock.module('Squared'));

  var Authinfo, q, XhrNotificationService, $stateParams, HelpdeskService, LicenseService, $controller, $translate, $scope, orgController, Config, FeatureToggleService;

  beforeEach(inject(function (_Authinfo_, _LicenseService_, _$q_, _XhrNotificationService_, _$stateParams_, _$translate_, _$rootScope_, _HelpdeskService_, _$controller_, _Config_, _FeatureToggleService_) {
    HelpdeskService = _HelpdeskService_;
    FeatureToggleService = _FeatureToggleService_;
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    Config = _Config_;
    $stateParams = _$stateParams_;
    XhrNotificationService = _XhrNotificationService_;
    q = _$q_;
    LicenseService = _LicenseService_;
    $translate = _$translate_;
    Authinfo = _Authinfo_;
  }));

  describe('Org controller', function () {
    // Missing alot of tests here !!!
  });

  describe('Org controller trials', function () {

    beforeEach(function () {

      $stateParams.id = "whatever";

      orgController = $controller('HelpdeskOrgController', {
        HelpdeskService: HelpdeskService,
        $translate: $translate,
        $scope: $scope,
        LicenseService: LicenseService,
        Config: Config,
        $stateParams: $stateParams,
        XhrNotificationService: XhrNotificationService
      });
    });

    it('is trials if isEFT is true in org settings', function () {
      var orgSetting = {
        isEFT: true
      };
      var orgSettings = [JSON.stringify(orgSetting)];
      expect(orgController.isTrials(orgSettings)).toBeTruthy();
    });

    it('is not trials if isEFT is false in org settings', function () {
      var orgSetting = {
        isEFT: false
      };
      var orgSettings = [JSON.stringify(orgSetting)];
      expect(orgController.isTrials(orgSettings)).toBeFalsy();
    });

    it('is not defined as trials if no org settings available', function () {
      var orgSettings = undefined;
      expect(orgController.isTrials(orgSettings)).toBeFalsy();
    });

  });

  describe('read only access', function () {
    beforeEach(function () {
      sinon.stub(HelpdeskService, 'usersWithRole').returns(q.resolve({}));
      sinon.stub(HelpdeskService, 'getServiceOrder').returns(q.resolve({}));
      sinon.stub(LicenseService, 'getLicensesInOrg').returns(q.resolve({}));

      sinon.stub(Authinfo, 'getOrgId');
      Authinfo.getOrgId.returns("ce8d17f8-1734-4a54-8510-fae65acc505e");

      sinon.stub(HelpdeskService, 'getOrgDisplayName').returns(q.resolve("Marvel"));
      sinon.stub(FeatureToggleService, 'supports').returns(q.resolve(false));

    });

    it('sets cardsAvailable and adminUsersAvailable to true when data has been collected', function () {
      sinon.stub(HelpdeskService, 'getOrg');
      HelpdeskService.getOrg.returns(q.resolve({
        "id": "whatever",
        "displayName": "Marvel",
        "managedBy": [{
          "orgId": "ce8d17f8-1734-4a54-8510-fae65acc505e"
        }],
        "orgSettings": ['{"isEFT":true, "allowReadOnlyAccess": true}']
      }));

      orgController = $controller('HelpdeskOrgController', {
        HelpdeskService: HelpdeskService,
        FeatureToggleService: FeatureToggleService,
        $translate: $translate,
        $scope: $scope,
        LicenseService: LicenseService,
        Config: Config,
        $stateParams: $stateParams,
        XhrNotificationService: XhrNotificationService,
        Authinfo: Authinfo
      });
      expect(orgController.cardsAvailable).toBeFalsy();
      expect(orgController.adminUsersAvailable).toBeFalsy();
      $scope.$apply();
      expect(orgController.cardsAvailable).toBeTruthy();
      expect(orgController.adminUsersAvailable).toBeTruthy();
    });

    it('extended information feature toggle is default false', function () {
      sinon.stub(HelpdeskService, 'getOrg');
      var deferredOrgLookupResult = q.defer();
      deferredOrgLookupResult.resolve({
        "id": "whatever",
        "displayName": "Marvel",
        "managedBy": [{
          "orgId": "ce8d17f8-1734-4a54-8510-fae65acc505e"
        }],
        "orgSettings": ['{"isEFT":true, "allowReadOnlyAccess": true}']
      });
      HelpdeskService.getOrg.returns(deferredOrgLookupResult.promise);

      orgController = $controller('HelpdeskOrgController', {
        HelpdeskService: HelpdeskService,
        FeatureToggleService: FeatureToggleService,
        $translate: $translate,
        $scope: $scope,
        LicenseService: LicenseService,
        Config: Config,
        $stateParams: $stateParams,
        XhrNotificationService: XhrNotificationService,
        Authinfo: Authinfo
      });
      $scope.$apply();
      expect(orgController.supportsExtendedInformation).toBeFalsy();
    });

    it('extended information feature toggle is true when toggle is active from service', function () {
      sinon.stub(HelpdeskService, 'getOrg');
      var deferredOrgLookupResult = q.defer();
      deferredOrgLookupResult.resolve({
        "id": "whatever",
        "displayName": "Marvel",
        "managedBy": [{
          "orgId": "ce8d17f8-1734-4a54-8510-fae65acc505e"
        }],
        "orgSettings": ['{"isEFT":true, "allowReadOnlyAccess": true}']
      });
      HelpdeskService.getOrg.returns(deferredOrgLookupResult.promise);

      sinon.restore(FeatureToggleService, 'supports');
      sinon.stub(FeatureToggleService, 'supports').returns(q.resolve(true));

      orgController = $controller('HelpdeskOrgController', {
        HelpdeskService: HelpdeskService,
        FeatureToggleService: FeatureToggleService,
        $translate: $translate,
        $scope: $scope,
        LicenseService: LicenseService,
        Config: Config,
        $stateParams: $stateParams,
        XhrNotificationService: XhrNotificationService,
        Authinfo: Authinfo
      });
      $scope.$apply();
      expect(orgController.supportsExtendedInformation).toBeTruthy();
    });

    it('allow read only access for marvel partners', function () {
      sinon.stub(HelpdeskService, 'getOrg');
      var deferredOrgLookupResult = q.defer();
      deferredOrgLookupResult.resolve({
        "id": "whatever",
        "displayName": "Marvel",
        "managedBy": [{
          "orgId": "ce8d17f8-1734-4a54-8510-fae65acc505e"
        }],
        "orgSettings": ['{"isEFT":true, "allowReadOnlyAccess": true}']
      });
      HelpdeskService.getOrg.returns(deferredOrgLookupResult.promise);

      orgController = $controller('HelpdeskOrgController', {
        HelpdeskService: HelpdeskService,
        $translate: $translate,
        $scope: $scope,
        LicenseService: LicenseService,
        Config: Config,
        $stateParams: $stateParams,
        XhrNotificationService: XhrNotificationService,
        Authinfo: Authinfo
      });
      $scope.$apply();
      expect(orgController.allowLaunchAtlas).toBeTruthy();
    });

    it('dont allow read only access for marvel partners', function () {
      sinon.stub(HelpdeskService, 'getOrg');
      var deferredOrgLookupResult = q.defer();
      deferredOrgLookupResult.resolve({
        "id": "whatever",
        "displayName": "Marvel",
        "managedBy": [{
          "orgId": "ce8d17f8-1734-4a54-8510-fae65acc505e"
        }],
        "orgSettings": ['{"isEFT":true, "allowReadOnlyAccess": false}']
      });
      HelpdeskService.getOrg.returns(deferredOrgLookupResult.promise);

      orgController = $controller('HelpdeskOrgController', {
        HelpdeskService: HelpdeskService,
        $translate: $translate,
        $scope: $scope,
        LicenseService: LicenseService,
        Config: Config,
        $stateParams: $stateParams,
        XhrNotificationService: XhrNotificationService
      });
      $scope.$apply();
      expect(orgController.allowLaunchAtlas).toBeFalsy();
    });

    it('allow read only access for arkadin partners', function () {
      sinon.stub(HelpdeskService, 'getOrg');
      var deferredOrgLookupResult = q.defer();
      deferredOrgLookupResult.resolve({
        "id": "whatever",
        "displayName": "Marvel",
        "managedBy": [{
          "orgId": "d5235404-6637-4050-9978-e3d0f4338c36"
        }],
        "orgSettings": ['{"isEFT":true, "allowReadOnlyAccess": true}']
      });
      HelpdeskService.getOrg.returns(deferredOrgLookupResult.promise);

      orgController = $controller('HelpdeskOrgController', {
        HelpdeskService: HelpdeskService,
        $translate: $translate,
        $scope: $scope,
        LicenseService: LicenseService,
        Config: Config,
        $stateParams: $stateParams,
        XhrNotificationService: XhrNotificationService,
        Authinfo: Authinfo
      });
      $scope.$apply();
      expect(orgController.allowLaunchAtlas).toBeTruthy();
    });

    it('dont allow read only access for arkadin partners', function () {
      sinon.stub(HelpdeskService, 'getOrg');
      var deferredOrgLookupResult = q.defer();
      deferredOrgLookupResult.resolve({
        "id": "whatever",
        "displayName": "Marvel",
        "managedBy": [{
          "orgId": "d5235404-6637-4050-9978-e3d0f4338c36"
        }],
        "orgSettings": ['{"isEFT":true, "allowReadOnlyAccess": false}']
      });
      HelpdeskService.getOrg.returns(deferredOrgLookupResult.promise);

      orgController = $controller('HelpdeskOrgController', {
        HelpdeskService: HelpdeskService,
        $translate: $translate,
        $scope: $scope,
        LicenseService: LicenseService,
        Config: Config,
        $stateParams: $stateParams,
        XhrNotificationService: XhrNotificationService
      });
      $scope.$apply();
      expect(orgController.allowLaunchAtlas).toBeFalsy();
    });

  });

  describe('service Order System', function () {
    beforeEach(function () {
      sinon.stub(HelpdeskService, 'usersWithRole').returns(q.resolve({}));
      sinon.stub(LicenseService, 'getLicensesInOrg').returns(q.resolve({}));
      sinon.stub(Authinfo, 'getOrgId');
      Authinfo.getOrgId.returns("ce8d17f8-1734-4a54-8510-fae65acc505e");
      sinon.stub(HelpdeskService, 'getOrgDisplayName').returns(q.resolve("Marvel"));
      sinon.stub(FeatureToggleService, 'supports').returns(q.resolve(false));
      sinon.stub(HelpdeskService, 'getOrg');
      HelpdeskService.getOrg.returns(q.resolve({
        "id": "whatever",
        "displayName": "Marvel",
        "managedBy": [{
          "orgId": "ce8d17f8-1734-4a54-8510-fae65acc505e"
        }],
        "orgSettings": ['{}']
      }));

      orgController = $controller('HelpdeskOrgController', {
        HelpdeskService: HelpdeskService,
        $translate: $translate,
        $scope: $scope,
        LicenseService: LicenseService,
        Config: Config,
        $stateParams: $stateParams,
        XhrNotificationService: XhrNotificationService
      });

    });

    it('shows name based on known orderingTool code', function () {
      sinon.stub(HelpdeskService, 'getServiceOrder').returns(q.resolve({ "orderingTool": "APP_DIRECT" }));
      $scope.$apply();
      orgController.findServiceOrder("12345");
      expect(orgController.orderSystem).toBe("Telstra AppDirect Marketplace(TAM)");
    });

    it('shows service order key directly if unknown orderingTool code', function () {
      sinon.stub(HelpdeskService, 'getServiceOrder').returns(q.resolve({ "orderingTool": "ABCD" }));
      $scope.$apply();
      orgController.findServiceOrder("12345");
      expect(orgController.orderSystem).toBe("ABCD");
    });

    it('shows empty if empty orderingTool code', function () {
      sinon.stub(HelpdeskService, 'getServiceOrder').returns(q.resolve({ "orderingTool": "" }));
      $scope.$apply();
      orgController.findServiceOrder("12345");
      expect(orgController.orderSystem).toBe("");
    });
  });

});
