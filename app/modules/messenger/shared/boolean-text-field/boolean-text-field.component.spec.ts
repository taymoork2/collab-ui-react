import moduleName from './index';

describe('Component: BooleanTextFieldComponent:', () => {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
    );
  });

  it('should render the element with the appropriate content', function () {
    this.$scope.flag = true;
    this.compileComponent('booleanTextField', {
      ngModel: 'flag',
    });
    expect(this.view.html()).toContain('common.status');
    expect(this.view.html()).toContain('common.on');

    this.$scope.flag = false;
    this.compileComponent('booleanTextField', {
      ngModel: 'flag',
    });
    expect(this.view.html()).toContain('common.status');
    expect(this.view.html()).toContain('common.off');

    delete this.$scope.flag;
    this.compileComponent('booleanTextField', {
      label: 'fake-pretranslated-label',
      ngModel: 'flag',
    });
    expect(this.view.html()).toContain('fake-pretranslated-label');
    expect(this.view.html()).toContain('common.off');
  });
});
