import testModuleName from './index';
import { FileSharingControlSettingController } from './fileSharingControlSetting.component';
import { ProPackService } from 'modules/core/proPack/proPack.service';
import { IToolkitModalService } from 'modules/core/modal';

type Test = atlas.test.IComponentTest<FileSharingControlSettingController, {
  AccountOrgService,
  Authinfo,
  ModalService: IToolkitModalService,
  ProPackService: ProPackService,
}>;

describe('Controller: FileSharingControlSettingController', () => {
  beforeEach(function (this: Test) {
    this.initModules(testModuleName);
    this.injectDependencies(
      'AccountOrgService',
      'Authinfo',
      'ModalService',
      'ProPackService',
    );

    this.initComponent = () => this.compileComponent('fileSharingControlSetting', {});

    this.initSpies = (spies: {
      getFileSharingControl?,
      setFileSharingControl?,
      hasProPackPurchasedOrNotEnabled?,
    } = {}) => {
      const {
        getFileSharingControl = this.$q.resolve(),
        setFileSharingControl = this.$q.resolve(),
        hasProPackPurchasedOrNotEnabled = this.$q.resolve(true),
      } = spies;
      spyOn(this.AccountOrgService, 'getFileSharingControl').and.returnValue(getFileSharingControl);
      spyOn(this.AccountOrgService, 'setFileSharingControl').and.returnValue(setFileSharingControl);
      spyOn(this.ProPackService, 'hasProPackPurchasedOrNotEnabled').and.returnValue(hasProPackPurchasedOrNotEnabled);
    };
  });

  describe('constructor()', () => {

    describe('when getFileSharingControl fail', () => {
      beforeEach(function (this: Test) {
        this.initSpies({
          getFileSharingControl: this.$q.reject(),
        });
        this.initComponent();
      });

      it('should not set dataloaded and no value for isBlockDesktopAppDownload', function (this: Test) {
        expect(this.controller.isBlockDesktopAppDownload).toBeFalsy();
        expect(this.controller.isFileSharingControlSettingLoaded).toBeFalsy();
      });
    });
    describe('when getFileSharingControl return blockFileSharingControls set to true', () => {
      beforeEach(function (this: Test) {
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
        this.initSpies({
          getFileSharingControl: this.$q.resolve(fileShareControlSetting),
        });
        this.initComponent();
      });

      it('should set dataloaded and true for isBlockDesktopAppDownload', function (this: Test) {
        expect(this.controller.isBlockDesktopAppDownload).toBeTruthy();
        expect(this.controller.isFileSharingControlSettingLoaded).toBeTruthy();
      });
    });

    describe('when getFileSharingControl return blockFileSharingControls set to false', () => {
      beforeEach(function (this: Test) {
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
        this.initSpies({
          getFileSharingControl: this.$q.resolve(fileShareControlSetting),
        });
        this.initComponent();
      });

      it('should set dataloaded and true for isBlockDesktopAppDownload', function (this: Test) {
        expect(this.controller.isBlockDesktopAppDownload).toBeFalsy();
        expect(this.controller.isFileSharingControlSettingLoaded).toBeTruthy();
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
      this.initSpies({
        getFileSharingControl: this.$q.resolve(fileShareControlSetting),
      });
      this.initComponent();
    });

    it('should call AccountOrgService to save the value true if the modal closed with "ok"', function (this: Test) {
      spyOn(this.ModalService, 'open').and.returnValue({ result: this.$q.resolve(true) });
      this.controller.isBlockDesktopAppDownload = true;
      this.$scope.$apply();

      this.controller.updateFileSharingControlSetting();

      expect(this.AccountOrgService.setFileSharingControl)
        .toHaveBeenCalledWith(this.Authinfo.getOrgId(), {
          blockDesktopAppDownload: true,
          blockWebAppDownload: false,
          blockMobileAppDownload: false,
          blockBotsDownload: false,
          blockDesktopAppUpload: true,
          blockWebAppUpload: false,
          blockMobileAppUpload: false,
          blockBotsUpload: false});
    });


    it('should not change the value if the modal closed with "cancel" ', function (this: Test) {
      spyOn(this.ModalService, 'open').and.returnValue({ result: this.$q.reject() });
      this.controller.isBlockDesktopAppDownload = true;
      this.$scope.$apply();
      this.controller.updateFileSharingControlSetting();

      expect(this.AccountOrgService.setFileSharingControl)
        .toHaveBeenCalledWith(this.Authinfo.getOrgId(), {
          blockDesktopAppDownload: false,
          blockWebAppDownload: false,
          blockMobileAppDownload: false,
          blockBotsDownload: false,
          blockDesktopAppUpload: false,
          blockWebAppUpload: false,
          blockMobileAppUpload: false,
          blockBotsUpload: false});
    });
    it('should call AccountOrgService to save the value false', function (this: Test) {
      this.controller.isBlockDesktopAppDownload = false;

      this.controller.updateFileSharingControlSetting();

      expect(this.AccountOrgService.setFileSharingControl)
        .toHaveBeenCalledWith(this.Authinfo.getOrgId(), {
          blockDesktopAppDownload: false,
          blockWebAppDownload: false,
          blockMobileAppDownload: false,
          blockBotsDownload: false,
          blockDesktopAppUpload: false,
          blockWebAppUpload: false,
          blockMobileAppUpload: false,
          blockBotsUpload: false});
    });
  });
});
