/**
 * Created by snzheng on 16/9/22.
 */
'use strict';

describe('controller:updateComponentCtrl', function () {
  var $controller;
  var $scope;
  var controller;
  var statusService;
  var ComponentsService;
  var $modalInstance;
  var $http;
  var $q;
  var component, groupComponent;
  beforeEach(angular.mock.module('Status'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(inject(dependencies));
  function dependencies(_$rootScope_, _$controller_, _statusService_, _ComponentsService_, _$http_, _$q_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    statusService = _statusService_;
    ComponentsService = _ComponentsService_;
    $http = _$http_;
    $q = _$q_;
    component = { "componentId": 463, "serviceId": 141, "componentName": "Chat", "status": "operational", "description": "" };
    groupComponent = { "componentId": 461, "componentName": "Messenger", "description": "" };
    $modalInstance = jasmine.createSpyObj('$modalInstance', ['close', 'dismiss']);

    spyOn($http, 'put').and.returnValue(true);

    spyOn(ComponentsService, 'modifyComponent').and.returnValue(
      $q.when({})
    );
    controller = $controller('updateComponentCtrl', {
      $scope: $scope,
      statusService: statusService,
      ComponentsService: ComponentsService,
      $modalInstance: $modalInstance,
      component: component,
      groupComponent: groupComponent
    });
    spyOn(controller, 'validation').and.returnValue(true);
  }
  it('close addModal should be active', function () {
    controller.closeAddModal();
    expect($modalInstance.close).toHaveBeenCalled();
  });
  it('createComponent should be active', function () {
    //controller.validation = true;
    controller.createComponent();
    expect(ComponentsService.modifyComponent).toHaveBeenCalled();
  });
  it('validation should be active', function () {
    var validationResult = controller.validation();
    expect(validationResult).toBe(true);
  });
  it('cancelCreateNewGroup should be active', function () {
    controller.cancelCreateNewGroup();
    expect(controller.selectedGroup).toBe("");
  });
});
