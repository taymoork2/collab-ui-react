import { Notification } from 'modules/core/notifications';
import { ProPackService } from 'modules/core/proPack/proPack.service';
import { OrgSettingsService } from 'modules/core/shared/org-settings/org-settings.service';
import moduleName from './index';
import { SecuritySettingController } from './security-setting.component';

type Test = atlas.test.IComponentTest<SecuritySettingController, {
  $q: ng.IQService,
  Authinfo,
  Notification: Notification,
  OrgSettingsService: OrgSettingsService,
  ProPackService: ProPackService,
}>;

describe('Component: SecuritySettingController', () => {

  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      '$q',
      'Authinfo',
      'Notification',
      'OrgSettingsService',
      'ProPackService',
    );

    this.initComponent = () => {
      this.compileComponent('securitySetting', {});
    };

    this.initSpies = (spies: {
      getClientSecurityPolicy?,
      setClientSecurityPolicy?,
      hasProPackPurchasedOrNotEnabled?,
    } = {}) => {
      const {
        getClientSecurityPolicy = this.$q.resolve(true),
        setClientSecurityPolicy = this.$q.resolve(),
        hasProPackPurchasedOrNotEnabled = this.$q.resolve(true),
      } = spies;
      spyOn(this.OrgSettingsService, 'getClientSecurityPolicy').and.returnValue(getClientSecurityPolicy);
      spyOn(this.OrgSettingsService, 'setClientSecurityPolicy').and.returnValue(setClientSecurityPolicy);
      spyOn(this.ProPackService, 'hasProPackPurchasedOrNotEnabled').and.returnValue(hasProPackPurchasedOrNotEnabled);
    };
  });

  enum Checkbox {
    CLIENT_SECURITY = 'input[type="checkbox"]#sparkClientSecurityEnabled',
  }

  describe('constructor()', () => {

    describe('when getClientSecurityPolicy fails', () => {
      beforeEach(function (this: Test) {
        this.initSpies({
          getClientSecurityPolicy: this.$q.reject({}),
        });
        this.initComponent();
      });

      it('should not set dataloaded and no value for isSparkClientSecurityEnabled', function (this: Test) {
        expect(this.controller.isSparkClientSecurityEnabled).toBe(false);
        expect(this.controller.isSparkClientSecurityLoaded).toBe(false);
      });
    });

    describe('when getClientSecurityPolicy resolves true', () => {
      beforeEach(function (this: Test) {
        this.initSpies({
          getClientSecurityPolicy: this.$q.resolve(true),
        });
        this.initComponent();
      });

      it('should set dataloaded and true for isSparkClientSecurityEnabled', function (this: Test) {
        expect(this.controller.isSparkClientSecurityEnabled).toBe(true);
        expect(this.controller.isSparkClientSecurityLoaded).toBe(true);
      });
    });

    describe('when getClientSecurityPolicy resolves false', () => {
      beforeEach(function (this: Test) {
        this.initSpies({
          getClientSecurityPolicy: this.$q.resolve(false),
        });
        this.initComponent();
      });

      it('should set dataloaded and true for isSparkClientSecurityEnabled', function (this: Test) {
        expect(this.controller.isSparkClientSecurityEnabled).toBe(false);
        expect(this.controller.isSparkClientSecurityLoaded).toBe(true);
      });
    });

  });

  describe('updateSparkClientSecuritySetting', () => {
    it('should call OrgSettingsService to save the value true', function (this: Test) {
      this.initSpies({
        getClientSecurityPolicy: this.$q.resolve(false),
      });
      this.initComponent();

      this.view.find(Checkbox.CLIENT_SECURITY).click();
      expect(this.OrgSettingsService.setClientSecurityPolicy).toHaveBeenCalledWith(this.Authinfo.getOrgId(), true);
      expect(this.view.find(Checkbox.CLIENT_SECURITY)).toBeChecked();
    });

    it('should call OrgSettingsService to save the value false', function (this: Test) {
      this.initSpies({
        getClientSecurityPolicy: this.$q.resolve(true),
      });
      this.initComponent();

      this.view.find(Checkbox.CLIENT_SECURITY).click();
      expect(this.OrgSettingsService.setClientSecurityPolicy).toHaveBeenCalledWith(this.Authinfo.getOrgId(), false);
      expect(this.view.find(Checkbox.CLIENT_SECURITY)).not.toBeChecked();
    });

    it('should notify error and undo checkbox changes when an error occues while saving', function (this: Test) {
      this.initSpies({
        getClientSecurityPolicy: this.$q.resolve(false),
        setClientSecurityPolicy: this.$q.reject(),
      });
      this.initComponent();

      this.view.find(Checkbox.CLIENT_SECURITY).click();
      expect(this.OrgSettingsService.setClientSecurityPolicy).toHaveBeenCalled();
      expect(this.view.find(Checkbox.CLIENT_SECURITY)).not.toBeChecked();
    });
  });
});
