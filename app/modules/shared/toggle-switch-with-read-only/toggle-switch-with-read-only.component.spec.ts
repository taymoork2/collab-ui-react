import moduleName from './index';
import booleanTextFieldModuleName from '../boolean-text-field';
import toggleSwitchModuleName from '@collabui/collab-ui-ng/src/components/toggleswitch';

describe('Component: ToggleSwitchWithReadOnly:', () => {

  beforeEach(function () {
    this.initModules(
      moduleName,
      booleanTextFieldModuleName,
      toggleSwitchModuleName,
    );
    this.injectDependencies(
      '$scope',
    );
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
  });

  function initComponent() {
    this.compileComponent('toggle-switch-with-read-only', {
      isReadOnly: 'isReadOnly',
      value: 'isFakeToggleTrue',
      toggleId: 'fake-toggle-1',
      onChangeFn: 'onChangeFn(toggleValue)',
    });
  }

  it('replaces the element with the appropriate content', function () {
    // render 'boolean-text-field' element if read-only
    this.$scope.isReadOnly = true;
    this.$scope.isFakeToggleTrue = true;
    initComponent.call(this);
    expect(this.view).toContainElement('boolean-text-field');

    // render 'cs-toggle-switch' element if editable
    // - because 'cs-toggle-switch' is a directive that uses { replace: true }, we look for the
    //   rendered 'input' element instead
    this.$scope.isReadOnly = false;
    this.$scope.isFakeToggleTrue = true;
    this.$scope.$apply();
    expect(this.view).toContainElement('input#fake-toggle-1');
  });

  it('should invoke the output binding handler on click, with the opposite value of its current value', function () {
    this.$scope.isReadOnly = false;
    this.$scope.isFakeToggleTrue = true;
    const newToggleValue = !this.$scope.isFakeToggleTrue;
    initComponent.call(this);
    this.view.find('input#fake-toggle-1').click();
    expect(this.$scope.onChangeFn).toHaveBeenCalledWith(newToggleValue);
  });
});
