import privateTrunkDomainModule from './index';
describe('Component: PrivateTrunkDomain component', () => {
  const RADIO_OPTION1 = '#domainRadio1';
  const RADIO_OPTION2 = '#domainRadio2';
  const MULTI_SELECT = 'a.form-control';
  const CHECK_BOX = 'cs-checkbox';

  let verifiedDomain: Array<string> = [ 'verified1.ept.org' ];
  let selected: Array<string> = ['verified1.ept.org'];

  beforeEach(function() {
    this.initModules(privateTrunkDomainModule);
    this.injectDependencies(
      '$scope',
      '$q',
      'PrivateTrunkPrereqService',
      '$translate',
    );
    this.getVerifiedDomainsDefer = this.$q.defer();
    spyOn(this.PrivateTrunkPrereqService, 'getVerifiedDomains').and.returnValue(this.getVerifiedDomainsDefer.promise);
    this.compileComponent('privateTrunkDomain', {
      selected: selected,
      onChangeFn: 'onChangeFn(selected)',
    });

  });

  it('should have both radio buttons for Domain Selection', function () {
    expect(this.view).toContainElement(RADIO_OPTION1);
    expect(this.view).toContainElement(RADIO_OPTION2);
  });

  it('should have selected the option for verified domain and a domain', function () {
    this.getVerifiedDomainsDefer.resolve(verifiedDomain);
    this.$scope.$apply();
    expect(this.view).toContainElement(RADIO_OPTION1);
    this.view.find(RADIO_OPTION1).click().click();
    expect(this.view.find(RADIO_OPTION1)).toBeChecked();
    this.view.find(MULTI_SELECT).click().click();
    expect(this.view.find(CHECK_BOX).get(0)).toExist();
    this.view.find(CHECK_BOX).get(0).click();
    expect(this.view.find(CHECK_BOX).get(0)).not.toBeDisabled();
  });

  it('should have selected the option for no verified domain', function () {
    this.getVerifiedDomainsDefer.resolve(verifiedDomain);
    this.$scope.$apply();
    expect(this.view).toContainElement(RADIO_OPTION2);
    this.view.find(RADIO_OPTION2).click().click();
    expect(this.view.find(RADIO_OPTION2)).toBeChecked();
    expect(this.view).not.toContainElement(MULTI_SELECT);
  });
});
