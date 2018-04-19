describe('Component: mfLiveReportFlipCard', () => {
  beforeEach(function () {
    this.initModules('Mediafusion');
    this.compileComponent('mfLiveReportFlipCard');
  });
  it('Replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain('metrics-info');
    expect(this.view.html()).toContain('metrics-header');
  });
});
