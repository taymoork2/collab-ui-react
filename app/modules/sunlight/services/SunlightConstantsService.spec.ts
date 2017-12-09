describe('SunlightConstantsService', function () {
  function initDependencies() {
    this.injectDependencies('SunlightConstantsService');
  }
  beforeEach(function () {
    this.initModules('Sunlight');
    initDependencies.call(this);
  });

  describe('SunlightConstantsService - CONSTANTS', function () {
    it('should test the notificationSnoozeHours service value set', function () {
      expect(this.SunlightConstantsService.notificationSnoozeHours).toEqual(48);
    });

    it('should test the success constant value set', function () {
      expect(this.SunlightConstantsService.status.SUCCESS).toEqual('Success');
    });
  });
});
