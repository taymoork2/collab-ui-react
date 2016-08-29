describe('component: internationalDialingComp', () => {
  const INT_DIAL_SELECT = '.csSelect-container[name="internationalDialing"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li a';
  const BUTTON_RESET = 'button.btn-default';

  beforeEach(function() {
    this.initModules('huron.international-dialing');
    this.injectDependencies('$scope', '$timeout');
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
    this.compileComponent('internationalDialingComp', { });
  });

  it('should have international dialing selection with options', function() {
    expect(this.view.find(INT_DIAL_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('internationalDialingPanel.useGlobal');
    expect(this.view.find(INT_DIAL_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('internationalDialingPanel.alwaysAllow');
    expect(this.view.find(INT_DIAL_SELECT).find(DROPDOWN_OPTIONS).get(2)).toHaveText('internationalDialingPanel.neverAllow');
    expect(this.view.find(BUTTON_RESET)).not.toExist();
  });

  it('selection should show save and reset buttons', function() {
    this.view.find(INT_DIAL_SELECT).find(DROPDOWN_OPTIONS).get(2).click();
    expect(this.view.find(BUTTON_RESET)).toExist();
  });
    
});