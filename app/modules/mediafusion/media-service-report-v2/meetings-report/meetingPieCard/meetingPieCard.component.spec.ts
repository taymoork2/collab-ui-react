describe('Component: ucMeetingPieChart', () => {

  beforeEach(function () {
    this.initModules('Mediafusion');
    this.compileComponent('ucMeetingPieChart');
  });
  it('Replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain('piechartWidth');
    expect(this.view.html()).toContain('report-card');
  });
});
