'use strict';
describe('Controller: HelpdeskOrgController', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var Authinfo, httpBackend, q, XhrNotificationService, $stateParams, HelpdeskService, LicenseService, $controller, $translate, $scope, orgController, Config;

  beforeEach(inject(function (_Authinfo_, _LicenseService_, _$q_, $httpBackend, _XhrNotificationService_, _$stateParams_, _$translate_, _$rootScope_, _HelpdeskService_, _$controller_, _Config_) {
    HelpdeskService = _HelpdeskService_;
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    Config = _Config_;
    $stateParams = _$stateParams_;
    XhrNotificationService = _XhrNotificationService_;
    q = _$q_;
    httpBackend = $httpBackend;
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
      sinon.stub(HelpdeskService, 'usersWithRole');
      var deferredUsersWithRoleResult = q.defer();
      deferredUsersWithRoleResult.resolve({});
      HelpdeskService.usersWithRole.returns(deferredUsersWithRoleResult.promise);

      sinon.stub(LicenseService, 'getLicensesInOrg');
      var deferredLicensesResult = q.defer();
      deferredLicensesResult.resolve({});
      LicenseService.getLicensesInOrg.returns(deferredLicensesResult.promise);

      sinon.stub(Authinfo, 'getOrgId');
      Authinfo.getOrgId.returns("ce8d17f8-1734-4a54-8510-fae65acc505e");

      sinon.stub(HelpdeskService, 'getOrgDisplayName');
      var deferredDisplayName = q.defer();
      deferredDisplayName.resolve("Marvel");
      HelpdeskService.getOrgDisplayName.returns(deferredDisplayName.promise);

      httpBackend
        .when('GET', 'l10n/en_US.json')
        .respond({});
    });

    afterEach(function () {
      httpBackend.verifyNoOutstandingExpectation();
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
      httpBackend.flush();
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
      httpBackend.flush();
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
      httpBackend.flush();
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
      httpBackend.flush();
      expect(orgController.allowLaunchAtlas).toBeFalsy();
    });

  });

});