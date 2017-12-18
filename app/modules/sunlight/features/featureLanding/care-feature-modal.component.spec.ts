import careFeatureModule from './care-feature-modal.component';

describe('Component: care feature modal', () => {

  beforeEach(function () {
    this.initModules('Sunlight', careFeatureModule);
    this.injectDependencies('$modal', '$scope', 'Authinfo', '$state');
    this.$scope.dismiss = jasmine.createSpy('dismiss');
    this.$state.isVirtualAssistantEnabled = true;

    spyOn(this.$modal, 'open');
    spyOn(this.Authinfo, 'isCare').and.returnValue(true);

    this.compileComponent('care-feature-modal', { dismiss: 'dismiss()' });
  });

  it('feature list to have care - Customer Support Template only', function () {
    this.$state.isVirtualAssistantEnabled = false;
    this.compileComponent('care-feature-modal', { dismiss: 'dismiss()' });
    expect(this.controller.features.length).toEqual(1);
  });

  it('virtualAssistant Enabled feature list to have care - Customer Support Template and Virtual Assistant', function () {
    expect(this.controller.features.length).toEqual(2);
  });

  it('atlasHybid Enabled feature list to have care - Customer Support Template, Auto Attendant and Virtual Assistant', function () {
    this.$state.isHybridEnabled = true;
    this.compileComponent('care-feature-modal', { dismiss: 'dismiss()' });
    expect(this.controller.features.length).toEqual(3);
  });

  it('ok function call for for customer support template results in initiating state call and then closing the care new feature Modal with the value chosen.', function () {
    this.controller.ok('customerSupportTemplate');
    expect(this.$scope.dismiss).toHaveBeenCalledWith();
    expect(this.$modal.open).toHaveBeenCalledWith({
      template: '<customer-support-template-modal dismiss="$dismiss()" class="care-modal"></customer-support-template-modal>',
    });
  });

  it('ok function call for for VirtualAssistant with virtual assistant enabled results in initiating state call and then closing the care new feature Modal with the value chosen.', function () {
    this.controller.ok('virtualAssistant');
    expect(this.$scope.dismiss).toHaveBeenCalledWith();
    expect(this.$modal.open).toHaveBeenCalledWith({
      template: '<virtual-assistant-modal dismiss="$dismiss()" class="care-modal"></virtual-assistant-modal>',
    });
  });
});
