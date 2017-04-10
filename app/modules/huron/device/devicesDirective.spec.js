'use strict';

xdescribe('Directive: ucDevices', function () {
  beforeEach(function () {
    this.initModules('uc.device');
    this.compileComponent('ucDevices');
  });

  it('replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain("dir-number-list");
  });
});
