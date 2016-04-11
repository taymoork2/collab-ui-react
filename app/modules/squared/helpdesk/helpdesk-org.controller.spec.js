'use strict';
describe('Controller: HelpdeskOrgController', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var XhrNotificationService, $stateParams, HelpdeskService, LicenseService, $controller, $translate, $scope, orgController, Config;

  beforeEach(inject(function (_XhrNotificationService_, _$stateParams_, _$translate_, _$rootScope_, _HelpdeskService_, _$controller_, _Config_) {
    HelpdeskService = _HelpdeskService_;
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    Config = _Config_;
    $stateParams = _$stateParams_;
    XhrNotificationService = _XhrNotificationService_;
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

});
