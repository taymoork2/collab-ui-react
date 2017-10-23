import privateTrunkPrereqModule from './index';

describe('Component: PrivateTrunkPrereq component', function () {
  const PRIVATE_TRUNK_PREREQ_TITLE = '#prereqTitle';
  const PRIVATE_TRUNK_PREREQ_DESC = '#prereqDesc';
  const WARNING_ICON = '.icon-warning';
  const CHECK_ICON = '.icon-check';
  const BUTTON_CLOSE = 'button.btn.btn-primary';
  const UL_DOMAINLIST = 'span#manyDomains';

  const verifiedDomain: string[] = [ 'verified1.ept.org', 'verified2.ept.org' ];

  beforeEach(function() {
    this.initModules(privateTrunkPrereqModule);
    this.injectDependencies('$scope', '$q', 'PrivateTrunkPrereqService', 'HybridServicesPrerequisitesHelperService');

    this.getVerifiedDomainsDefer = this.$q.defer();
    spyOn(this.PrivateTrunkPrereqService, 'getVerifiedDomains').and.returnValue(this.getVerifiedDomainsDefer.promise);
    spyOn(this.HybridServicesPrerequisitesHelperService, 'readFlags').and.returnValue(this.$q.resolve({}));

    this.compileComponent('privateTrunkPrereq', { });
  });

  it('should have a title, description, close button', function () {
    this.getVerifiedDomainsDefer.resolve([]);
    this.$scope.$apply();
    expect(this.view.find(PRIVATE_TRUNK_PREREQ_TITLE)).toExist();
    expect(this.view.find(PRIVATE_TRUNK_PREREQ_DESC)).toExist();
    expect(this.view.find(WARNING_ICON)).toExist();
    expect(this.view.find(UL_DOMAINLIST)).not.toExist();
    expect(this.view.find(BUTTON_CLOSE)).toExist();
  });

  it('should have multiple domains', function () {
    this.getVerifiedDomainsDefer.resolve(verifiedDomain);
    this.$scope.$apply();
    expect(this.view.find(UL_DOMAINLIST).length).toExist();
    expect(this.view.find(CHECK_ICON)).toExist();
  });

  it('should get verified domains and get existing flags when initializing', function () {
    this.$scope.$apply();
    expect(this.HybridServicesPrerequisitesHelperService.readFlags.calls.count()).toBe(1);
    expect(this.HybridServicesPrerequisitesHelperService.readFlags).toHaveBeenCalledWith(jasmine.any(Object), 'atlas.hybrid.ept.setup.', jasmine.any(Object));
    expect(this.PrivateTrunkPrereqService.getVerifiedDomains.calls.count()).toBe(1);
  });

});
