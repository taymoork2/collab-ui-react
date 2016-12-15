describe('Component: ucAvailabilityMetrics', () => {
  beforeEach(function () {
    this.initModules('Mediafusion');
    this.compileComponent('ucAvailabilityMetrics');
  });
  it('Replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain('availability-card');
    expect(this.view.html()).toContain('metrics-availability');
  });
});
