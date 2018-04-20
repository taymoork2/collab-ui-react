import careHybridFeatureModule from './care-hybrid-feature-modal.component';

describe('Component:care hybrid feature modal', () => {

  beforeEach(function () {
    this.initModules('Sunlight', careHybridFeatureModule);
    this.injectDependencies('$modal', '$scope', 'Authinfo', '$state');
    this.$scope.dismiss = jasmine.createSpy('dismiss');

    spyOn(this.$modal, 'open');
    spyOn(this.Authinfo, 'isCare').and.returnValue(true);

    this.compileComponent('care-hybrid-feature-modal', { dismiss: 'dismiss()' });
  });

  it('feature list to have web template and AA template only', function () {
    this.compileComponent('care-hybrid-feature-modal', { dismiss: 'dismiss()' });
    expect(this.controller.features.length).toEqual(2);
  });

  it('should check AutoAttendant card to be in disabled state when neither Spark call nor Hybrid/EPT configured', function () {
    this.$state.isSparkCallConfigured = false;
    this.$state.isHybridAndEPTConfigured = false;
    this.compileComponent('care-hybrid-feature-modal', { dismiss: 'dismiss()' });
    expect(this.controller.features[1].disabled).toBe(true);
  });

  it('should check AutoAttendant card to be in enabled state when Spark call is configured but Hybrid/EPT not', function () {
    this.$state.isSparkCallConfigured = true;
    this.$state.isHybridAndEPTConfigured = false;
    this.compileComponent('care-hybrid-feature-modal', { dismiss: 'dismiss()' });
    expect(this.controller.features[1].disabled).toBe(false);
  });

  it('should check AutoAttendant card to be in enabled state when Spark call is not configured but Hybrid/EPT is configured', function () {
    this.$state.isSparkCallConfigured = false;
    this.$state.isHybridAndEPTConfigured = true;
    this.compileComponent('care-hybrid-feature-modal', { dismiss: 'dismiss()' });
    expect(this.controller.features[1].disabled).toBe(false);
  });

  it('ok function call for for web template results in initiating state call and then closing the care new feature Modal with the value chosen.', function () {
    this.controller.ok('webTemplate');
    expect(this.$scope.dismiss).toHaveBeenCalledWith();
    expect(this.$modal.open).toHaveBeenCalledWith({
      template: '<customer-support-template-modal dismiss="$dismiss()" class="care-modal"></customer-support-template-modal>',
    });
  });

  it('learnMoreLink function call for opening the care voice features Modal.', function () {
    this.controller.learnMoreLink();
    expect(this.$scope.dismiss).not.toHaveBeenCalled();
    expect(this.$modal.open).toHaveBeenCalledWith({
      template: '<care-voice-features-modal dismiss="$dismiss()" class="care-modal"></care-voice-features-modal>',
    });
  });
});
