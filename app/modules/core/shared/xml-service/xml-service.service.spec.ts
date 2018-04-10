import testModule from './index';
import { XmlService } from './xml-service.service';

type Test = atlas.test.IServiceTest<{
  XmlService: XmlService,
}>;

describe('XmlService:', () => {
  beforeEach(function (this: Test) {
    this.initModules(testModule);
    this.injectDependencies(
      'XmlService',
    );

    this.certificateTestData = _.cloneDeep(getJSONFixture('core/json/sso/test-certificates.json'));
  });

  describe('function filterKeyInXml', () => {
    it('should pass with a valid Metadata XML', function (this: Test) {
      const idpMetadataXml = this.certificateTestData.idpMetadataXml;
      const ssoServices = this.XmlService.filterKeyInXml(idpMetadataXml, 'SingleSignOnService');
      expect(_.size(ssoServices)).toBe(2);
      expect(ssoServices[0]['_Binding']).toBe('urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect');
    });
  });
});
