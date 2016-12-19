'use strict';

describe('Directive: ucCallVolumeHistoricalGraph', function () {
  beforeEach(function () {
    this.initModules('Mediafusion');
    this.compileComponent('ucCallVolumeHistoricalGraph');
  });

  it('Replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain("historical-call-volume-card");
    expect(this.view.html()).toContain("metrics-call-volume");
  });
});
