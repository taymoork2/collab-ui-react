describe('Component: ucAvailabilityMetrics', () => {

  beforeEach(function () {
    this.initModules('Mediafusion');
    this.injectDependencies('$compile', '$rootScope');
  });
  it('Replaces the element with the appropriate content', function () {
    let element = this.$compile('<uc-availability-metrics></uc-availability-metrics>')(this.$rootScope);
    this.$rootScope.$digest();
    expect(element.html()).toContain('availability-card');
    expect(element.html()).toContain('metrics-availability');
  });
});
