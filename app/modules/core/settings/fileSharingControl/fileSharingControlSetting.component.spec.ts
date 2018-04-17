import testModule from './index';
import { FileSharingControlSettingController } from './fileSharingControlSetting.controller';

describe('Controller: FileSharingControlSettingController', () => {

  let controller: FileSharingControlSettingController;
  let $scope, $controller, $q;
  let AccountOrgService, Authinfo, ModalService, ProPackService;

  beforeEach(angular.mock.module(testModule));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies($rootScope, _$controller_, _$q_, _AccountOrgService_, _Authinfo_, _ModalService_, _ProPackService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    AccountOrgService = _AccountOrgService_;
    Authinfo = _Authinfo_;
    ModalService = _ModalService_;
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
      const fileShareControlSetting = {
        blockDesktopAppDownload: true,
        blockWebAppDownload: false,
        blockMobileAppDownload: false,
        blockBotsDownload: false,
        blockDesktopAppUpload: true,
        blockWebAppUpload: false,
        blockMobileAppUpload: false,
        blockBotsUpload: false,
      };
      beforeEach(initGetFileSharingControlWithResult(fileShareControlSetting));
      beforeEach(initController);

      it('should set dataloaded and true for isBlockDesktopAppDownload', () => {
        expect(controller.isBlockDesktopAppDownload).toBeTruthy();
        expect(controller.isFileSharingControlSettingLoaded).toBeTruthy();
      });
    });

    describe('when getFileSharingControl return blockFileSharingControls set to false', () => {
      const fileShareControlSetting = {
        blockDesktopAppDownload: false,
        blockWebAppDownload: false,
        blockMobileAppDownload: false,
        blockBotsDownload: false,
        blockDesktopAppUpload: false,
        blockWebAppUpload: false,
        blockMobileAppUpload: false,
        blockBotsUpload: false,
      };
      beforeEach(initGetFileSharingControlWithResult(fileShareControlSetting));
      beforeEach(initController);

      it('should set dataloaded and true for isBlockDesktopAppDownload', () => {
        expect(controller.isBlockDesktopAppDownload).toBeFalsy();
        expect(controller.isFileSharingControlSettingLoaded).toBeTruthy();
      });
    });
  });

  describe('updateFileSharingControlSetting', () => {
    beforeEach(function() {
      const fileShareControlSetting = {
        blockDesktopAppDownload: false,
        blockWebAppDownload: false,
        blockMobileAppDownload: false,
        blockBotsDownload: false,
        blockDesktopAppUpload: false,
        blockWebAppUpload: false,
        blockMobileAppUpload: false,
        blockBotsUpload: false,
      };
      initGetFileSharingControlWithResult(fileShareControlSetting);
      initGetBlockFileSharingControl();
      initController();
    });

    it('should call AccountOrgService to save the value true if the modal closed with "ok"', () => {
      spyOn(ModalService, 'open').and.returnValue({ result: $q.resolve(true) });
      controller.isBlockDesktopAppDownload = true;
      $scope.$apply();

      controller.updateFileSharingControlSetting();

      expect(AccountOrgService.setFileSharingControl)
        .toHaveBeenCalledWith(Authinfo.getOrgId(), {
          blockDesktopAppDownload: true,
          blockWebAppDownload: false,
          blockMobileAppDownload: false,
          blockBotsDownload: false,
          blockDesktopAppUpload: true,
          blockWebAppUpload: false,
          blockMobileAppUpload: false,
          blockBotsUpload: false});
    });


    it('should not change the value if the modal closed with "cancel" ', () => {
      spyOn(ModalService, 'open').and.returnValue({ result: $q.reject() });
      controller.isBlockDesktopAppDownload = true;
      $scope.$apply();
      controller.updateFileSharingControlSetting();

      expect(AccountOrgService.setFileSharingControl)
        .toHaveBeenCalledWith(Authinfo.getOrgId(), {
          blockDesktopAppDownload: false,
          blockWebAppDownload: false,
          blockMobileAppDownload: false,
          blockBotsDownload: false,
          blockDesktopAppUpload: false,
          blockWebAppUpload: false,
          blockMobileAppUpload: false,
          blockBotsUpload: false});
    });
    it('should call AccountOrgService to save the value false', () => {
      controller.isBlockDesktopAppDownload = false;

      controller.updateFileSharingControlSetting();

      expect(AccountOrgService.setFileSharingControl)
        .toHaveBeenCalledWith(Authinfo.getOrgId(), {
          blockDesktopAppDownload: false,
          blockWebAppDownload: false,
          blockMobileAppDownload: false,
          blockBotsDownload: false,
          blockDesktopAppUpload: false,
          blockWebAppUpload: false,
          blockMobileAppUpload: false,
          blockBotsUpload: false});
    });

    function initGetBlockFileSharingControl() {
      AccountOrgService.setFileSharingControl.and.returnValue($q.resolve({}));
    }
  });

  interface IFileSharingControlSetting {
    blockDesktopAppDownload: boolean;
    blockWebAppDownload: boolean;
    blockMobileAppDownload: boolean;
    blockBotsDownload: boolean;

    blockDesktopAppUpload: boolean;
    blockWebAppUpload: boolean;
    blockMobileAppUpload: boolean;
    blockBotsUpload: boolean;
  }

  function initGetFileSharingControlWithResult(fileShareControlSetting: IFileSharingControlSetting) {
    return () => {
      AccountOrgService.getFileSharingControl.and.returnValue($q.resolve(fileShareControlSetting));
    };
  }

  function initGetBlockFileSharingControlReject() {
    return () => {
      AccountOrgService.getFileSharingControl.and.returnValue($q.reject({}));
    };
  }
});
