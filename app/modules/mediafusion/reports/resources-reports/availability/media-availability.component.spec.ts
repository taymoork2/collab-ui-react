describe('Component: ucMediaAvailability', () => {
  beforeEach(function () {
    this.initModules('Mediafusion');
    this.compileComponent('ucMediaAvailability');
  });
  it('Replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain('availability-card');
    expect(this.view.html()).toContain('availability-reports');
  });
});
