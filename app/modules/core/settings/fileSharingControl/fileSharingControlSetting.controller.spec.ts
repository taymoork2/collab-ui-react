import testModule from './index';
import { FileSharingControlSettingController } from './fileSharingControlSetting.controller';

describe('Controller: FileSharingControlSettingController', () => {

  let controller: FileSharingControlSettingController;
  let $scope, $controller, $q;
  let AccountOrgService, Authinfo, ProPackService;

  beforeEach(angular.mock.module(testModule));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies($rootScope, _$controller_, _$q_, _AccountOrgService_, _Authinfo_, _ProPackService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    AccountOrgService = _AccountOrgService_;
    Authinfo = _Authinfo_;
    ProPackService = _ProPackService_;
  }

  function initSpies() {
    spyOn(AccountOrgService, 'getFileSharingControl');
    spyOn(AccountOrgService, 'setFileSharingControl');
    spyOn(ProPackService, 'hasProPackPurchasedOrNotEnabled').and.returnValue($q.resolve(true));
  }

  function initController() {
    controller = $controller(FileSharingControlSettingController, {
      $scope: $scope,
    });
    controller.$onInit();
    $scope.$apply();
  }

  describe('constructor()', () => {

    describe('when getFileSharingControl fail', () => {
      beforeEach(initGetBlockFileSharingControlReject());
      beforeEach(initController);

      it('should not set dataloaded and no value for isBlockDesktopAppDownload', () => {
        expect(controller.isBlockDesktopAppDownload).toBeFalsy();
        expect(controller.isFileSharingControlSettingLoaded).toBeFalsy();
      });
    });
    describe('when getFileSharingControl return blockFileSharingControls set to true', () => {
      beforeEach(initGetFileSharingControlWithResult(true, false, false, false, false, false, false, false));
      beforeEach(initController);

      it('should set dataloaded and true for isBlockDesktopAppDownload', () => {
        expect(controller.isBlockDesktopAppDownload).toBeTruthy();
        expect(controller.isFileSharingControlSettingLoaded).toBeTruthy();
      });
    });

    describe('when getFileSharingControl return blockFileSharingControls set to false', () => {
      beforeEach(initGetFileSharingControlWithResult(false, false, false, false, false, false, false, false));
      beforeEach(initController);

      it('should set dataloaded and true for isBlockDesktopAppDownload', () => {
        expect(controller.isBlockDesktopAppDownload).toBeFalsy();
        expect(controller.isFileSharingControlSettingLoaded).toBeTruthy();
      });
    });
  });

  describe('updateFileSharingControlSetting', () => {
    beforeEach(function() {
      initGetFileSharingControlWithResult(false, false, false, false, false, false, false, false);
      initGetBlockFileSharingControl();
      initController();
    });

    it('should call AccountOrgService to save the value true', () => {
      controller.isBlockDesktopAppDownload = true;

      controller.updateFileSharingControlSetting();

      expect(AccountOrgService.setFileSharingControl)
        .toHaveBeenCalledWith(Authinfo.getOrgId(), {
          blockDesktopAppDownload : true,
          blockWebAppDownload : false,
          blockMobileAppDownload : false,
          blockBotsDownload : false,
          blockDesktopAppUpload : false,
          blockWebAppUpload : false,
          blockMobileAppUpload : false,
          blockBotsUpload : false});
    });

    it('should call AccountOrgService to save the value false', () => {
      controller.isBlockDesktopAppDownload = false;

      controller.updateFileSharingControlSetting();

      expect(AccountOrgService.setFileSharingControl)
        .toHaveBeenCalledWith(Authinfo.getOrgId(), {
          blockDesktopAppDownload : false,
          blockWebAppDownload : false,
          blockMobileAppDownload : false,
          blockBotsDownload : false,
          blockDesktopAppUpload : false,
          blockWebAppUpload : false,
          blockMobileAppUpload : false,
          blockBotsUpload : false});
    });

    function initGetBlockFileSharingControl() {
      AccountOrgService.setFileSharingControl.and.returnValue($q.resolve({}));
    }
  });

  function initGetFileSharingControlWithResult(
    blockDesktopAppDownload: boolean,
    blockWebAppDownload: boolean,
    blockMobileAppDownload: boolean,
    blockBotsDownload: boolean,
    blockDesktopAppUpload: boolean,
    blockWebAppUpload: boolean,
    blockMobileAppUpload: boolean,
    blockBotsUpload: boolean) {
    return () => {
      AccountOrgService.getFileSharingControl.and.returnValue($q.resolve({
        blockDesktopAppDownload,
        blockWebAppDownload,
        blockMobileAppDownload,
        blockBotsDownload,
        blockDesktopAppUpload,
        blockWebAppUpload,
        blockMobileAppUpload,
        blockBotsUpload}));
    };
  }

  function initGetBlockFileSharingControlReject() {
    return () => {
      AccountOrgService.getFileSharingControl.and.returnValue($q.reject({}));
    };
  }
});
