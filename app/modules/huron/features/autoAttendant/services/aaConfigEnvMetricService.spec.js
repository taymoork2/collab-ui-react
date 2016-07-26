'use strict';

describe('Service: AAConfigEnvMetricService', function () {
  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));
  var $location, $q, AAConfigEnvMetricService, Config, Analytics, AAMetricNameService;

  beforeEach(inject(function (_$q_, _AAConfigEnvMetricService_, _Config_, _Analytics_, _AAMetricNameService_) {
    $q = _$q_;
    AAConfigEnvMetricService = _AAConfigEnvMetricService_;
    Config = _Config_;
    Analytics = _Analytics_;
    AAMetricNameService = _AAMetricNameService_;
    spyOn(Analytics, 'trackEvent').and.returnValue($q.when({}));
  }));
  var message = 'autoAttendant.errorMocked';
  var properties = {
    type: message
  };

  describe('trackProdOrIntegNotifications', function () {
    it('should call analytics trackEvent with prod from trackProdOrIntegNotifications', function () {
      spyOn(Config, 'isProd').and.returnValue(true);
      AAConfigEnvMetricService.trackProdOrIntegNotifications(AAMetricNameService.UI_NOTIFICATION + '.error', properties);
      expect(Analytics.trackEvent).toHaveBeenCalledWith(AAMetricNameService.UI_NOTIFICATION + ".error.prod", properties);
    });

    it('should call analytics trackEvent with integration from trackProdOrIntegNotifications', function () {
      spyOn(Config, 'isIntegration').and.returnValue(true);
      AAConfigEnvMetricService.trackProdOrIntegNotifications(AAMetricNameService.UI_NOTIFICATION + '.error', properties);
      expect(Analytics.trackEvent).toHaveBeenCalledWith(AAMetricNameService.UI_NOTIFICATION + ".error.integration", properties);
    });

    it('should not call analytics trackEvent with dev from trackProdOrIntegNotifications', function () {
      spyOn(Config, 'isDev').and.returnValue(true);
      AAConfigEnvMetricService.trackProdOrIntegNotifications(AAMetricNameService.UI_NOTIFICATION + '.error', properties);
      expect(Analytics.trackEvent).not.toHaveBeenCalled();
    });

    it('should not call analytics trackEvent with cfe from trackProdOrIntegNotifications', function () {
      spyOn(Config, 'isCfe').and.returnValue(true);
      AAConfigEnvMetricService.trackProdOrIntegNotifications(AAMetricNameService.UI_NOTIFICATION + '.error', properties);
      expect(Analytics.trackEvent).not.toHaveBeenCalled();
    });
  });
});
