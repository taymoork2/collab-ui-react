'use strict';

describe('Template: Example', function () {
  var $compile, $scope, $templateCache, $controller, controller;
  var view;
  var DISABLED = 'disabled';
  var READ_ONLY = 'readonly';
  var INCREMENT_BUTTON = '#increment-button';
  var COUNT_INPUT = '#count-input';

  beforeEach(module('AtlasExample'));
  beforeEach(inject(dependencies));
  beforeEach(compileView);

  function dependencies(_$compile_, $rootScope, _$templateCache_, _$controller_) {
    $compile = _$compile_;
    $scope = $rootScope.$new();
    $templateCache = _$templateCache_;
    $controller = _$controller_;
  }

  function compileView() {
    var template = $templateCache.get('examples/unit/example.tpl.html');

    controller = $controller('ExampleController', {
      $scope: $scope
    });
    $scope.example = controller;

    view = $compile(angular.element(template))($scope);
    $scope.$apply();
  }

  describe('init', function () {
    it('should have an enabled increment button', function () {
      expect(view.find(INCREMENT_BUTTON).prop(DISABLED)).toBe(false);
    });

    it('should have 0 count', function () {
      expect(view.find(COUNT_INPUT).val()).toBe('0');
    });

    it('should have a readonly count input', function () {
      expect(view.find(COUNT_INPUT).prop(READ_ONLY)).toBe(true);
    });
  });

  describe('increment button', function () {
    it('should increment the count', function () {
      view.find(INCREMENT_BUTTON).click();
      expect(view.find(COUNT_INPUT).val()).toBe('1');
    });

    it('should become disabled after incrementing twice', function () {
      view.find(INCREMENT_BUTTON).click();
      expect(view.find(INCREMENT_BUTTON).prop(DISABLED)).toBe(false);
      view.find(INCREMENT_BUTTON).click();
      expect(view.find(COUNT_INPUT).val()).toBe('2');
      expect(view.find(INCREMENT_BUTTON).prop(DISABLED)).toBe(true);
    });
  });
});
