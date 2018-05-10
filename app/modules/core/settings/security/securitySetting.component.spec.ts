import testModule from './index';
import { SecuritySettingController } from './securitySetting.component';
import { OrgSettingsService } from 'modules/core/shared/org-settings/org-settings.service';
import { ProPackService } from 'modules/core/proPack/proPack.service';

type Test = atlas.test.IComponentTest<SecuritySettingController, {
  $q: ng.IQService,
  Authinfo,
  OrgSettingsService: OrgSettingsService,
  ProPackService: ProPackService,
}>;

describe('Component: SecuritySettingController', () => {

  beforeEach(function (this: Test) {
    this.initModules(testModule);
    this.injectDependencies(
      '$q',
      'Authinfo',
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
        hasProPackPurchasedOrNotEnabled = this.$q.resolve(false),
      } = spies;
      spyOn(this.OrgSettingsService, 'getClientSecurityPolicy').and.returnValue(getClientSecurityPolicy);
      spyOn(this.OrgSettingsService, 'setClientSecurityPolicy').and.returnValue(setClientSecurityPolicy);
      spyOn(this.ProPackService, 'hasProPackPurchasedOrNotEnabled').and.returnValue(hasProPackPurchasedOrNotEnabled);
    };
  });

  describe('contructor()', () => {

    describe('when getClientSecurityPolicy fails', () => {
      beforeEach(function (this: Test) {
        this.initSpies({
          getClientSecurityPolicy: this.$q.reject({}),
        });
        this.initComponent();
      });

      it('should not set dataloaded and no value for isSparkClientSecurityEnabled', function (this: Test) {
        expect(this.controller.isSparkClientSecurityEnabled).toBeFalsy();
        expect(this.controller.isSparkClientSecurityLoaded).toBeFalsy();
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
        expect(this.controller.isSparkClientSecurityEnabled).toBeTruthy();
        expect(this.controller.isSparkClientSecurityLoaded).toBeTruthy();
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
        expect(this.controller.isSparkClientSecurityEnabled).toBeFalsy();
        expect(this.controller.isSparkClientSecurityLoaded).toBeTruthy();
      });
    });

  });

  describe('updateSparkClientSecuritySetting', () => {
    beforeEach(function (this: Test) {
      this.initSpies({
        getClientSecurityPolicy: this.$q.resolve(false),
      });
      this.initComponent();
    });

    it('should call OrgSettingsService to save the value true', function (this: Test) {
      this.controller.isSparkClientSecurityEnabled = true;

      this.controller.updateSparkClientSecuritySetting();

      expect(this.OrgSettingsService.setClientSecurityPolicy)
        .toHaveBeenCalledWith(this.Authinfo.getOrgId(), true);
    });

    it('should call OrgSettingsService to save the value false', function (this: Test) {
      this.controller.isSparkClientSecurityEnabled = false;

      this.controller.updateSparkClientSecuritySetting();

      expect(this.OrgSettingsService.setClientSecurityPolicy)
        .toHaveBeenCalledWith(this.Authinfo.getOrgId(), false);
    });
  });
});
