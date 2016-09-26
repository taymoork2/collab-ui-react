/**
 * Created by snzheng on 16/9/22.
 */
'use strict';

describe('components:addComponents', function () {
  var $compile, $scope, $controller, controller, ComponentsService, statusService, $templateCache, $modalInstance;
  var view;
  var $q;
  var ADD_BUTTON = '.activate-button';
  var CLOSE_BUTTON = '.close';
  var CANCLE_BUTTON = '.cancelCreateNewGroup';
  beforeEach(angular.mock.module('Status'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('WebExApp'));
  beforeEach(inject(dependencies));
  beforeEach(compileView);
  function dependencies(_$rootScope_, _$controller_, _$compile_, _ComponentsService_, _statusService_, _$templateCache_, _$q_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    $compile = _$compile_;
    ComponentsService = _ComponentsService_;
    statusService = _statusService_;
    $templateCache = _$templateCache_;
    $modalInstance = jasmine.createSpyObj('$modalInstance', ['close', 'dismiss']);
    $q = _$q_;
  }
  function compileView() {
    controller = $controller('RedirectAddComponentCtrl', {
      $scope: $scope,
      statusService: statusService,
      ComponentsService: ComponentsService,
      $modalInstance: $modalInstance
    });
    $scope.addComponent = controller;
    var template = $templateCache.get('modules/status/components/addComponent/addComponentDialog.html');
    view = $compile(angular.element(template))($scope);
    spyOn(statusService, 'getServiceId').and.returnValue($q.when({}));
    $scope.$apply();
  }
  it('clicking button should call closeComponent', function () {
    view.find(CLOSE_BUTTON).click();
    expect(controller.closeAddModal).toHaveBeenCalled();
  });
  it('clicking button should call cancle', function () {
    view.find(CANCLE_BUTTON).click();
    expect(controller.cancelCreateNewGroup).toHaveBeenCalled();
  });
  it('clicking button should call addComponent', function () {
    view.find(ADD_BUTTON).click();
    expect(statusService.getServiceId).toHaveBeenCalled();
  });
});
