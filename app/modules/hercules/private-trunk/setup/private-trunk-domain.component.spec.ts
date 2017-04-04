import privateTrunkDomainModule from './index';
describe('Component: PrivateTrunkDomain component', () => {
  const RADIO_OPTION1 = '#domainRadio1';
  const RADIO_OPTION2 = '#domainRadio2';
  const MULTI_SELECT = 'a.form-control';

  let verifiedDomain: Array<string> = [ 'verified1.ept.org' ];
  let options = [{
    value: 'verified1.ept.org',
    label: 'verified1.ept.org',
    isSelected: true,
  }];

  beforeEach(function() {
    this.initModules(privateTrunkDomainModule);
    this.injectDependencies(
      '$scope',
      '$translate',
    );
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
    this.compileComponent('privateTrunkDomain', {
      domainSelected: 'selected',
      domains: 'verifiedDomain',
      isDomain: true,
      onChangeFn: 'onChangeFn(selected)',
    });

  });

  it('should have both radio buttons for Domain Selection', function () {
    expect(this.view).toContainElement(RADIO_OPTION1);
    expect(this.view).toContainElement(RADIO_OPTION2);
  });

  it('should have selected the option for verified domain', function () {
    this.$scope.domains = verifiedDomain;
    this.$scope.domainSelected = [];
    this.$scope.domainOptions = options;
    this.$scope.$apply();
    expect(this.view).toContainElement(RADIO_OPTION1);
    this.view.find(RADIO_OPTION1).click().click();
    expect(this.view.find(RADIO_OPTION1)).toBeChecked();
  });

  it('should have selected the option for no verified domain', function () {
    this.$scope.domains = [];
    this.$scope.$apply();
    expect(this.view).toContainElement(RADIO_OPTION2);
    this.view.find(RADIO_OPTION2).click().click();
    expect(this.view.find(RADIO_OPTION2)).toBeChecked();
    expect(this.view).not.toContainElement(MULTI_SELECT);
  });
});
