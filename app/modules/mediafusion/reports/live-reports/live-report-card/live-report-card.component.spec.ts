describe('Component: mfLiveReportCard', () => {
  beforeEach(function () {
    this.initModules('Mediafusion');
    this.compileComponent('mfLiveReportCard');
  });
  xit('Replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain('metrics-info');
    expect(this.view.html()).toContain('media-card-article');
  });
});
