import { PrivacySettingController } from './privacy.settings.controller';
import testModule from './index';

describe('Controller: PrivacySettingController', () => {
  let Authinfo, $controller, controller: PrivacySettingController, $q, $scope;
  let Notification, Orgservice;
  const orgId = 'superOrg';
  beforeEach(angular.mock.module(testModule));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(
    $rootScope,
    _Authinfo_,
    _$controller_,
    _$q_,
    _Notification_,
    _Orgservice_,
  ) {
    $scope = $rootScope.$new();
    Authinfo = _Authinfo_;
    $controller = _$controller_;
    $q = _$q_;
    Notification = _Notification_;
    Orgservice = _Orgservice_;
  }

  function initSpies() {
    spyOn(Authinfo, 'getOrgId').and.returnValue(orgId);
    spyOn(Notification, 'success');
    spyOn(Notification, 'error');
    spyOn(Notification, 'errorResponse');
    spyOn(Orgservice, 'setOrgSettings').and.returnValue($q.resolve());
  }

  function initController(orgData) {
    spyOn(Orgservice, 'getOrg').and.callFake((callback) => {
      callback(orgData, 200);
    });

    controller = $controller(PrivacySettingController, {
      $scope: $scope,
    });
    $scope.$apply();
  }

  describe('init', () => {
    const params = {
      basicInfo: true,
    };

    it('should query org service and set allowReadOnlyAccess to true from orgData', () => {
      initController({ success: true, orgSettings: { allowReadOnlyAccess: true } });

      expect(Orgservice.getOrg).toHaveBeenCalledWith(jasmine.any(Function), orgId, params);
      expect(controller.allowReadOnlyAccess).toBeTruthy();
    });

    it('should query org service and set allowReadOnlyAccess to false from orgData', () => {
      initController({ success: true, orgSettings: { allowReadOnlyAccess: false } });

      expect(Orgservice.getOrg).toHaveBeenCalledWith(jasmine.any(Function), orgId, params);
      expect(controller.allowReadOnlyAccess).toBeFalsy();
      expect(controller.allowReadOnlyAccess).toBeDefined();
    });

    it('should query org service and set allowReadOnlyAccess true if not set in orgData', () => {
      initController({ success: true, orgSettings: {} });

      expect(Orgservice.getOrg).toHaveBeenCalledWith(jasmine.any(Function), orgId, params);
      expect(controller.allowReadOnlyAccess).toBeTruthy();
    });

    it('should query org service and set allowCrashLogUpload to true from orgData', () => {
      initController({ success: true, orgSettings: { allowCrashLogUpload: true } });

      expect(Orgservice.getOrg).toHaveBeenCalledWith(jasmine.any(Function), orgId, params);
      expect(controller.allowCrashLogUpload).toBeTruthy();
    });

    it('should query org service and set allowCrashLogUpload to false from orgData', () => {
      initController({ success: true, orgSettings: { allowCrashLogUpload: false } });

      expect(Orgservice.getOrg).toHaveBeenCalledWith(jasmine.any(Function), orgId, params);
      expect(controller.allowCrashLogUpload).toBeFalsy();
      expect(controller.allowCrashLogUpload).toBeDefined();
    });

    it('should query org service and keep allowCrashLogUpload true if not set in orgData', () => {
      initController({ success: true, orgSettings: {} });

      expect(Orgservice.getOrg).toHaveBeenCalledWith(jasmine.any(Function), orgId, params);
      expect(controller.allowCrashLogUpload).not.toBeUndefined();
      expect(controller.allowCrashLogUpload).toBeTruthy();
    });
  });

  describe('saving allowReadOnlyAccess', () => {
    beforeEach(() => initController({}));

    it('should call setOrgSetting on orgService with only allowReadOnlyAccess setting specified', () => {
      controller.allowReadOnlyAccess = true;
      $scope.$digest();
      expect(Orgservice.setOrgSettings).toHaveBeenCalledWith(orgId, { allowReadOnlyAccess: true });
    });
  });

  describe('saving allowCrashLogUpload', () => {
    beforeEach(() => initController({}));

    it('should call setOrgSetting on orgService with only allowCrashLogUpload setting specified', () => {
      controller.allowCrashLogUpload = true;
      $scope.$digest();
      expect(Orgservice.setOrgSettings).toHaveBeenCalledWith(orgId, { allowCrashLogUpload: true });
    });
  });
});
