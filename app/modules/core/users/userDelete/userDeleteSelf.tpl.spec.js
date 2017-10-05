'use strict';

describe('Template: userDeleteSelf', function () {
  var $compile, $scope, $controller, $translate, controller;
  var view;
  var DELETE_BUTTON = '#deleteUserButton';
  var OK_BUTTON = '#okButton';
  var CONFIRMATION_INPUT = '#inputYes';
  var DISABLED = 'disabled';
  var YES = 'YES';

  afterEach(function () {
    if (view) {
      view.remove();
    }
    view = undefined;
  });

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('Messenger'));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(compileView);

  function dependencies(_$compile_, $rootScope, _$controller_, _$translate_) {
    $compile = _$compile_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $translate = _$translate_;
  }

  function initSpies() {
    spyOn($translate, 'instant').and.returnValue(YES);
  }

  function compileView() {
    controller = $controller('UserDeleteCtrl', {
      $scope: $scope,
    });
    $scope.userDelete = controller;

    spyOn(controller, 'deactivateUser');
    controller.isMsgrUser = false;
    controller.msgrloaded = true;

    var template = require('modules/core/users/userDelete/userDeleteSelf.tpl.html');
    view = $compile(angular.element(template))($scope);
    $scope.$apply();
  }

  it('should be disabled by default', function () {
    expect(view.find(DELETE_BUTTON).attr(DISABLED)).toEqual(DISABLED);
    expect(view.find(OK_BUTTON).length).toEqual(1);
  });

  it('typing confirmation should enable delete button', function () {
    view.find(CONFIRMATION_INPUT).val(YES).change();
    expect(view.find(DELETE_BUTTON).attr(DISABLED)).toBeUndefined();
  });

  it('deactivateUser should not be called without button click', function () {
    expect(controller.deactivateUser).not.toHaveBeenCalled();
  });

  it('clicking button should call delete', function () {
    view.find(DELETE_BUTTON).click();
    expect(controller.deactivateUser).toHaveBeenCalled();
  });

  it('should have ok button with isMsgrUser enabled', function () {
    controller.isMsgrUser = true;
    var template = require('modules/core/users/userDelete/userDeleteSelf.tpl.html');
    view = $compile(angular.element(template))($scope);
    $scope.$apply();

    expect(view.find(OK_BUTTON).length).toEqual(1);
    expect(view.find(OK_BUTTON).hasClass('ng-hide')).toBe(false);
    expect(view.find(DELETE_BUTTON).hasClass('ng-hide')).toBe(true);
  });
});
