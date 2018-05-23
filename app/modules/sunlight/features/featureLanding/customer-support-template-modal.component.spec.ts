import customerSupportTemplateModule from './customer-support-template-modal.component';

describe('Component: customer support template modal', () => {

  const featureIds = ['chat', 'callback', 'chatPlusCallback'];

  beforeEach(function () {
    this.initModules('Sunlight', customerSupportTemplateModule);
    this.injectDependencies(
      '$modal',
      '$scope',
      'Authinfo',
      '$state',
    );
    this.$scope.dismiss = jasmine.createSpy('dismiss');

    spyOn(this.$modal, 'open');
    spyOn(this.$state, 'go');
    spyOn(this.Authinfo, 'isCare').and.returnValue(true);
    spyOn(this.Authinfo, 'isSquaredUC').and.returnValue(true);

    this.compileComponent('customer-support-template-modal', {
      dismiss: 'dismiss()',
    });
  });

  it('feature list to have care - chat, callback and chatPlusCallback', function () {
    expect(this.controller.features.length).toEqual(featureIds.length);
  });

  // Test each known featureId
  featureIds.forEach(function (code) {
    it('ok function call for ' + code + ' results in initiating state call and then closing the care new feature Modal with the value chosen.', function () {
      this.controller.ok(code);
      expect(this.$scope.dismiss).toHaveBeenCalledWith();
      expect(this.$state.go).toHaveBeenCalledWith('care.setupAssistant', {
        type: code,
      });
    });
  });

  it('should check if Callback/Chat+Callback Card is enabled when Spark call is configured but Hybrid/EPT is not', function () {
    this.$state.isHybridToggleEnabled = false;
    this.$state.isSparkCallConfigured = true;
    this.$state.isHybridAndEPTConfigured = true;
    this.controller.$onInit();
    expect(this.controller.features[1].disabled).toBe(false);
  });

  it('should check if Callback/Chat+Callback Card is enabled when both Spark call and Hybrid/EPT is configured', function () {
    this.$state.isHybridToggleEnabled = true;
    this.$state.isSparkCallConfigured = true;
    this.$state.isHybridAndEPTConfigured = false;
    this.controller.$onInit();
    expect(this.controller.features[1].disabled).toBe(false);
  });

  it('should return true if Spark call is configured and Hybrid/EPT is not', function () {
    this.$state.isSparkCallConfigured = true;
    this.$state.isHybridAndEPTConfigured = false;
    this.controller.isHybridOrSparkCallEnabled();
    expect(this.controller.isHybridOrSparkCallEnabled()).toBe(true);
  });

  it('should return true if both Spark call and Hybrid/EPT is configured', function () {
    this.$state.isSparkCallConfigured = true;
    this.$state.isHybridAndEPTConfigured = true;
    this.controller.isHybridOrSparkCallEnabled();
    expect(this.controller.isHybridOrSparkCallEnabled()).toBe(true);
  });

  it('should return false if both Spark call and Hybrid/EPT is not configured', function () {
    this.$state.isSparkCallConfigured = false;
    this.$state.isHybridAndEPTConfigured = false;
    this.controller.isHybridOrSparkCallEnabled();
    expect(this.controller.isHybridOrSparkCallEnabled()).toBe(false);
  });

  it('learnMoreLink function call for opening the care voice features Modal.', function () {
    this.controller.learnMoreLink();
    expect(this.$scope.dismiss).not.toHaveBeenCalled();
    expect(this.$modal.open).toHaveBeenCalledWith({
      template: '<care-voice-features-modal dismiss="$dismiss()" class="care-modal"></care-voice-features-modal>',
    });
  });
});
