'use strict';

xdescribe('incidents:createIncidents', function () {
  var $compile, $scope, $controller, controller, $templateCache, statusService, DincidentListService;
  var view;
  var CREATE_BUTTON = '.btn--primary';
  beforeEach(angular.mock.module('status'));
  beforeEach(inject(dependencies));
  beforeEach(compileView);
  function dependencies(_$rootScope_, _$controller_, _$compile_, _$templateCache_, _statusService_, _DincidentListService_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    $compile = _$compile_;
    $templateCache = _$templateCache_;
    statusService = _statusService_;
    DincidentListService = _DincidentListService_;
  }

  function compileView() {
    controller = $controller('DashboardCtrl', {
      $scope: $scope,
      statusService: statusService,
      DincidentListService: DincidentListService
    });
    $scope.dbc = controller;
    spyOn(controller, 'CreateIncident').and.callThrough();
    var template = $templateCache.get('modules/status/dashboard/dashboard.tpl.html');
    view = $compile(angular.element(template))($scope);
    $scope.showList = false;
   // $scope.$apply();
  }
  it('should not be called without click', function () {
    expect(controller.CreateIncident).not.toHaveBeenCalled();
  });

  it('clicking button should call create', function () {
    view.find(CREATE_BUTTON).click();
    expect(controller.CreateIncident).toHaveBeenCalled();
  });
});
