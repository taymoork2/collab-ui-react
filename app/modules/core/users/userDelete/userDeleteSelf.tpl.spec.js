'use strict';

describe('Template: userDeleteSelf', function () {
  var $compile, $scope, $templateCache, $controller, $translate, controller;
  var view;
  var DELETE_BUTTON = '#deleteUserButton';
  var CONFIRMATION_INPUT = '#inputYes';
  var DISABLED = 'disabled';
  var YES = 'YES';

  beforeEach(module('Core'));
  beforeEach(module('Huron'));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(compileView);

  function dependencies(_$compile_, $rootScope, _$templateCache_, _$controller_, _$translate_) {
    $compile = _$compile_;
    $scope = $rootScope.$new();
    $templateCache = _$templateCache_;
    $controller = _$controller_;
    $translate = _$translate_;
  }

  function initSpies() {
    spyOn($translate, 'instant').and.returnValue(YES);
  }

  function compileView() {
    controller = $controller('UserDeleteCtrl', {
      $scope: $scope
    });
    $scope.userDelete = controller;

    spyOn(controller, 'deactivateUser');

    var template = $templateCache.get('modules/core/users/userDelete/userDeleteSelf.tpl.html');
    view = $compile(angular.element(template))($scope);
    $scope.$apply();
  }

  it('should be disabled by default', function () {
    expect(view.find(DELETE_BUTTON).attr(DISABLED)).toEqual(DISABLED);
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
});
