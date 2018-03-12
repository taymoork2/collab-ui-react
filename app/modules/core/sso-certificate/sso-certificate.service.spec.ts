import ssoCertificateModuleName from './index';
import { SsoCertificateService } from './sso-certificate.service';
import { Notification } from 'modules/core/notifications';

import 'moment';
import 'moment-timezone';

type Test = atlas.test.IServiceTest<{
  Authinfo;
  UrlConfig;
  Notification: Notification;
  SsoCertificateService: SsoCertificateService;
}>;

describe('Service: SsoCertificateService', () => {

  beforeEach(function (this: Test) {
    this.initModules(ssoCertificateModuleName);
    this.injectDependencies(
      'Authinfo',
      'UrlConfig',
      'Notification',
      'SsoCertificateService',
    );

    this.certificateTestData = _.cloneDeep(getJSONFixture('core/json/sso/test-certificates.json'));

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('123');
    this.SSO_CERTIFICATE_URL = `${this.UrlConfig.getSSOSetupUrl()}v1/keys`;
    this.SSO_ORG_CERTIFICATE_URL = `${this.UrlConfig.getSSOSetupUrl()}${this.Authinfo.getOrgId()}/v1`;

    installPromiseMatchers();

    moment.tz.setDefault('America/Los_Angeles');
  });

  afterEach(function (this: Test) {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('SSO Certificate Update', () => {
    it('should get all CI certificates', function (this: Test) {
      this.$httpBackend.expectGET(this.SSO_CERTIFICATE_URL).respond({
        keys: this.certificateTestData.ciCertificates,
      });
      expect(this.SsoCertificateService.getAllCiCertificates()).toBeResolvedWith(this.certificateTestData.ciCertificates);
    });

    it('should get org certificates', function (this: Test) {
      this.$httpBackend.expectGET(`${this.SSO_ORG_CERTIFICATE_URL}/keys`).respond({
        keys: this.certificateTestData.orgCertificates,
      });
      expect(this.SsoCertificateService.getOrgCertificates()).toBeResolvedWith(this.certificateTestData.orgCertificates);
    });

    it('should download CI metadata', function (this: Test) {
      this.$httpBackend.expectGET(`${this.SSO_ORG_CERTIFICATE_URL}/samlmetadata/hosted/sp?returnLatestCert=false`).respond(this.certificateTestData.ciMetadata);
      expect(this.SsoCertificateService.downloadMetadata(true)).toBeResolvedWith(this.certificateTestData.ciMetadata.metadataXml);
    });

    it('should download org Idp metadata', function (this: Test) {
      this.$httpBackend.expectGET(`${this.SSO_ORG_CERTIFICATE_URL}/samlmetadata/remote/idp?attributes=id&attributes=entityId`).respond(this.certificateTestData.orgIdpMetadataUrl);
      this.$httpBackend.expectGET(`${this.SSO_ORG_CERTIFICATE_URL}/samlmetadata/remote/idp/123`).respond(this.certificateTestData.orgIdpMetadataData);
      expect(this.SsoCertificateService.downloadIdpMetadata()).toBeResolvedWith(this.certificateTestData.orgIdpMetadataData);
    });

    it('should patch new certificate', function (this: Test) {
      this.$httpBackend.expectPATCH(
        `${this.SSO_ORG_CERTIFICATE_URL}/samlmetadata/hosted/sp`,
        this.certificateTestData.patchCertificate,
      ).respond(this.certificateTestData.orgIdpMetadataData);
      expect(this.SsoCertificateService.updateMetadata(this.certificateTestData.patchCertificate)).toBeResolvedWith(this.certificateTestData.orgIdpMetadataData);
    });

    it('should add the latest certificate to the org', function (this: Test) {
      this.$httpBackend.expectGET(this.SSO_CERTIFICATE_URL).respond({
        keys: this.certificateTestData.ciCertificates,
      });
      this.SsoCertificateService.getAllCiCertificates();

      this.$httpBackend.expectGET(`${this.SSO_ORG_CERTIFICATE_URL}/keys`).respond({
        keys: this.certificateTestData.orgCertificates,
      });
      this.$httpBackend.expectPATCH(
        `${this.SSO_ORG_CERTIFICATE_URL}/samlmetadata/hosted/sp`,
        this.certificateTestData.patchCertificate,
      ).respond(this.certificateTestData.orgIdpMetadataData);

      const promise = this.SsoCertificateService.addLatestCertificateToOrg();
      expect(promise).toBeResolvedWith(this.certificateTestData.orgIdpMetadataData);
    });

    it('should switch to the new certificate', function (this: Test) {
      this.$httpBackend.expectPATCH(
        `${this.SSO_ORG_CERTIFICATE_URL}/samlmetadata/hosted/sp`,
        this.certificateTestData.switchPrimaryCertificate,
      ).respond(this.certificateTestData.orgIdpMetadataData);
      expect(this.SsoCertificateService.updateMetadata(this.certificateTestData.switchPrimaryCertificate)).toBeResolvedWith(this.certificateTestData.orgIdpMetadataData);
    });
  });
});
