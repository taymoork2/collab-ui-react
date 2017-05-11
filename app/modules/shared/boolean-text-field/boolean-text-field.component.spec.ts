import moduleName from './index';

describe('Component: BooleanTextFieldComponent:', () => {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
    );
  });

  it('should render the element with the appropriate content', function () {
    // - no label value? no problem, label should be 'Status'
    // - set toggle value to true, text should be 'On'
    this.$scope.isFakeToggleTrue = true;
    this.compileComponent('booleanTextField', {
      value: 'isFakeToggleTrue',
    });
    expect(this.view.html()).toContain('common.status');
    expect(this.view.html()).toContain('common.on');

    // - set toggle value to false, text should be 'Off'
    this.$scope.isFakeToggleTrue = false;
    this.$scope.$apply();
    expect(this.view.html()).toContain('common.status');
    expect(this.view.html()).toContain('common.off');

    // - pretranslated label is rendered if provided
    // - no toggle value set? text should be 'Off'
    delete this.$scope.isFakeToggleTrue;
    this.compileComponent('booleanTextField', {
      label: 'fake-pretranslated-label',
      value: 'isFakeToggleTrue',
    });
    expect(this.view.html()).toContain('fake-pretranslated-label');
    expect(this.view.html()).toContain('common.off');
  });
});
