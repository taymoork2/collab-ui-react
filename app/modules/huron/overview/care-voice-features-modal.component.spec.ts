import careVoiceFeaturesModule from './care-voice-features-modal.component';

describe('Component:care voice features modal', () => {

  beforeEach(function () {
    this.initModules('huron', careVoiceFeaturesModule);
    this.injectDependencies('$modal', '$state');
    this.$scope.dismiss = jasmine.createSpy('dismiss');

    spyOn(this.$modal, 'open');

    this.compileComponent('care-voice-features-modal', { dismiss: 'dismiss()' });
  });

  it('feature list to have enable spark call and use hybrid call options', function () {
    this.compileComponent('care-voice-features-modal', { dismiss: 'dismiss()' });
    expect(this.controller.features.length).toEqual(2);
  });
});
