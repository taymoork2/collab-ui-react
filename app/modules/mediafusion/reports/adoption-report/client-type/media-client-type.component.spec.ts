describe('Component: ucMediaClientType', () => {
  beforeEach(function () {
    this.initModules('Mediafusion');
    this.compileComponent('ucMediaClientType');
  });
  it('Replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain('client-type-card');
    expect(this.view.html()).toContain('client-type-reports');
  });
});
