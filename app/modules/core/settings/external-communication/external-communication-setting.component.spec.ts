import { Notification } from 'modules/core/notifications';
import { ProPackService } from 'modules/core/proPack/proPack.service';
import { OrgSettingsService } from 'modules/core/shared/org-settings/org-settings.service';
import { ExternalCommunicationSettingController } from './external-communication-setting.component';
import moduleName from './index';

type Test = atlas.test.IComponentTest<ExternalCommunicationSettingController, {
  Authinfo,
  Notification: Notification,
  OrgSettingsService: OrgSettingsService,
  ProPackService: ProPackService,
}>;

describe('Controller: ExternalCommunicationSettingController', () => {

  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      '$q',
      '$scope',
      'Authinfo',
      'Notification',
      'OrgSettingsService',
      'ProPackService',
    );

    this.initComponent = () => this.compileComponent('externalCommunicationSetting', {});
    this.initSpies = (spies: {
      getBlockExternalCommunications?,
      setBlockExternalCommunications?,
      hasProPackPurchasedOrNotEnabled?,
    } = {}) => {
      const {
        getBlockExternalCommunications = this.$q.resolve(false),
        setBlockExternalCommunications = this.$q.resolve(),
        hasProPackPurchasedOrNotEnabled = this.$q.resolve(true),
      } = spies;
      spyOn(this.OrgSettingsService, 'getBlockExternalCommunications').and.returnValue(getBlockExternalCommunications);
      spyOn(this.OrgSettingsService, 'setBlockExternalCommunications').and.returnValue(setBlockExternalCommunications);
      spyOn(this.ProPackService, 'hasProPackPurchasedOrNotEnabled').and.returnValue(hasProPackPurchasedOrNotEnabled);
      spyOn(this.Notification, 'errorWithTrackingId');
    };
  });

  enum Checkbox {
    BLOCK_EXTERNAL_COMMUNICATION = 'input[type="checkbox"]#blockExternalCommunication',
  }

  describe('constructor()', () => {

    describe('when getBlockExternalCommunications fail', () => {
      beforeEach(function (this: Test) {
        this.initSpies({
          getBlockExternalCommunications: this.$q.reject(),
        });
        this.initComponent();
      });

      it('should not set dataloaded and no value for isBlockExternalCommunication', function (this: Test) {
        expect(this.controller.isBlockExternalCommunication).toBe(false);
        expect(this.controller.isBlockExternalCommunicationSettingLoaded).toBe(false);
      });
    });

    describe('when getBlockExternalCommunications return blockExternalCommunications set to true', () => {
      beforeEach(function (this: Test) {
        this.initSpies({
          getBlockExternalCommunications: this.$q.resolve(true),
        });
        this.initComponent();
      });

      it('should set dataloaded and true for isBlockExternalCommunication', function (this: Test) {
        expect(this.controller.isBlockExternalCommunication).toBe(true);
        expect(this.controller.isBlockExternalCommunicationSettingLoaded).toBe(true);
      });
    });

    describe('when getBlockExternalCommunications return blockExternalCommunications set to false', () => {
      beforeEach(function (this: Test) {
        this.initSpies({
          getBlockExternalCommunications: this.$q.resolve(false),
        });
        this.initComponent();
      });

      it('should set dataloaded and true for isBlockExternalCommunication', function (this: Test) {
        expect(this.controller.isBlockExternalCommunication).toBe(false);
        expect(this.controller.isBlockExternalCommunicationSettingLoaded).toBe(true);
      });
    });
  });

  describe('updateBlockExternalCommunicationSetting', () => {
    it('should call OrgSettingsService to save the value true', function (this: Test) {
      this.initSpies();
      this.initComponent();

      this.view.find(Checkbox.BLOCK_EXTERNAL_COMMUNICATION).click();
      expect(this.OrgSettingsService.setBlockExternalCommunications).toHaveBeenCalledWith(this.Authinfo.getOrgId(), true);
      expect(this.view.find(Checkbox.BLOCK_EXTERNAL_COMMUNICATION)).toBeChecked();
    });

    it('should call OrgSettingsService to save the value false', function (this: Test) {
      this.initSpies({
        getBlockExternalCommunications: this.$q.resolve(true),
      });
      this.initComponent();

      this.view.find(Checkbox.BLOCK_EXTERNAL_COMMUNICATION).click();
      expect(this.OrgSettingsService.setBlockExternalCommunications).toHaveBeenCalledWith(this.Authinfo.getOrgId(), false);
      expect(this.view.find(Checkbox.BLOCK_EXTERNAL_COMMUNICATION)).not.toBeChecked();
    });

    it('should notify error and undo checkbox changes when an error occurs while saving', function (this: Test) {
      this.initSpies();
      this.initComponent();
      (<jasmine.Spy> this.OrgSettingsService.setBlockExternalCommunications).and.returnValue(this.$q.reject());

      this.view.find(Checkbox.BLOCK_EXTERNAL_COMMUNICATION).click();
      expect(this.OrgSettingsService.setBlockExternalCommunications).toHaveBeenCalled();
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();

      expect(this.view.find(Checkbox.BLOCK_EXTERNAL_COMMUNICATION)).not.toBeChecked();
    });
  });
});
