'use strict';

describe('Directive: ucNewMetricsInfoCard', function () {
  beforeEach(function () {
    this.initModules('Mediafusion');
    this.compileComponent('ucNewMetricsInfoCard');
  });

  it('Replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain("metrics-info");
    expect(this.view.html()).toContain("metrics-header");
  });
});
