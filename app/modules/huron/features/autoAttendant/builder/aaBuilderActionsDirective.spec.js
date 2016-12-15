'use strict';

describe('Directive: aaBuilderActions', function () {
  beforeEach(function () {
    this.initModules('Huron', 'Sunlight');
    this.injectDependencies('$q', 'FeatureToggleService');
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.when(true));
    this.compileComponent('aaBuilderActions');
  });

  it('replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain("aa-panel");
    expect(this.view.html()).toContain("aa-add-step-icon");
  });
});
