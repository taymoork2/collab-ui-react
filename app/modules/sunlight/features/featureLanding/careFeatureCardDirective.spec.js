'use strict';

describe('Directive: car featureCards', function () {
  beforeEach(function () {
    this.initModules('Sunlight');
    this.compileComponent('careFeatureCard');
  });

  it('replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain('cs-card-block');
  });

});
