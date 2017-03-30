import privateTrunkPrereqModule from './index';
describe('Component: PrivateTrunkPrereq component', () => {
  const PRIVATE_TRUNK_PREREQ_TITLE = '#prereqTitle';
  const PRIVATE_TRUNK_PREREQ_DESC = '#prereqDesc';
  const ERROR_ICON = '.icon-error';
  const CHECK_ICON = '.icon-check';
  const BUTTON_CLOSE = 'button.btn.btn-primary';
  const UL_DOMAINLIST = 'ul.domainlist li';

  let verifiedDomain: Array<string> = [ 'verified1.ept.org', 'verified2.ept.org' ];

  beforeEach(function() {
    this.initModules(privateTrunkPrereqModule);
    this.injectDependencies(
      '$scope',
      '$q',
      'PrivateTrunkPrereqService',
    );
    this.getVerifiedDomainsDefer = this.$q.defer();
    spyOn(this.PrivateTrunkPrereqService, 'getVerifiedDomains').and.returnValue(this.getVerifiedDomainsDefer.promise);
    this.compileComponent('privateTrunkPrereq', {
    });

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

});
