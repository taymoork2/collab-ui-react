/**
 * Created by pso on 16-8-26.
 */

'use strict';

describe('incidents:createIncidents', function () {
  var $compile, $scope, $controller, controller, $templateCache, statusService;
  var view;
  var CREATE_BUTTON = '.btn--primary';
  beforeEach(angular.mock.module('Status.incidents'));
  beforeEach(angular.mock.module('Status'));
  beforeEach(inject(dependencies));
  beforeEach(compileView);
  function dependencies(_$rootScope_, _$controller_, _$compile_, _$templateCache_, _statusService_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    $compile = _$compile_;
    $templateCache = _$templateCache_;
    statusService = _statusService_;
  }


  function compileView() {
    controller = $controller('CreateIncidentController', {
      $scope: $scope,
      statusService: statusService
    });
    $scope.cic = controller;
    spyOn(controller, 'CreateIncident');
    var template = $templateCache.get('modules/status/incidents/createIncident/createIncident.tpl.html');
    view = $compile(angular.element(template))($scope);
    $scope.$apply();
  }
  it('should not be called without click', function () {
    expect(controller.CreateIncident).not.toHaveBeenCalled();
  });

  it('clicking button should call create', function () {

    view.find(CREATE_BUTTON).click();
    expect(controller.CreateIncident).toHaveBeenCalled();
  });
});
