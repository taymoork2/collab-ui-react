'use strict';

describe('Controller: EnterpriseSettingsCtrl', function () {
  var $scope, $controller, $q, Orgservice, Notification, ServiceSetup, FeatureToggleService;
  var orgServiceJSONFixture = getJSONFixture('core/json/organizations/Orgservice.json');
  var getOrgStatus = 200;
  var rootScope;

  var authInfo = {
    getOrgId: sinon.stub().returns('bcd7afcd-839d-4c61-a7a8-31c6c7f016d7'),
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(installPromiseMatchers);

  beforeEach(inject(function ($rootScope, _$controller_, _$q_, _Notification_, _Orgservice_, _ServiceSetup_, _FeatureToggleService_) {
    $scope = $rootScope.$new();
    rootScope = $rootScope;
    $controller = _$controller_;
    $q = _$q_;
    Orgservice = _Orgservice_;
    Notification = _Notification_;
    ServiceSetup = _ServiceSetup_;
    FeatureToggleService = _FeatureToggleService_;

    $scope.wizard = {
      nextTab: sinon.stub(),
    };
  }));

  function initSpies() {
    spyOn($scope.wizard, 'nextTab');

    spyOn(Orgservice, 'getOrg').and.callFake(function (callback) {
      callback(orgServiceJSONFixture.getOrg, getOrgStatus);
    });
    spyOn(Orgservice, 'validateSiteUrl').and.returnValue($q.resolve({ isValid: true }));

    spyOn(Notification, 'error');

    spyOn(ServiceSetup, 'getTimeZones').and.returnValue($q.resolve());
    spyOn(ServiceSetup, 'getTranslatedTimeZones').and.returnValue(['1', '2', '3']);

    spyOn(FeatureToggleService, 'atlasSubdomainUpdateGetStatus').and.returnValue($q.resolve(false));
  }

  function initController() {
    var ctrl = $controller('EnterpriseSettingsCtrl', {
      $scope: $scope,
      $rootScope: rootScope,
      Authinfo: authInfo,
      FeatureToggleService: FeatureToggleService,
    });

    $scope.$apply();

    return ctrl;
  }

  describe('test the ssoEnabled settings', function () {
    beforeEach(function () {
      initSpies();
      initController();
    });

    it('should set ssoEnabled field to true in the scope', function () {
      rootScope.ssoEnabled = true;
      $scope.updateSSO();
      $scope.$apply();
      expect($scope.ssoEnabled).toEqual(true);
    });

    it('should set ssoEnabled field to false in the scope', function () {
      rootScope.ssoEnabled = false;
      $scope.updateSSO();
      $scope.$apply();
      expect($scope.ssoEnabled).toEqual(false);
    });

    it('should go to next tab if sso is on and user clicks on next without clicking modify', function () {
      $scope.ssoEnabled = true;
      $scope.options.modifySSO = false;
      var promise = $scope.initNext();
      $scope.$apply();
      expect(promise).toBeRejected();
      expect($scope.wizard.nextTab).toHaveBeenCalled();
    });

    it('should go to next tab if sso is on and user clicks modify and switches from advanced to simple', function () {
      $scope.ssoEnabled = true;
      $scope.options.modifySSO = true;
      $scope.options.deleteSSOBySwitchingRadio = true;
      var promise = $scope.initNext();
      $scope.$apply();
      expect(promise).toBeRejected();
      expect($scope.wizard.nextTab).toHaveBeenCalled();
      //modify flag should be reset
      expect($scope.options.modifySSO).toEqual(false);
    });

    it('should go to next step if sso is on and user clicks modify and clicks next without switching from advanced to simple', function () {
      $scope.ssoEnabled = true;
      $scope.options.modifySSO = true;
      $scope.options.deleteSSOBySwitchingRadio = false;
      var promise = $scope.initNext();
      $scope.$apply();
      expect(promise).toBeResolved();
      expect($scope.options.modifySSO).toEqual(false);
    });

    it('should go to next tab if sso is off and user selects simple option', function () {
      $scope.ssoEnabled = false;
      $scope.options.configureSSO = 1;
      var promise = $scope.initNext();
      $scope.$apply();
      expect(promise).toBeRejected();
      expect($scope.wizard.nextTab).toHaveBeenCalled();
    });

    it('should go to next step if sso is off and user selects advanced option', function () {
      $scope.ssoEnabled = false;
      $scope.options.configureSSO = 0;
      var promise = $scope.initNext();
      $scope.$apply();
      expect(promise).toBeResolved();
    });

  });

  describe('test Personal Meeting Room Setup', function () {
    it('should handle valid org settings', function () {
      spyOn(FeatureToggleService, 'atlasSubdomainUpdateGetStatus').and.returnValue($q.resolve(false));
      spyOn(Orgservice, 'getOrg').and.callFake(function (callback) {
        callback(orgServiceJSONFixture.getOrg, getOrgStatus);
      });

      spyOn(Orgservice, 'validateSiteUrl').and.callFake(function () {
        return $q.resolve({
          isValid: true,
        });
      });

      var ctrl = initController();

      expect(ctrl.pmrField.inputValue).toEqual('amtest2.ciscospark.com');

    });

    it('should handle org data not having a sipCloudDomain in orgSettings', function () {
      spyOn(FeatureToggleService, 'atlasSubdomainUpdateGetStatus').and.returnValue($q.resolve(false));
      spyOn(Orgservice, 'getOrg').and.callFake(function (callback) {
        var org = _.cloneDeep(orgServiceJSONFixture.getOrg);
        org.orgSettings.sipCloudDomain = undefined;
        callback(org, getOrgStatus);
      });

      spyOn(Orgservice, 'validateSiteUrl').and.callFake(function () {
        return $q.resolve({
          isValid: true,
        });
      });

      var ctrl = initController();

      expect(ctrl.pmrField.inputValue).toEqual('');

    });

    it('should shallow validate the Sip Domain', function () {

      initSpies();
      initController();

      expect(Orgservice.validateSiteUrl).toHaveBeenCalledWith('amtest2.ciscospark.com');
    });

  });
});
