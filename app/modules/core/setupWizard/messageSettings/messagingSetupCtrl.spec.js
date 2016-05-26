'use strict';

describe('Controller: messagingSetupCtrl', function () {
  beforeEach(module('Core'));
  beforeEach(module('Huron'));

  var $controller, $scope, $q, AccountOrgService, Authinfo, controller, FeatureToggleService, Notification;

  beforeEach(inject(function (_$controller_, _$q_, $rootScope, _AccountOrgService_, _Authinfo_, _FeatureToggleService_, _Notification_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    AccountOrgService = _AccountOrgService_;
    Authinfo = _Authinfo_;
    FeatureToggleService = _FeatureToggleService_;
    Notification = _Notification_;

    spyOn(AccountOrgService, 'getOrgSettings').and.returnValue($q.when({
      data: {
        settings: []
      }
    }));
    spyOn(AccountOrgService, 'getServices').and.returnValue($q.when({
      data: {
        entitlements: []
      }
    }));

    spyOn(AccountOrgService, 'getAppSecurity').and.returnValue($q.when({
      data: {
        enforceClientSecurity: true
      }
    }));

    spyOn(Authinfo, 'getOrgId').and.returnValue(1);
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));
    spyOn(Notification, 'notify');
  }));

  function initController() {
    controller = $controller('MessagingSetupCtrl', {
      $scope: $scope
    });
    $scope.$apply();
  }

  describe('controller', function () {
    beforeEach(initController);

    it('should be defined', function () {
      expect(controller).toBeDefined();
    });
  });

  describe('atlasAppleFeatures Feature Toggle', function () {
    beforeEach(function () {
      FeatureToggleService.supports.and.callFake(function (val) {
        if (val === FeatureToggleService.features.atlasAppleFeatures) {
          return $q.when(true);
        }
        return $q.when(false);
      });
      initController();
    });

    it('should set the showAppSecurity flag to be true', function () {
      expect(controller.showAppSecurity).toBe(true);
    });
  });

  describe('test that getAppSecurity function and sets enforceClientSecurity: ', function () {
    beforeEach(initController);

    it('should check if getAppSecurity in return sets AppSecurity to true', function () {
      expect(controller.appSecurity).toEqual(true);
    });
  });
});
