'use strict';

describe('Factory : createCareNotSetupNotification', function () {
  function initDependencies() {
    this.injectDependencies('SunlightUtilitiesService', 'OverviewCareNotSetupNotification');
  }
  function initSpies() {
    this.SunlightUtilitiesService.cacheCareSetupStatus = jasmine.createSpy('cacheCareSetupStatus');
    this.SunlightUtilitiesService.getCareSetupNotificationText = jasmine.createSpy('getCareSetupNotificationText')
      .and.returnValue('testLink');
  }

  beforeEach(function () {
    this.initModules('Core');
    initDependencies.call(this);
    initSpies.call(this);
  });

  it('should set call fn to get link text and set care key on dismiss', function () {
    var careNotification = this.OverviewCareNotSetupNotification.createNotification();
    expect(this.SunlightUtilitiesService.getCareSetupNotificationText).toHaveBeenCalled();
    expect(careNotification.text).toBe('testLink');
    careNotification.dismiss();
    expect(this.SunlightUtilitiesService.cacheCareSetupStatus).toHaveBeenCalled();
  });
});
