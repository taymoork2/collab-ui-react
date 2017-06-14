import privateTrunkPrereqModule from './index';

describe('Component: PrivateTrunkPrereq component', function () {
  const PRIVATE_TRUNK_PREREQ_TITLE = '#prereqTitle';
  const PRIVATE_TRUNK_PREREQ_DESC = '#prereqDesc';
  const ERROR_ICON = '.icon-error';
  const CHECK_ICON = '.icon-check';
  const BUTTON_CLOSE = 'button.btn.btn-primary';
  const UL_DOMAINLIST = 'ul.domain-list li';

  let verifiedDomain: Array<string> = [ 'verified1.ept.org', 'verified2.ept.org' ];

  beforeEach(function() {
    this.initModules(privateTrunkPrereqModule);
    this.injectDependencies('$scope', '$q', 'PrivateTrunkPrereqService', 'FeatureToggleService');

    this.getVerifiedDomainsDefer = this.$q.defer();
    spyOn(this.PrivateTrunkPrereqService, 'getVerifiedDomains').and.returnValue(this.getVerifiedDomainsDefer.promise);
    spyOn(this.FeatureToggleService, 'atlas2017NameChangeGetStatus').and.returnValue(this.$q.resolve(false));

    this.compileComponent('privateTrunkPrereq', { });
  });

  it('should have a title, description, close button', function () {
    this.getVerifiedDomainsDefer.resolve([]);
    this.$scope.$apply();
    expect(this.view.find(PRIVATE_TRUNK_PREREQ_TITLE)).toExist();
    expect(this.view.find(PRIVATE_TRUNK_PREREQ_DESC)).toExist();
    expect(this.view.find(ERROR_ICON)).toExist();
    expect(this.view.find(UL_DOMAINLIST)).not.toExist();
    expect(this.view.find(BUTTON_CLOSE)).toExist();
  });

  it('should have multiple domains', function () {
    this.getVerifiedDomainsDefer.resolve(verifiedDomain);
    this.$scope.$apply();
    expect(this.view.find(UL_DOMAINLIST).length).toBe(verifiedDomain.length);
    expect(this.view.find(CHECK_ICON)).toExist();
  });

  // 2017 name change
  it('should display new help text based on atlas2017NameChangeGetStatus', function () {
    expect(this.view.text()).toContain('servicesOverview.cards.privateTrunk.defaultTrustHelp');
    expect(this.view.text()).not.toContain('servicesOverview.cards.privateTrunk.defaultTrustHelpNew');

    this.FeatureToggleService.atlas2017NameChangeGetStatus.and.returnValue(this.$q.resolve(true));
    this.compileComponent('privateTrunkPrereq', { });
    expect(this.view.text()).toContain('servicesOverview.cards.privateTrunk.defaultTrustHelpNew');
  });
});
