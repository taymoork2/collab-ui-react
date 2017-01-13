describe('Component: ucCallVolumeMetrics', () => {
  beforeEach(function () {
    this.initModules('Mediafusion');
    this.compileComponent('ucCallVolumeMetrics');
  });
  it('Replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain('call-volume-card');
    expect(this.view.html()).toContain('metrics-call-volume');
  });
});
