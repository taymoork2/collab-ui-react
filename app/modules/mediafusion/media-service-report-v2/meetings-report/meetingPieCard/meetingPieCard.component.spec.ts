describe('Component: ucMeetingPieChart', () => {

  beforeEach(function () {
    this.initModules('Mediafusion');
    this.injectDependencies('$compile', '$rootScope');
  });
  it('Replaces the element with the appropriate content', function () {
    let element = this.$compile('<uc-meeting-pie-chart></uc-meeting-pie-chart>')(this.$rootScope);
    this.$rootScope.$digest();
    expect(element.html()).toContain('piechartWidth');
    expect(element.html()).toContain('report-card');
  });
});
