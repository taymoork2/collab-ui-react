import moduleName from './index';

describe('Component: SupportMeetingComponent', () => {

  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies('$state', 'FeatureToggleService');

    initSpies.apply(this);
  });

  function initSpies() {
    spyOn(this.$state, 'go');
  }

  function initComponent() {
    this.compileComponent('supportMeetingComponent');
  }

  it('should go to support.status when FT:diagnosticF8193UX3 is off', function () {
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(false));
    initComponent.call(this);
    expect(this.$state.go).toHaveBeenCalledWith('support.status');
  });
});
