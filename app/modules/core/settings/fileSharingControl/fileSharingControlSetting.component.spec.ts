import testModuleName from './index';
import { FileSharingControlSettingController } from './fileSharingControlSetting.component';
import { ProPackService } from 'modules/core/proPack/proPack.service';
import { IToolkitModalService } from 'modules/core/modal';
import { OrgSettingsService, FileShareControl, FileShareControlType } from 'modules/core/shared/org-settings/org-settings.service';

type Test = atlas.test.IComponentTest<FileSharingControlSettingController, {
  Authinfo,
  ModalService: IToolkitModalService,
  OrgSettingsService: OrgSettingsService,
  ProPackService: ProPackService,
}>;

describe('Component: FileSharingControlSetting', () => {
  beforeEach(function (this: Test) {
    this.initModules(testModuleName);
    this.injectDependencies(
      'Authinfo',
      'ModalService',
      'OrgSettingsService',
      'ProPackService',
    );

    this.initComponent = () => this.compileComponent('fileSharingControlSetting', {});

    this.initSpies = (spies: {
      getFileShareControl?,
      setFileShareControl?,
      hasProPackPurchasedOrNotEnabled?,
      modalResult?,
    } = {}) => {
      const {
        getFileShareControl = this.$q.resolve(new FileShareControl()),
        setFileShareControl = this.$q.resolve(),
        hasProPackPurchasedOrNotEnabled = this.$q.resolve(true),
        modalResult = this.$q.resolve(),
      } = spies;
      spyOn(this.OrgSettingsService, 'getFileShareControl').and.returnValue(getFileShareControl);
      spyOn(this.OrgSettingsService, 'setFileShareControl').and.returnValue(setFileShareControl);
      spyOn(this.ProPackService, 'hasProPackPurchasedOrNotEnabled').and.returnValue(hasProPackPurchasedOrNotEnabled);
      spyOn(this.ModalService, 'open').and.returnValue({ result: modalResult });
      spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
    };
  });

  enum Checkbox {
    BLOCK_DESKTOP_DOWNLOAD = 'input[type="checkbox"]#blockDesktopAppDownload',
    BLOCK_DESKTOP_UPLOAD = 'input[type="checkbox"]#blockDesktopAppUpload',
    BLOCK_WEBAPP_DOWNLOAD = 'input[type="checkbox"]#blockWebAppDownload',
    BLOCK_WEBAPP_UPLOAD = 'input[type="checkbox"]#blockWebAppUpload',
    BLOCK_MOBILE_DOWNLOAD = 'input[type="checkbox"]#blockMobileAppDownload',
    BLOCK_MOBILE_UPLOAD = 'input[type="checkbox"]#blockMobileAppUpload',
    BLOCK_BOTS_DOWNLOAD = 'input[type="checkbox"]#blockBotsDownload',
    BLOCK_BOTS_UPLOAD = 'input[type="checkbox"]#blockBotsUpload',
  }

  describe('Initialization', () => {
    beforeEach(function (this: Test) {
      this.expectCheckboxesToBeDisabled = (shouldBeDisabled: boolean) => {
        _.valuesIn<Checkbox>(Checkbox).forEach(checkbox => {
          if (shouldBeDisabled) {
            expect(this.view.find(checkbox)).toBeDisabled();
          } else {
            expect(this.view.find(checkbox)).not.toBeDisabled();
          }
          expect(this.view.find(checkbox)).not.toBeChecked();
        });
      };
    });

    it('should have disabled checkboxes if pro pack is not purchased', function (this: Test) {
      this.initSpies({
        hasProPackPurchasedOrNotEnabled: this.$q.reject(),
      });
      this.initComponent();
      expect(this.controller.isCheckboxDisabled).toBe(true);
      this.expectCheckboxesToBeDisabled(true);
    });

    it('should have disabled checkboxes if file share control settings do not load', function (this: Test) {
      this.initSpies({
        getFileShareControl: this.$q.reject(),
      });
      this.initComponent();
      expect(this.controller.isCheckboxDisabled).toBe(true);
      this.expectCheckboxesToBeDisabled(true);
    });

    it('should have enabled checkboxes after initialization', function (this: Test) {
      this.initSpies();
      this.initComponent();
      expect(this.controller.isCheckboxDisabled).toBe(false);
      this.expectCheckboxesToBeDisabled(false);
    });

    it('should set checkboxes based on initial loaded data', function (this: Test) {
      this.initSpies({
        getFileShareControl: this.$q.resolve(new FileShareControl({
          desktopFileShareControl: FileShareControlType.BLOCK_BOTH,
          mobileFileShareControl: FileShareControlType.BLOCK_UPLOAD,
          webFileShareControl: FileShareControlType.NONE,
          botFileShareControl: FileShareControlType.NONE,
        })),
      });
      this.initComponent();

      expect(this.view.find(Checkbox.BLOCK_DESKTOP_DOWNLOAD)).toBeChecked();
      expect(this.view.find(Checkbox.BLOCK_DESKTOP_DOWNLOAD)).not.toBeDisabled();
      expect(this.view.find(Checkbox.BLOCK_DESKTOP_UPLOAD)).toBeChecked();
      expect(this.view.find(Checkbox.BLOCK_DESKTOP_UPLOAD)).toBeDisabled();

      expect(this.view.find(Checkbox.BLOCK_MOBILE_DOWNLOAD)).not.toBeChecked();
      expect(this.view.find(Checkbox.BLOCK_MOBILE_DOWNLOAD)).not.toBeDisabled();
      expect(this.view.find(Checkbox.BLOCK_MOBILE_UPLOAD)).toBeChecked();
      expect(this.view.find(Checkbox.BLOCK_MOBILE_UPLOAD)).not.toBeDisabled();

      expect(this.view.find(Checkbox.BLOCK_WEBAPP_DOWNLOAD)).not.toBeChecked();
      expect(this.view.find(Checkbox.BLOCK_WEBAPP_DOWNLOAD)).not.toBeDisabled();
      expect(this.view.find(Checkbox.BLOCK_WEBAPP_UPLOAD)).not.toBeChecked();
      expect(this.view.find(Checkbox.BLOCK_WEBAPP_UPLOAD)).not.toBeDisabled();

      expect(this.view.find(Checkbox.BLOCK_BOTS_DOWNLOAD)).not.toBeChecked();
      expect(this.view.find(Checkbox.BLOCK_BOTS_DOWNLOAD)).not.toBeDisabled();
      expect(this.view.find(Checkbox.BLOCK_BOTS_UPLOAD)).not.toBeChecked();
      expect(this.view.find(Checkbox.BLOCK_BOTS_UPLOAD)).not.toBeDisabled();
    });
  });

  describe('Confirmation', () => {
    it('should open confirmation modal once and save setting with OrgSettingsService.setFileShareControl() if resolved', function (this: Test) {
      this.initSpies();
      this.initComponent();
      this.view.find(Checkbox.BLOCK_DESKTOP_DOWNLOAD).click();
      expect(this.ModalService.open).toHaveBeenCalledTimes(1);
      expect(this.OrgSettingsService.setFileShareControl).toHaveBeenCalledTimes(1);
      this.view.find(Checkbox.BLOCK_DESKTOP_DOWNLOAD).click();
      expect(this.ModalService.open).toHaveBeenCalledTimes(1);
      expect(this.OrgSettingsService.setFileShareControl).toHaveBeenCalledTimes(2);
    });

    it('should open confirmation modal once and not save settings if is rejected, but update on subsequenet change', function (this: Test) {
      this.initSpies({
        modalResult: this.$q.reject(),
      });
      this.initComponent();
      this.view.find(Checkbox.BLOCK_DESKTOP_DOWNLOAD).click();
      expect(this.ModalService.open).toHaveBeenCalledTimes(1);
      expect(this.OrgSettingsService.setFileShareControl).not.toHaveBeenCalled();
      this.view.find(Checkbox.BLOCK_DESKTOP_DOWNLOAD).click();
      expect(this.ModalService.open).toHaveBeenCalledTimes(1);
      expect(this.OrgSettingsService.setFileShareControl).toHaveBeenCalledTimes(1);
    });
  });

  describe('Download/Upload', () => {
    it('should save BLOCK_UPLOAD for each upload checkbox', function (this: Test) {
      this.initSpies();
      this.initComponent();

      // check each input
      (this.OrgSettingsService.setFileShareControl as jasmine.Spy).calls.reset();
      this.view.find(Checkbox.BLOCK_DESKTOP_UPLOAD).click();
      expect(this.OrgSettingsService.setFileShareControl).toHaveBeenCalledWith('12345', jasmine.objectContaining(new FileShareControl({
        desktopFileShareControl: FileShareControlType.BLOCK_UPLOAD,
      })));

      (this.OrgSettingsService.setFileShareControl as jasmine.Spy).calls.reset();
      this.view.find(Checkbox.BLOCK_WEBAPP_UPLOAD).click();
      expect(this.OrgSettingsService.setFileShareControl).toHaveBeenCalledWith('12345', jasmine.objectContaining(new FileShareControl({
        desktopFileShareControl: FileShareControlType.BLOCK_UPLOAD,
        webFileShareControl: FileShareControlType.BLOCK_UPLOAD,
      })));

      (this.OrgSettingsService.setFileShareControl as jasmine.Spy).calls.reset();
      this.view.find(Checkbox.BLOCK_MOBILE_UPLOAD).click();
      expect(this.OrgSettingsService.setFileShareControl).toHaveBeenCalledWith('12345', jasmine.objectContaining(new FileShareControl({
        desktopFileShareControl: FileShareControlType.BLOCK_UPLOAD,
        webFileShareControl: FileShareControlType.BLOCK_UPLOAD,
        mobileFileShareControl: FileShareControlType.BLOCK_UPLOAD,
      })));

      (this.OrgSettingsService.setFileShareControl as jasmine.Spy).calls.reset();
      this.view.find(Checkbox.BLOCK_BOTS_UPLOAD).click();
      expect(this.OrgSettingsService.setFileShareControl).toHaveBeenCalledWith('12345', jasmine.objectContaining(new FileShareControl({
        desktopFileShareControl: FileShareControlType.BLOCK_UPLOAD,
        webFileShareControl: FileShareControlType.BLOCK_UPLOAD,
        mobileFileShareControl: FileShareControlType.BLOCK_UPLOAD,
        botFileShareControl: FileShareControlType.BLOCK_UPLOAD,
      })));

      // uncheck each input
      (this.OrgSettingsService.setFileShareControl as jasmine.Spy).calls.reset();
      this.view.find(Checkbox.BLOCK_DESKTOP_UPLOAD).click();
      expect(this.OrgSettingsService.setFileShareControl).toHaveBeenCalledWith('12345', jasmine.objectContaining(new FileShareControl({
        webFileShareControl: FileShareControlType.BLOCK_UPLOAD,
        mobileFileShareControl: FileShareControlType.BLOCK_UPLOAD,
        botFileShareControl: FileShareControlType.BLOCK_UPLOAD,
      })));

      (this.OrgSettingsService.setFileShareControl as jasmine.Spy).calls.reset();
      this.view.find(Checkbox.BLOCK_WEBAPP_UPLOAD).click();
      expect(this.OrgSettingsService.setFileShareControl).toHaveBeenCalledWith('12345', jasmine.objectContaining(new FileShareControl({
        mobileFileShareControl: FileShareControlType.BLOCK_UPLOAD,
        botFileShareControl: FileShareControlType.BLOCK_UPLOAD,
      })));

      (this.OrgSettingsService.setFileShareControl as jasmine.Spy).calls.reset();
      this.view.find(Checkbox.BLOCK_MOBILE_UPLOAD).click();
      expect(this.OrgSettingsService.setFileShareControl).toHaveBeenCalledWith('12345', jasmine.objectContaining(new FileShareControl({
        botFileShareControl: FileShareControlType.BLOCK_UPLOAD,
      })));

      (this.OrgSettingsService.setFileShareControl as jasmine.Spy).calls.reset();
      this.view.find(Checkbox.BLOCK_BOTS_UPLOAD).click();
      expect(this.OrgSettingsService.setFileShareControl).toHaveBeenCalledWith('12345', jasmine.objectContaining(new FileShareControl()));
    });

    it('should save BLOCK_BOTH when download is checked by also checking and disabling upload input', function (this: Test) {
      this.initSpies();
      this.initComponent();

      const verifyDownloadAndUploadCheckboxClicks = (downloadCheckbox: Checkbox, uploadCheckbox: Checkbox, fileShareControlKey: keyof FileShareControl): void => {
        // check download will check both download and upload, disable upload, and set to BLOCK_BOTH
        (this.OrgSettingsService.setFileShareControl as jasmine.Spy).calls.reset();
        this.view.find(downloadCheckbox).click();
        expect(this.OrgSettingsService.setFileShareControl).toHaveBeenCalledWith('12345', jasmine.objectContaining(new FileShareControl({
          [fileShareControlKey]: FileShareControlType.BLOCK_BOTH,
        })));
        expect(this.view.find(downloadCheckbox)).toBeChecked();
        expect(this.view.find(downloadCheckbox)).not.toBeDisabled();
        expect(this.view.find(uploadCheckbox)).toBeChecked();
        expect(this.view.find(uploadCheckbox)).toBeDisabled();

        // uncheck download will enable upload checkbox and set to BLOCK_UPLOAD
        (this.OrgSettingsService.setFileShareControl as jasmine.Spy).calls.reset();
        this.view.find(downloadCheckbox).click();
        expect(this.OrgSettingsService.setFileShareControl).toHaveBeenCalledWith('12345', jasmine.objectContaining(new FileShareControl({
          [fileShareControlKey]: FileShareControlType.BLOCK_UPLOAD,
        })));
        expect(this.view.find(downloadCheckbox)).not.toBeChecked();
        expect(this.view.find(downloadCheckbox)).not.toBeDisabled();
        expect(this.view.find(uploadCheckbox)).toBeChecked();
        expect(this.view.find(uploadCheckbox)).not.toBeDisabled();

        // uncheck upload will set to NONE
        (this.OrgSettingsService.setFileShareControl as jasmine.Spy).calls.reset();
        this.view.find(uploadCheckbox).click();
        expect(this.OrgSettingsService.setFileShareControl).toHaveBeenCalledWith('12345', jasmine.objectContaining(new FileShareControl({
          [fileShareControlKey]: FileShareControlType.NONE,
        })));
        expect(this.view.find(downloadCheckbox)).not.toBeChecked();
        expect(this.view.find(downloadCheckbox)).not.toBeDisabled();
        expect(this.view.find(uploadCheckbox)).not.toBeChecked();
        expect(this.view.find(uploadCheckbox)).not.toBeDisabled();
      };

      verifyDownloadAndUploadCheckboxClicks(
        Checkbox.BLOCK_DESKTOP_DOWNLOAD,
        Checkbox.BLOCK_DESKTOP_UPLOAD,
        'desktopFileShareControl',
      );
      verifyDownloadAndUploadCheckboxClicks(
        Checkbox.BLOCK_WEBAPP_DOWNLOAD,
        Checkbox.BLOCK_WEBAPP_UPLOAD,
        'webFileShareControl',
      );
      verifyDownloadAndUploadCheckboxClicks(
        Checkbox.BLOCK_MOBILE_DOWNLOAD,
        Checkbox.BLOCK_MOBILE_UPLOAD,
        'mobileFileShareControl',
      );
      verifyDownloadAndUploadCheckboxClicks(
        Checkbox.BLOCK_BOTS_DOWNLOAD,
        Checkbox.BLOCK_BOTS_UPLOAD,
        'botFileShareControl',
      );
    });
  });
});
