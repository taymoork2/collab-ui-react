'use strict';

describe('Directive: ucExternalNumberOverview', function () {
  beforeEach(function () {
    this.initModules('Huron', 'Sunlight');
    this.injectDependencies('$q', 'FeatureToggleService', 'ExternalNumberService');
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.when());
    spyOn(this.ExternalNumberService, 'refreshNumbers').and.returnValue(this.$q.when());
    this.compileComponent('ucExternalNumberOverview');
  });

  it('replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain("cs-sp-section");
    expect(this.view.html()).toContain("customerPage.call");
  });
});
