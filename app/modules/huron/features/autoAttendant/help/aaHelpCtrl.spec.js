'use strict';

describe('Controller: AAHelpCtrl', function () {
  var controller, $controller, optionController;
  var $rootScope, $scope;
  var Config;

  var text = "Help me if you can.";

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$rootScope_, _$controller_, _Config_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $controller = _$controller_;
    Config = _Config_;

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

});
