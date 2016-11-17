describe('Component: ucUtilizationMetrics', () => {

  beforeEach(function () {
    this.initModules('Mediafusion');
    this.injectDependencies('$compile', '$rootScope');
  });
  it('Replaces the element with the appropriate content', function () {
    let element = this.$compile('<uc-utilization-metrics></uc-utilization-metrics>')(this.$rootScope);
    this.$rootScope.$digest();
    expect(element.html()).toContain('utilization-card');
    expect(element.html()).toContain('metrics-utilization');
  });
});
