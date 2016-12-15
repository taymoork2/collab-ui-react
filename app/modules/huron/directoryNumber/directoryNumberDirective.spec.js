'use strict';

describe('Directive: ucDirectoryNumber', function () {
  beforeEach(function () {
    this.initModules('Huron');
    this.compileComponent('ucDirectoryNumberOld');
  });

  it('replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain("form-group");
  });
});
