/**
 * Created by snzheng on 16/9/21.
 */

'use strict';

describe('controller:RedirectAddComponentCtrl', function () {
  var $controller;
  var $scope;
  var controller;
  var statusService;
  var ComponentsService;
  var $modalInstance;
  var $http;
  var $q;
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
    $modalInstance = jasmine.createSpyObj('$modalInstance', ['close', 'dismiss']);

    spyOn($http, 'post').and.returnValue(true);

    spyOn(ComponentsService, 'addComponent').and.returnValue(
      $q.when({})
    );

    controller = $controller('RedirectAddComponentCtrl', {
      $scope: $scope,
      statusService: statusService,
      ComponentsService: ComponentsService,
      $modalInstance: $modalInstance
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
    expect(ComponentsService.addComponent).toHaveBeenCalled();
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
