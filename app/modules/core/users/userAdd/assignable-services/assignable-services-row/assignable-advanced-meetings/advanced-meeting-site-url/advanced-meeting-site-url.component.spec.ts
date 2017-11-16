import moduleName from './index';

describe('Component: advancedMeetingSiteUrl:', () => {
  beforeEach(function() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
      'WebExUtilsFact',
    );
  });

  describe('primary behaviors (view):', () => {
    it('should render a site url as plain text if it is a CI site, or as a link to a respective site admin url otherwise', function () {
      this.compileTemplate('<advanced-meeting-site-url site-url="fake-site-url"></advanced-meeting-site-url>');
      this.controller = this.view.controller('advanced-meeting-site-url');
      expect(this.view.find('.license__siteUrl').length).toBe(1);
      expect(this.view.find('.license__siteUrl span[ng-if="$ctrl.isCISite"]').length).toBe(1);

      this.controller.isCISite = false;
      this.controller.siteAdminUrl = 'fake-site-admin-url';
      this.$scope.$apply();
      expect(this.view.find('.license__siteUrl span[ng-if="!$ctrl.isCISite"]').length).toBe(1);
      expect(this.view.find('.license__siteUrl a[id="fake-site-url_siteAdminUrl"]').length).toBe(1);
      expect(this.view.find('.license__siteUrl a[href="fake-site-admin-url"]').length).toBe(1);
    });
  });

  describe('primary behaviors (controller):', () => {
    it('should set "isCISite" and "siteAdminUrl" properties according to "WebExUtilsFact.isCIEnabledSite()" and "WebExUtilsFact.getSiteAdminUrl()"', function () {
      spyOn(this.WebExUtilsFact, 'isCIEnabledSite').and.returnValue(true);
      spyOn(this.WebExUtilsFact, 'getSiteAdminUrl').and.returnValue('fake-site-admin-url');
      this.compileComponent('advancedMeetingSiteUrl', {
        siteUrl: 'fake-site-url',
      });
      expect(this.controller.isCISite).toBe(true);
      expect(this.controller.siteAdminUrl).toBe('');

      this.WebExUtilsFact.isCIEnabledSite.and.returnValue(false);
      this.compileComponent('advancedMeetingSiteUrl', {
        siteUrl: 'fake-site-url',
      });
      expect(this.controller.isCISite).toBe(false);
      expect(this.controller.siteAdminUrl).toBe('fake-site-admin-url');
    });
  });
});
