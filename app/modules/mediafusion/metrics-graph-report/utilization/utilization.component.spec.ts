describe('Component: ucUtilizationMetrics', () => {
  beforeEach(function () {
    this.initModules('Mediafusion');
    this.compileComponent('ucUtilizationMetrics');
  });
  it('Replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain('utilization-card');
    expect(this.view.html()).toContain('metrics-utilization');
  });
});
