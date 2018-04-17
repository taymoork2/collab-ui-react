import careVoiceFeaturesModule from './care-voice-features-modal.component';

describe('Component:care voice features modal', () => {

  beforeEach(function () {
    this.initModules('huron', careVoiceFeaturesModule);
    this.injectDependencies('$modalStack', '$state');
    this.$scope.dismiss = jasmine.createSpy('dismiss');

    spyOn(this.$state, 'go');

    this.compileComponent('care-voice-features-modal', { dismiss: 'dismiss()' });
  });

  it('feature list to enable spark call and use hybrid call options', function () {
    this.compileComponent('care-voice-features-modal', { dismiss: 'dismiss()' });
    expect(this.controller.features.length).toEqual(2);
  });

  it('services-overview page after clicking on hybrid setup options on care voice feature page', function () {
    this.controller.hybridLink();
    expect(this.$state.go).toHaveBeenCalledWith('services-overview');
  });
});
