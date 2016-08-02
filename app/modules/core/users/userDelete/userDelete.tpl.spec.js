'use strict';

describe('Template: userDelete', function () {
  var $compile, $scope, $templateCache, $controller, controller;
  var view;
  var DELETE_BUTTON = '#deleteUserButton';
  var DISABLED = 'disabled';

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(dependencies));
  beforeEach(compileView);

  function dependencies(_$compile_, $rootScope, _$templateCache_, _$controller_) {
    $compile = _$compile_;
    $scope = $rootScope.$new();
    $templateCache = _$templateCache_;
    $controller = _$controller_;
  }

  function compileView() {
    controller = $controller('UserDeleteCtrl', {
      $scope: $scope
    });
    $scope.userDelete = controller;

    spyOn(controller, 'deactivateUser');

    var template = $templateCache.get('modules/core/users/userDelete/userDelete.tpl.html');
    view = $compile(angular.element(template))($scope);
    $scope.$apply();
  }

  it('should be enabled by default', function () {
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
