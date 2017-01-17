describe('Component: ucMediaUtilization', () => {
  beforeEach(function () {
    this.initModules('Mediafusion');
    this.compileComponent('ucMediaUtilization');
  });
  it('Replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain('utilization-card');
    expect(this.view.html()).toContain('utilization-reports');
  });
});
