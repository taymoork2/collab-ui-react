'use strict';

describe('Controller: ExpresswayAlarmController', function () {

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Squared'));

  var $scope, $controller, $stateParams, controller;
  beforeEach(inject(function (_$controller_, $rootScope, _$stateParams_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $stateParams = _$stateParams_;
    $scope.$apply();
  }));

  function initController(alarm) {
    controller = $controller('ExpresswayAlarmController', {
      $stateParams: {alarm: alarm}
    });
    $scope.$apply();
  }

  it('should deal with no alarm solution', function () {
    initController({});
    expect(controller.alarm.alarmSolutionElements).toBeUndefined(0);
  });

  it('should deal with a solution with no replacement values', function () {
    initController({solution: 'This solution has no replacement values'});
    expect(controller.alarm.alarmSolutionElements.length).toBe(1);
    expect(controller.alarm.alarmSolutionElements[0].text).toEqual('This solution has no replacement values');
    expect(controller.alarm.alarmSolutionElements[0].link).toBeUndefined();
  });

  it('should deal with a solution with a non-link replacement value', function () {
    initController(
      {
        solution: 'This solution has one %s replacement value without a link',
        solutionReplacementValues: [
          {text: 'Foo'}
        ]
      });
    expect(controller.alarm.alarmSolutionElements.length).toBe(3);
    expect(controller.alarm.alarmSolutionElements[0].text).toEqual('This solution has one ');
    expect(controller.alarm.alarmSolutionElements[0].link).toBeUndefined();
    expect(controller.alarm.alarmSolutionElements[1].text).toEqual('Foo');
    expect(controller.alarm.alarmSolutionElements[1].link).toBeUndefined();
    expect(controller.alarm.alarmSolutionElements[2].text).toEqual(' replacement value without a link');
    expect(controller.alarm.alarmSolutionElements[2].link).toBeUndefined();
  });

  it('should deal with a solution with multiple replacement values', function () {
    initController(
      {
        solution: 'This solution %s has two %s replacement values',
        solutionReplacementValues: [
          {text: 'Foo', link: 'https://foo.com'},
          {text: 'Bar', link: 'https://bar.com'}
        ]
      });
    expect(controller.alarm.alarmSolutionElements.length).toBe(5);
    expect(controller.alarm.alarmSolutionElements[0].text).toEqual('This solution ');
    expect(controller.alarm.alarmSolutionElements[0].link).toBeUndefined();
    expect(controller.alarm.alarmSolutionElements[1].text).toEqual('Foo');
    expect(controller.alarm.alarmSolutionElements[1].link).toEqual('https://foo.com');
    expect(controller.alarm.alarmSolutionElements[2].text).toEqual(' has two ');
    expect(controller.alarm.alarmSolutionElements[2].link).toBeUndefined();
    expect(controller.alarm.alarmSolutionElements[3].text).toEqual('Bar');
    expect(controller.alarm.alarmSolutionElements[3].link).toEqual('https://bar.com');
    expect(controller.alarm.alarmSolutionElements[4].text).toEqual(' replacement values');
    expect(controller.alarm.alarmSolutionElements[4].link).toBeUndefined();
  });


});
