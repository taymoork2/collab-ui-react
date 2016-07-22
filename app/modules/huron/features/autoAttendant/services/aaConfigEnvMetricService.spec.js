'use strict';

describe('Service: AAConfigEnvMetricService', function () {
  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));
  var $location, $q, AAConfigEnvMetricService, Config, Analytics, AAMetricNameService;

  beforeEach(inject(function (_$location_, _$q_, _AAConfigEnvMetricService_, _Config_, _Analytics_, _AAMetricNameService_) {
    $location = _$location_;
    $q = _$q_;
    AAConfigEnvMetricService = _AAConfigEnvMetricService_;
    Config = _Config_;
    Analytics = _Analytics_;
    AAMetricNameService = _AAMetricNameService_;
    spyOn(Analytics, 'trackEvent').and.returnValue($q.when({}));
    spyOn($location, 'host');
  }));
  var devHost = 'localhost';
  var cfeHost = 'cfe-admin.ciscospark.com';
  var intHost = 'int-admin.ciscospark.com';
  var prodHost = 'admin.ciscospark.com';
  var message = 'autoAttendant.errorCreateCe';
  var properties = {
    type: message
  };

  describe('trackProdOrIntegNotifications', function () {
    it('should call analytics trackEvent with prod from trackProdOrIntegNotifications', function () {
      $location.host.and.returnValue(prodHost);
      expect(Config.isIntegration()).toBe(false);
      expect(Config.isDev()).toBe(false);
      expect(Config.isCfe()).toBe(false);
      expect(Config.isProd()).toBe(true);
      expect(Config.getEnv()).toEqual('prod');
      AAConfigEnvMetricService.trackProdOrIntegNotifications('error', properties);
      expect(Analytics.trackEvent).toHaveBeenCalledWith(AAMetricNameService.UI_NOTIFICATION + ".prod.error", properties);
    });

    it('should call analytics trackEvent with integration from trackProdOrIntegNotifications', function () {
      $location.host.and.returnValue(intHost);
      expect(Config.isDev()).toBe(false);
      expect(Config.isCfe()).toBe(false);
      expect(Config.isProd()).toBe(false);
      expect(Config.isIntegration()).toBe(true);
      expect(Config.getEnv()).toEqual('integration');
      AAConfigEnvMetricService.trackProdOrIntegNotifications('error', properties);
      expect(Analytics.trackEvent).toHaveBeenCalledWith(AAMetricNameService.UI_NOTIFICATION + ".integration.error", properties);
    });

    it('should not call analytics trackEvent with dev from trackProdOrIntegNotifications', function () {
      $location.host.and.returnValue(devHost);
      expect(Config.isCfe()).toBe(false);
      expect(Config.isProd()).toBe(false);
      expect(Config.isIntegration()).toBe(false);
      expect(Config.isDev()).toBe(true);
      expect(Config.getEnv()).toEqual('dev');
      AAConfigEnvMetricService.trackProdOrIntegNotifications('error', properties);
      expect(Analytics.trackEvent).not.toHaveBeenCalled();
    });

    it('should not call analytics trackEvent with dev from trackProdOrIntegNotifications', function () {
      $location.host.and.returnValue(cfeHost);
      expect(Config.isProd()).toBe(false);
      expect(Config.isIntegration()).toBe(false);
      expect(Config.isDev()).toBe(false);
      expect(Config.isCfe()).toBe(true);
      expect(Config.getEnv()).toEqual('cfe');
      AAConfigEnvMetricService.trackProdOrIntegNotifications('error', properties);
      expect(Analytics.trackEvent).not.toHaveBeenCalled();
    });

    it('should call analytics with integration config env from trackConfigEnvNotifications', function () {
      $location.host.and.returnValue(intHost);
      expect(Config.isIntegration()).toBe(true);
      AAConfigEnvMetricService.trackConfigEnvNotifications('error', properties);
      expect(Analytics.trackEvent).toHaveBeenCalledWith(AAMetricNameService.UI_NOTIFICATION + '.' + Config.getEnv() + ".error", properties);
    });

    it('should call analytics with prod config env from trackConfigEnvNotifications', function () {
      $location.host.and.returnValue(prodHost);
      expect(Config.isProd()).toBe(true);
      AAConfigEnvMetricService.trackConfigEnvNotifications('error', properties);
      expect(Analytics.trackEvent).toHaveBeenCalledWith(AAMetricNameService.UI_NOTIFICATION + '.' + Config.getEnv() + ".error", properties);
    });

    it('should call analytics with dev config env from trackConfigEnvNotifications', function () {
      $location.host.and.returnValue(devHost);
      expect(Config.isDev()).toBe(true);
      AAConfigEnvMetricService.trackConfigEnvNotifications('error', properties);
      expect(Analytics.trackEvent).toHaveBeenCalledWith(AAMetricNameService.UI_NOTIFICATION + '.' + Config.getEnv() + ".error", properties);
    });

    it('should call analytics with cfe config env from trackConfigEnvNotifications', function () {
      $location.host.and.returnValue(cfeHost);
      expect(Config.isCfe()).toBe(true);
      AAConfigEnvMetricService.trackConfigEnvNotifications('error', properties);
      expect(Analytics.trackEvent).toHaveBeenCalledWith(AAMetricNameService.UI_NOTIFICATION + '.' + Config.getEnv() + ".error", properties);
    });
  });
});
