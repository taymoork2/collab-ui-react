import analyticsModule from './index';

describe('Service: OnlineAnalyticsService', () => {
  let _satellite;

  beforeEach(function () {
    this.initModules(analyticsModule);
    this.injectDependencies(
      'Authinfo',
      'Config',
      'OnlineAnalyticsService',
    );

    spyOn(this.Authinfo, 'isOnline').and.returnValue(true);
    spyOn(this.Config, 'isDev').and.returnValue(false);
    _satellite = jasmine.createSpyObj('satellite', ['track']);
    (<any>window)._satellite = _satellite;
  });

  it('should invoke track for an online org', function () {
    this.OnlineAnalyticsService.track('test-event');
    expect(_satellite.track).toHaveBeenCalledWith('test-event');
  });

  it('should not invoke track for a development environment org', function () {
    this.Config.isDev.and.returnValue(true);

    this.OnlineAnalyticsService.track('test-event');
    expect(_satellite.track).not.toHaveBeenCalledWith('test-event');
  });

  it('should not invoke track for a non-online org', function () {
    this.Authinfo.isOnline.and.returnValue(false);

    this.OnlineAnalyticsService.track('test-event');
    expect(_satellite.track).not.toHaveBeenCalledWith('test-event');
  });
});
