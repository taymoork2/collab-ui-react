'use strict';

describe('Controller: AAHelpCtrl', function () {
  var controller, $controller;
  var $rootScope, $scope;
  var $q;
  var Analytics;
  var AAMetricNameService;

  var text = "Help me if you can.";
  var metric = "track.Me.If.You.Can";

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _Analytics_, _AAMetricNameService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $controller = _$controller_;
    $q = _$q_;
    Analytics = _Analytics_;
    AAMetricNameService = _AAMetricNameService_;

    controller = $controller('AAHelpCtrl', {
      $scope: $scope
    });
    $scope.$apply();
  }));

  describe('getHelpText', function () {
    it('should return only help text if showLink undefined', function () {
      controller.content = text;
      controller.showLink = undefined;
      expect(controller.getHelpText()).toEqual(text);
    });

    it('should return only help text if showLink a string', function () {
      controller.content = text;
      controller.showLink = "notboolean";
      expect(controller.getHelpText()).toEqual(text);
    });

    it('should return empty string if all undefined', function () {
      controller.content = undefined;
      controller.showLink = undefined;
      expect(controller.getHelpText()).toEqual("");
    });

    it('should return only help link if content empty', function () {
      controller.content = "";
      controller.showLink = true;
      expect(controller.getHelpText()).toContain(controller.optionHelpLink);
    });

    it('should return help text without link', function () {
      controller.content = text;
      controller.showLink = false;
      expect(controller.getHelpText()).toEqual(text);

    });

    it('show return help text with link', function () {
      controller.content = text;
      controller.showLink = true;
      expect(controller.getHelpText()).toContain(text);
      expect(controller.getHelpText()).toContain(controller.optionHelpLink);
    });
  });

  describe('sendMetrics', function () {
    beforeEach(function () {
      spyOn(Analytics, 'trackEvent').and.returnValue($q.when({}));
    });

    it('should send metrics if metrics are defined', function () {
      controller.metric = metric;
      controller.sendMetrics();
      expect(Analytics.trackEvent).toHaveBeenCalledWith(AAMetricNameService.UI_HELP, {
        type: controller.metric
      });
    });

    it('should not send metrics if metrics are undefined', function () {
      controller.metric = "";
      controller.sendMetrics();
      expect(Analytics.trackEvent).not.toHaveBeenCalled();
    });
  });
});
