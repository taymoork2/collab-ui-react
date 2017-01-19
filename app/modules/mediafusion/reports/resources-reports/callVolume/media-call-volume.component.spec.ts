describe('Component: ucMediaCallVolume', () => {
  beforeEach(function () {
    this.initModules('Mediafusion');
    this.compileComponent('ucMediaCallVolume');
  });
  it('Replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain('call-volume-card');
    expect(this.view.html()).toContain('call-volume-reports');
  });
});
