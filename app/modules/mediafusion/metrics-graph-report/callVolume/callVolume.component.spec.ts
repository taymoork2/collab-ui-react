describe('Component: ucCallVolumeMetrics', () => {

  beforeEach(function () {
    this.initModules('Mediafusion');
    this.injectDependencies('$compile', '$rootScope');
  });
  it('Replaces the element with the appropriate content', function () {
    let element = this.$compile('<uc-call-volume-metrics></uc-call-volume-metrics>')(this.$rootScope);
    this.$rootScope.$digest();
    expect(element.html()).toContain('call-volume-card');
    expect(element.html()).toContain('metrics-call-volume');
  });
});
