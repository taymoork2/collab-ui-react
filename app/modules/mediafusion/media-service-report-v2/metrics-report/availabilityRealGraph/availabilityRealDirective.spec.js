'use strict';

describe('Directive: ucAvailabilityRealGraph', function () {
  beforeEach(function () {
    this.initModules('Mediafusion');
    this.compileComponent('ucAvailabilityRealGraph');
  });

  it('Replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain("availability-card");
    expect(this.view.html()).toContain("metrics-availability");
  });
});
