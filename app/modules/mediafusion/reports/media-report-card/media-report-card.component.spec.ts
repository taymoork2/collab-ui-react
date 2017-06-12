describe('Component: ucMediaReportCard', () => {
  beforeEach(function () {
    this.initModules('Mediafusion');
    this.compileComponent('ucMediaReportCard');
  });
  xit('Replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain('metrics-info');
    expect(this.view.html()).toContain('media-card-article');
  });
});
