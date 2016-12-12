'use strict';

describe('Directive: ucAvailabilityHistoricalGraph', function () {
  beforeEach(function () {
    this.initModules('Mediafusion');
    this.compileComponent('ucAvailabilityHistoricalGraph');
  });

  it('Replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain("availability-card-historical");
    expect(this.view.html()).toContain("metrics-availability");
  });
});
