import careFeatureModule from './care-feature-modal.component';

describe('Component: care feature modal', () => {

  beforeEach(function () {
    this.initModules('Sunlight', careFeatureModule);
    this.injectDependencies('$modal', '$scope', 'Authinfo', '$state');
    this.$scope.dismiss = jasmine.createSpy('dismiss');
    this.$state.isVirtualAssistantEnabled = true;
    this.$state.isAppleBusinessChatEnabled = true;

    spyOn(this.$modal, 'open');
    spyOn(this.Authinfo, 'isCare').and.returnValue(true);

    this.compileComponent('care-feature-modal', { dismiss: 'dismiss()' });
  });

  it('should only have Customer Support Template when VA and ABC are disabled', function () {
    this.$state.isVirtualAssistantEnabled = false;
    this.$state.isAppleBusinessChatEnabled = false;
    this.compileComponent('care-feature-modal', { dismiss: 'dismiss()' });
    expect(this.controller.features.length).toEqual(1);
  });

  it('should have Customer Support Template and Virtual Assistant when ABC is disabled', function () {
    this.$state.isAppleBusinessChatEnabled = false;
    this.compileComponent('care-feature-modal', { dismiss: 'dismiss()' });
    expect(this.controller.features.length).toEqual(2);
  });

  it('should have Customer Support Template, Apple Business Chat and Virtual Assistant if everything is enabled', function () {
    expect(this.controller.features.length).toEqual(3);
  });

  it('should open up customer support template when click on Customer Support Template card', function () {
    this.controller.ok('customerSupportTemplate');
    expect(this.$scope.dismiss).toHaveBeenCalledWith();
    expect(this.$modal.open).toHaveBeenCalledWith({
      template: '<customer-support-template-modal dismiss="$dismiss()" class="care-modal"></customer-support-template-modal>',
    });
  });

  it('should open up Virtual Assistant when click on Virtual Assistant card', function () {
    this.controller.ok('virtualAssistant');
    expect(this.$scope.dismiss).toHaveBeenCalledWith();
    expect(this.$modal.open).toHaveBeenCalledWith({
      template: '<virtual-assistant-modal dismiss="$dismiss()" class="care-modal"></virtual-assistant-modal>',
    });
  });

  it('should open up customer support template with hybrid enabled when click on Customer Support Template card with hybrid toggle is enabled', function () {
    this.$state.isHybridToggleEnabled = true;
    this.controller.ok('customerSupportTemplate');
    expect(this.$scope.dismiss).toHaveBeenCalledWith();
    expect(this.$modal.open).toHaveBeenCalledWith({
      template: '<care-hybrid-feature-modal dismiss="$dismiss()" class="care-modal"></care-hybrid-feature-modal>',
    });
  });
});
