import testModule from './index';

describe('Component: linkedSitesGotoWebex', () => {

  beforeEach(function () {
    this.initModules(testModule);

    this.injectDependencies(
      '$componentController',
    );
  });

  describe('at startup', () => {

    beforeEach(function () {
      this.controller = this.$componentController('linkedSitesGotoWebex', {
      }, {});
    });

    it('has url to WebEx Site Admin main page', function() {
      const siteUrl = 'whatever.at.wherever';
      const toSiteListPage = true;
      const webexSiteAdminUrl = this.controller.assembleLinkToWebExSiteAdmin(siteUrl, toSiteListPage);
      expect(webexSiteAdminUrl).toEqual('https://whatever.at.wherever/wbxadmin/default.do?siteurl=whatever&mainPage=accountlinking.do');
    });

    it('has url to WebEx Site Admin accountlinking subpage', function() {
      const siteUrl = 'whatever.at.wherever';
      const toSiteListPage = false;
      const webexSiteAdminUrl = this.controller.assembleLinkToWebExSiteAdmin(siteUrl, toSiteListPage);
      expect(webexSiteAdminUrl).toEqual('https://whatever.at.wherever/wbxadmin/default.do?siteurl=whatever');
    });

  });

});
