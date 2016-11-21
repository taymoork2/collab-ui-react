describe('Component: ucMetricsInfoCard', () => {

  beforeEach(function () {
    this.initModules('Mediafusion');
    this.injectDependencies('$compile', '$rootScope');
  });
  it('Replaces the element with the appropriate content', function () {
    let element = this.$compile('<uc-metrics-info-card></uc-metrics-info-card>')(this.$rootScope);
    this.$rootScope.$digest();
    expect(element.html()).toContain('metrics-info');
    expect(element.html()).toContain('metrics-header');
  });
});
