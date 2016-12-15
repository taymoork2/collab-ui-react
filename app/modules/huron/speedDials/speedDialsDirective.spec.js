'use strict';

describe('Directive: ucSpeedDials', function () {
  beforeEach(function () {
    this.initModules('Huron');
    this.compileComponent('ucSpeedDials');
  });

  it('replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain("speed-dials-panel");
  });
});
