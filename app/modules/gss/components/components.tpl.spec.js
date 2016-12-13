'use strict';

describe('components:showComponents', function () {
  var $compile, $scope, $controller, controller, ComponentsService, GSSService, $templateCache;
  var view;
  var hasData = 'gss-components-list';
  var noData = 'centered-info-pane';
  var ADD_BUTTON = '.add-component-button';
  var $q;

  afterEach(function () {
    if (view) {
      view.remove();
    }
    view = undefined;
  });

  beforeEach(angular.mock.module('GSS'));
  beforeEach(inject(dependencies));
  beforeEach(compileView);
  function dependencies(_$rootScope_, _$controller_, _$compile_, _ComponentsService_, _GSSService_, _$templateCache_, _$q_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    $compile = _$compile_;
    ComponentsService = _ComponentsService_;
    GSSService = _GSSService_;
    $templateCache = _$templateCache_;
    $q = _$q_;
  }

  function compileView() {
    controller = $controller('ComponentsCtrl', {
      $scope: $scope,
      GSSService: GSSService,
      ComponentsService: ComponentsService
    });
    $scope.comp = controller;
    spyOn(controller, 'addComponent').and.returnValue($q.when(true));
    spyOn(controller, 'updateComponent').and.returnValue($q.when({}));
    var template = $templateCache.get('modules/gss/components/components.tpl.html');
    view = $compile(angular.element(template))($scope);
    $scope.$apply();
  }
  it('clicking button should call add', function () {
    view.find(ADD_BUTTON).click();
    expect(controller.addComponent).toBeTruthy();
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
