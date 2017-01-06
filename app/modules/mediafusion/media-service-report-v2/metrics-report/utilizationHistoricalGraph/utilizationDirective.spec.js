'use strict';

describe('Directive: ucUtilizationHistoricalGraph', function () {
  beforeEach(function () {
    this.initModules('Mediafusion');
    this.compileComponent('ucUtilizationHistoricalGraph');
  });

  it('Replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain("utilization-card-historical");
    expect(this.view.html()).toContain("metrics-utilization");
  });
});
