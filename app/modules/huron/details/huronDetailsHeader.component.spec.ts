import huronDetailsHeaderModule from './index';

describe ('Component: huronDetailsHeader', () => {
  const PAGE_HEADER_TITLE = '.page-header__title';
  const PAGE_HEADER_NAV_LINKS = '.page-header__right ul li a';

  beforeEach(function() {
    this.initModules(huronDetailsHeaderModule);
    this.injectDependencies(
      '$scope',
      'Authinfo',
      '$httpBackend',
      '$q',
      'FeatureToggleService',
    );

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('1');
    spyOn(this.Authinfo, 'getLicenses');
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(false));

    this.$httpBackend.whenGET('https://identity.webex.com/identity/scim/1/v1/Users/me').respond(200);
  });

  function initComponent() {
    this.compileComponent('ucHuronDetailsHeader', {});
  }

  describe('show detail header with COMMUNICATION license', () => {
    beforeEach(function() {
      this.Authinfo.getLicenses.and.returnValue([{
        licenseType: 'COMMUNICATION',
      }]);
    });
    beforeEach(initComponent);

    it('should have a cs-page-header tag', function() {
      expect(this.view).toContainElement('cs-page-header');
    });

    it('should have header title', function() {
      expect(this.view.find(PAGE_HEADER_TITLE)).toHaveText('huronDetails.title');
    });

    it('should have three nav links', function() {
      expect(this.view.find(PAGE_HEADER_NAV_LINKS).get(0)).toHaveText('huronDetails.linesTitle');
      expect(this.view.find(PAGE_HEADER_NAV_LINKS).get(1)).toHaveText('huronDetails.featuresTitle');
      expect(this.view.find(PAGE_HEADER_NAV_LINKS).get(2)).toHaveText('huronDetails.settingsTitle');
    });
  });

  describe('show detail header WITHOUT COMMUNICATION license', () => {
    beforeEach(function() {
      this.Authinfo.getLicenses.and.returnValue([{
        licenseType: 'CONFERENCING',
      }]);
    });
    beforeEach(initComponent);

    it('should have two nav links', function() {
      expect(this.view.find(PAGE_HEADER_NAV_LINKS).get(0)).toHaveText('huronDetails.linesTitle');
      expect(this.view.find(PAGE_HEADER_NAV_LINKS).get(1)).toHaveText('huronDetails.settingsTitle');
    });
  });

});
