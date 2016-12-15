'use strict';

describe('Directive: ucCallVolumeRealGraph', function () {
  beforeEach(function () {
    this.initModules('Mediafusion');
    this.compileComponent('ucCallVolumeRealGraph');
  });

  it('Replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain("call-volume-card");
    expect(this.view.html()).toContain("metrics-call-volume");
  });
});
