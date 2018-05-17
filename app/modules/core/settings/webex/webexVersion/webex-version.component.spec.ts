import testModule from './index';

describe('WebexVersionSetting Component', function () {
  const clientVersionsFixture = { clientVersions: [ '31.11.10', '31.11.2'] };
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$componentController',
      '$translate',
      'WebexClientVersion',
      'Authinfo',
      'Notification',
    );
    spyOn(this.WebexClientVersion, 'getWbxClientVersions').and.returnValue(this.$q.resolve(clientVersionsFixture.clientVersions));
    spyOn(this.WebexClientVersion, 'getPartnerIdGivenOrgId').and.returnValue(this.$q.resolve({}));
    spyOn(this.WebexClientVersion, 'postOrPutTemplate').and.returnValue(this.$q.resolve({}));
  });

  function initComponent() {
    this.compileComponent('webexVersionSetting', {});
  }

  describe('upon controller initialization', function () {
    beforeEach(initComponent);

    it('should return Webex Client Versions data', function () {
      expect(this.WebexClientVersion.getWbxClientVersions).toHaveBeenCalled();
      expect(this.controller.wbxclientversions).toEqual(clientVersionsFixture.clientVersions);
      expect(this.WebexClientVersion.getPartnerIdGivenOrgId).toHaveBeenCalled();
    });
  });

  describe('on selection change and toggle client versions', function () {
    beforeEach(initComponent);

    it('wbxclientversionselectchanged function should fire and call postOrPutTemplate', function () {
      this.controller.wbxclientversionselectchanged();
      expect(this.WebexClientVersion.postOrPutTemplate).toHaveBeenCalled();
    });

    it('wbxclientversionselectchanged function should fire and call postOrPutTemplate', function () {
      this.controller.toggleWebexSelectLatestVersionAlways();
      expect(this.WebexClientVersion.postOrPutTemplate).toHaveBeenCalled();
    });
  });
});
