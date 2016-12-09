'use strict';

describe('Directive: featureCards', function () {
  beforeEach(function () {
    this.initModules('Huron');
    this.compileComponent('featureCards');
  });

  it('replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain('cs-card-block');
  });
});
