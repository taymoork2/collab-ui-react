'use strict';

describe('Directive: aaKeypress', function () {
  var $compile, $rootScope, $scope;
  var element;
  var Notification;

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _Notification_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();

    Notification = _Notification_;

  }));

  it('indicate an error when left angle bracket is used', function () {
    var left_angle = 60;
    var right_angle = 62;
    var good_char = 97;

    var event = {
      type: 'keypress',
      keyCode: left_angle,
      preventDefault: function () {}
    };

    var errorSpy = jasmine.createSpy('error');
    Notification.error = errorSpy;

    element = $compile("<input type='text' aa-keypress value='Hello World'></input>")($scope);
    spyOn(event, 'preventDefault');

    $scope.$digest();

    element.triggerHandler(event);

    expect(event.preventDefault).toHaveBeenCalled();

    expect(errorSpy).toHaveBeenCalled();

    event.preventDefault.calls.reset();

    errorSpy.calls.reset();

    event.keyCode = right_angle;

    element.triggerHandler(event);

    expect(event.preventDefault).toHaveBeenCalled();

    expect(errorSpy).toHaveBeenCalled();

    errorSpy.calls.reset();
    event.preventDefault.calls.reset();

    event.keyCode = good_char;

    element.triggerHandler(event);

    expect(event.preventDefault).not.toHaveBeenCalled();

    expect(errorSpy).not.toHaveBeenCalled();

  });

});
