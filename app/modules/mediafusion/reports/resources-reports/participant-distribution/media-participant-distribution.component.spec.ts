describe('Component: ucMediaParticipantDistribution', () => {
  beforeEach(function () {
    this.initModules('Mediafusion');
    this.compileComponent('ucMediaParticipantDistribution');
  });
  it('Replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain('participant-distribution-card');
    expect(this.view.html()).toContain('participant-distribution-reports');
  });
});
