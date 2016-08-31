
/**
 * Created by pso on 16-8-26.
 */
'use strict';

describe('incidents:createIncidents', function () {
  var $compile, $scope, $controller, controller, $templateCache;
  var view;
  var DELETE_BUTTON = '.btn--cta';
  beforeEach(angular.mock.module('Status.incidents'));
  beforeEach(inject(dependencies));
  beforeEach(compileView);
  function dependencies(_$rootScope_, _$controller_, _$compile_, _$templateCache_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    $compile = _$compile_;
    $templateCache = _$templateCache_;

  }

  function compileView() {
    controller = $controller('DeleteIncidentController', {
      $scope: $scope
    });
    $scope.dic = controller;
    spyOn(controller, 'deleteIncidentBtn');
    var template = $templateCache.get('modules/status/incidents/deleteIncident/deleteIncident.tpl.html');
    view = $compile(angular.element(template))($scope);
    $scope.$apply();
  }

  it('should not be called without click', function () {
    expect(controller.deleteIncidentBtn).not.toHaveBeenCalled();
  });

  it('clicking button should call delete', function () {
    view.find(DELETE_BUTTON).click();
    expect(controller.deleteIncidentBtn).toHaveBeenCalled();
  });
});
