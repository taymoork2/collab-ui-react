describe('Component: ucNumberOfParticipant', () => {
  beforeEach(function () {
    this.initModules('Mediafusion');
    this.compileComponent('ucNumberOfParticipant');
  });
  it('Replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain('number-of-participant-card');
    expect(this.view.html()).toContain('number-of-participant-reports');
  });
});
