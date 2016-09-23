describe('Service: SpeedDialService', () => {
  beforeEach(function() {
    this.initModules('huron.speed-dial');
    this.injectDependencies(
      '$httpBackend',
      '$q',
      'SpeedDialService'
    );
  });

  it('getSpeedDial', function() {
    this.SpeedDialService.getSpeedDials('place', '12345').then(function(data) {
      expect(data).toBe({
        speedDials: [],
      });
    });
  });

  it('updateSpeedDial', function() {
    this.SpeedDialService.updateSpeedDials('place', '12345', []).then(function(data) {
      expect(data).toBe([]);
    });
  });
});
