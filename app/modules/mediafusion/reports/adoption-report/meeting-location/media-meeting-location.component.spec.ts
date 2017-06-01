describe('Component: ucMediaMeetingLocation', () => {
  beforeEach(function () {
    this.initModules('Mediafusion');
    this.compileComponent('ucMediaMeetingLocation');
  });
  it('Replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain('meeting-location-card');
    expect(this.view.html()).toContain('meeting-location-reports');
  });
});
