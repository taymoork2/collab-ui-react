'use strict';

describe('Directive: ucSharedlineOld', function () {
  beforeEach(function () {
    this.initModules('Huron');
    this.compileComponent('ucSharedLineOld');
  });

  it('replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain("form-group");
  });
});
