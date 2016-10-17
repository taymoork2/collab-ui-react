/**
 * Created by snzheng on 16/9/21.
 */

'use strict';

xdescribe('components:showComponents', function () {
  var $compile, $scope, $controller, controller, ComponentsService, statusService, $templateCache;
  var view;
  var hasData = 'status-components-list';
  var noData = 'centered-info-pane';
  //var DELETE_BUTTON = '#deleteButton1';
  //var EDIT_BUTTON = '#updateButton1';
  var ADD_BUTTON = '.add-resource-button';

  var $q;
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
    $q = _$q_;
  }

  function compileView() {
    controller = $controller('componentsCtrl', {
      $scope: $scope,
      statusService: statusService,
      ComponentsService: ComponentsService
    });
    $scope.comp = controller;
    spyOn(controller, 'addComponent').and.returnValue($q.when({}));
    spyOn(controller, 'updateComponent').and.returnValue($q.when({}));
    var template = $templateCache.get('modules/status/components/components.tpl.html');
    view = $compile(angular.element(template))($scope);
    $scope.$apply();
  }
  it('clicking button should call delete', function () {
    view.find(ADD_BUTTON).click();
    expect(controller.addComponent).toHaveBeenCalled();
  });
  it('hasData module should have', verifyTranslate(hasData));
  it('noData module should have', verifyTranslate(noData));
  function verifyTranslate(_class_) {
    return function () {
      var icon = view.find('.' + _class_);
      expect(icon).not.toBe(null);
    };
  }

});
