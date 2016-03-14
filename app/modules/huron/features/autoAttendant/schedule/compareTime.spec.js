'use strict';

describe('Controller: AAScheduleModalCtrl', function () {
  var elem, scope, compile, startdate, enddate;
  startdate = {
    getTime: function () {
      return 12000;
    }
  };
  enddate = {
    getTime: function () {
      return 13000;
    }
  };
  beforeEach(module('uc.autoattendant'));
  beforeEach(inject(function injection($rootScope, $compile) {
    scope = $rootScope.$new();
    compile = $compile;
  }));

  function getCompiledInput() {
    var template = angular.element('<form name="testForm"><input name="input" ng-model="endtime" compare-time="starttime" reset-compare="allDay"></form>');
    var compiledElement = compile(template)(scope);
    scope.$apply();
    return compiledElement;
  }

  describe('compare-time directive', function () {
    beforeEach(function () {
      elem = getCompiledInput();
    });

    it('invalid when starttime and end time is same', function () {
      scope.endtime = startdate;
      scope.starttime = enddate;
      scope.$apply();
      expect(elem.find('.ng-invalid')).toExist();
    });
    it('valid when starttime and end time is different', function () {
      scope.endtime = enddate;
      scope.starttime = startdate;
      scope.$apply();
      expect(elem.find('.ng-invalid')).not.toExist();
    });
  });
});
