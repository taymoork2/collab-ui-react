import { Config } from 'modules/core/config/config';
import { OrgSettingsService } from 'modules/core/shared/org-settings/org-settings.service';
import moduleName from './index';
import { SipAddressModel } from './sip-address.model';
import { SipAddressService } from './sip-address.service';
import { ISaveResponse, IValidateResponse } from './sip-address.types';

type Test = atlas.test.IServiceTest<{
  Authinfo,
  Config: Config,
  FeatureToggleService,
  OrgSettingsService: OrgSettingsService,
  SipAddressService: SipAddressService,
  UrlConfig,
}>;

describe('SipAddressService', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      'Authinfo',
      'Config',
      'FeatureToggleService',
      'OrgSettingsService',
      'SipAddressService',
      'UrlConfig',
    );

    spyOn(this.UrlConfig, 'getAdminServiceUrl').and.returnValue('admin-url/');
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('org-id');

    this.url = 'admin-url/organizations/org-id/settings/domain';

    this.initSpies = (spies: {
      atlasJ9614SipUriRebrandingGetStatus?,
      isProd?,
      sipCloudDomain?,
    } = {}) => {
      const {
        atlasJ9614SipUriRebrandingGetStatus = this.$q.resolve(true),
        isProd = true,
        sipCloudDomain,
      } = spies;
      spyOn(this.FeatureToggleService, 'atlasJ9614SipUriRebrandingGetStatus').and.returnValue(atlasJ9614SipUriRebrandingGetStatus);
      spyOn(this.Config, 'isProd').and.returnValue(isProd);
      spyOn(this.OrgSettingsService, 'getSipCloudDomain').and.returnValue(sipCloudDomain);
    };
  });

  afterEach(function (this: Test) {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('loadSipAddressModel()', () => {
    it('should load sip address model', function (this: Test) {
      this.initSpies({
        sipCloudDomain: this.$q.resolve('sip-cloud-domain'),
      });
      let model = {} as SipAddressModel;
      this.SipAddressService.loadSipAddressModel().then(_model => model = _model);
      this.$scope.$apply();

      expect(model instanceof SipAddressModel).toBe(true);
      expect(model.sipCloudDomain).toBe('sip-cloud-domain.webex.com');
    });
  });

  describe('validateSipAddress()', () => {
    beforeEach(function (this: Test) {
      this.model = new SipAddressModel({
        atlasJ9614SipUriRebranding: true,
        isProd: true,
        sipCloudDomain: 'sip-cloud-domain.webex.com',
      });
    });

    it('should validate sip address', function (this: Test) {
      this.$httpBackend.expectPOST(this.url, {
        name: 'sip-cloud-domain.webex.com',
        isVerifyDomainOnly: true,
      }).respond({
        isDomainAvailable: true,
        isDomainInvalid: false,
      });

      let response = {} as IValidateResponse;
      this.SipAddressService.validateSipAddress(this.model).then(_response => response = _response);
      this.$httpBackend.flush();

      expect(response.isDomainAvailable).toBe(true);
      expect(response.isDomainInvalid).toBe(false);
      expect(response.model).toEqual(this.model);
      expect(response.model).not.toBe(this.model);
    });

    it('should return isDomainInvalid if http error is bad request', function (this: Test) {
      this.$httpBackend.expectPOST(this.url, {
        name: 'sip-cloud-domain.webex.com',
        isVerifyDomainOnly: true,
      }).respond(400);

      let response = {} as IValidateResponse;
      this.SipAddressService.validateSipAddress(this.model).then(_response => response = _response);
      this.$httpBackend.flush();

      expect(response.isDomainAvailable).toBe(false);
      expect(response.isDomainInvalid).toBe(true);
      expect(response.model).toEqual(this.model);
      expect(response.model).not.toBe(this.model);
    });

    it('should reject promise if any other type of http error', function (this: Test) {
      this.$httpBackend.expectPOST(this.url, {
        name: 'sip-cloud-domain.webex.com',
        isVerifyDomainOnly: true,
      }).respond(500);

      let response;
      this.SipAddressService.validateSipAddress(this.model).then(fail).catch(_response => response = _response);
      this.$httpBackend.flush();

      expect(response.status).toBe(500);
    });
  });

  describe('saveSipAddress()', () => {
    it('should save model\'s sipCloudDomain', function (this: Test) {
      const model = new SipAddressModel({
        atlasJ9614SipUriRebranding: true,
        isProd: true,
        sipCloudDomain: 'sip-cloud-domain.webex.com',
      });
      this.$httpBackend.expectPOST(this.url, {
        name: 'sip-cloud-domain.webex.com',
        isVerifyDomainOnly: false,
      }).respond({
        isDomainReserved: true,
      });

      let response = {} as ISaveResponse;
      this.SipAddressService.saveSipAddress(model).then(_response => response = _response);
      this.$httpBackend.flush();

      expect(response.isDomainReserved).toBe(true);
      expect(response.model).toEqual(model);
      expect(response.model).not.toBe(model);
    });
  });
});
