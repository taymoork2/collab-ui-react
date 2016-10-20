'use strict';

describe('Controller: ModalCtrl', function () {
  var controller, $scope;

  var title = 'myTitle';
  var message = 'myMessage';
  var close = 'myClose';
  var dismiss = 'myDismiss';
  var btnType = 'myBtnType';

  beforeEach(angular.mock.module('Core'));

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("title", title);
    $provide.value("message", message);
    $provide.value("close", close);
    $provide.value("dismiss", dismiss);
    $provide.value("btnType", btnType);
  }));

  beforeEach(inject(function ($rootScope, $controller) {
    $scope = $rootScope.$new();

    controller = $controller('ModalCtrl', {
      $scope: $scope
    });

    $scope.$apply();
  }));

  it('should set provided values', function () {
    expect(controller.title).toEqual(title);
    expect(controller.message).toEqual(message);
    expect(controller.close).toEqual(close);
    expect(controller.dismiss).toEqual(dismiss);
    expect(controller.btnType).toEqual(btnType);
  });

});
