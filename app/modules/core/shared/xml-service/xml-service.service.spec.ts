import testModule from './index';
import { XmlService } from './xml-service.service';

type Test = atlas.test.IServiceTest<{
  XmlService: XmlService,
}>;

describe('XmlService:', () => {
  const certificateTestData = _.cloneDeep(getJSONFixture('core/json/sso/test-certificates.json'));

  beforeEach(function (this: Test) {
    this.initModules(testModule);
    this.injectDependencies(
      'XmlService',
    );
  });

  describe('function filterKeyInXml', () => {
    it('should pass with a valid Metadata XML', function (this: Test) {
      const idpMetadataXml = certificateTestData.idpMetadataXml;
      const ssoServices = this.XmlService.filterKeyInXml(idpMetadataXml, 'SingleSignOnService');
      expect(_.size(ssoServices)).toBe(2);
      expect(ssoServices[0]['_Binding']).toBe('urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect');
    });
  });

  describe('function getReqBinding', () => {
    it('should pass with a valid Metadata XML', function (this: Test) {
      const idpMetadataXml = certificateTestData.idpMetadataXml;
      const reqBinding = this.XmlService.getReqBinding(idpMetadataXml);
      expect(reqBinding).toBe('&reqBinding=urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST');
    });
  });
});
