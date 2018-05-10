import testModule from './index';
import { SecuritySettingController } from './securitySetting.component';

type Test = atlas.test.IComponentTest<SecuritySettingController, {
  $q: ng.IQService,
  AccountOrgService,
  Authinfo,
  ProPackService,
}>;

describe('Component: SecuritySettingController', () => {

  beforeEach(function (this: Test) {
    this.initModules(testModule);
    this.injectDependencies(
      '$q',
      'AccountOrgService',
      'Authinfo',
      'ProPackService',
    );

    spyOn(this.AccountOrgService, 'getAppSecurity');
    spyOn(this.AccountOrgService, 'setAppSecurity');
    spyOn(this.ProPackService, 'hasProPackPurchasedOrNotEnabled').and.returnValue(this.$q.resolve(false));

    this.initComponent = () => {
      this.compileComponent('securitySetting', {});
    };

    this.initSetAppSec = () => {
      this.AccountOrgService.setAppSecurity.and.returnValue(this.$q.resolve({}));
    };

    this.initGetAppSecWithResult = (result: any) => {
      this.AccountOrgService.getAppSecurity.and.returnValue(this.$q.resolve(result));
    };

    this.initGetAppSecReject = () => {
      this.AccountOrgService.getAppSecurity.and.returnValue(this.$q.reject({}));
    };
  });

  describe('contructor()', () => {

    describe('when getAppSecurity fail', () => {
      beforeEach(function (this: Test) {
        this.initGetAppSecReject();
        this.initComponent();
      });

      it('should not set dataloaded and no value for isSparkClientSecurityEnabled', function (this: Test) {
        expect(this.controller.isSparkClientSecurityEnabled).toBeFalsy();
        expect(this.controller.isSparkClientSecurityLoaded).toBeFalsy();
      });
    });

    describe('when getAppSecurity return bad object', () => {
      beforeEach(function (this: Test) {
        this.initGetAppSecWithResult({ whatsthis: false });
        this.initComponent();
      });

      it('should not set dataloaded and no value for isSparkClientSecurityEnabled', function (this: Test) {
        expect(this.controller.isSparkClientSecurityEnabled).toBeFalsy();
        expect(this.controller.isSparkClientSecurityLoaded).toBeFalsy();
      });
    });

    describe('when getAppSecurity return a bad data object', () => {
      beforeEach(function (this: Test) {
        this.initGetAppSecWithResult({ data: { whatsthis: false } });
        this.initComponent();
      });

      it('should not set dataloaded and no value for isSparkClientSecurityEnabled', function (this: Test) {
        expect(this.controller.isSparkClientSecurityEnabled).toBeFalsy();
        expect(this.controller.isSparkClientSecurityLoaded).toBeFalsy();
      });
    });

    describe('when getAppSecurity return clientSecurityPolicy set to true', () => {
      beforeEach(function (this: Test) {
        this.initGetAppSecWithResult({ data: { clientSecurityPolicy: true } });
        this.initComponent();
      });

      it('should set dataloaded and true for isSparkClientSecurityEnabled', function (this: Test) {
        expect(this.controller.isSparkClientSecurityEnabled).toBeTruthy();
        expect(this.controller.isSparkClientSecurityLoaded).toBeTruthy();
      });
    });

    describe('when getAppSecurity return clientSecurityPolicy set to false', () => {
      beforeEach(function (this: Test) {
        this.initGetAppSecWithResult({ data: { clientSecurityPolicy: false } });
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
      this.initGetAppSecWithResult({ data: { clientSecurityPolicy: false } });
      this.initSetAppSec();
      this.initComponent();
    });

    it('should call AccountOrgService to save the value true', function (this: Test) {
      this.controller.isSparkClientSecurityEnabled = true;

      this.controller.updateSparkClientSecuritySetting();

      expect(this.AccountOrgService.setAppSecurity)
        .toHaveBeenCalledWith(this.Authinfo.getOrgId(), true);
    });

    it('should call AccountOrgService to save the value false', function (this: Test) {
      this.controller.isSparkClientSecurityEnabled = false;

      this.controller.updateSparkClientSecuritySetting();

      expect(this.AccountOrgService.setAppSecurity)
        .toHaveBeenCalledWith(this.Authinfo.getOrgId(), false);
    });
  });
});
