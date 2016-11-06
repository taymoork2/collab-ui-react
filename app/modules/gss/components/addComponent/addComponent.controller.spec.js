'use strict';

describe('controller: AddComponentCtrl', function () {
  var $controller, $q, $scope, controller, ComponentsService, GSSService;

  beforeEach(angular.mock.module('GSS'));
  beforeEach(angular.mock.module('Core'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);


  function dependencies(_$controller_, _$q_, _$rootScope_, _ComponentsService_, _GSSService_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    ComponentsService = _ComponentsService_;
    GSSService = _GSSService_;
  }

  function initSpies() {
    spyOn(ComponentsService, 'getGroupComponents').and.returnValue($q.when());
    spyOn(ComponentsService, 'addComponent').and.returnValue($q.when());
  }

  function initController() {
    controller = $controller('AddComponentCtrl', {
      $modalInstance: {
        close: sinon.stub()
      },
      $scope: $scope,
      ComponentsService: ComponentsService,
      GSSService: GSSService
    });

    $scope.$apply();
  }

  it('isValid true, group selected with component name', function () {
    controller.componentName = 'testComponentName';
    controller.selectedGroup = {
      value: 1
    };

    expect(controller.isValid()).toBe(true);
  });

  it('isValid true, creating group with component name and group name', function () {
    controller.componentName = 'testComponentName';
    controller.groupName = 'testGroupName';
    controller.selectedGroup = {
      value: 'creatingGroup'
    };

    expect(controller.isValid()).toBe(true);
  });

  it('isValid false, without component name', function () {
    expect(controller.isValid()).toBe(false);
  });

  it('isCreatingGroup true, creating group', function () {
    controller.selectedGroup = {
      value: 'creatingGroup'
    };

    expect(controller.isCreatingGroup()).toBe(true);
  });

  it('isCreatingGroup false, not creating group', function () {
    expect(controller.isCreatingGroup()).toBe(false);
  });

  it('resetSelectedGroup, selected group has been reset', function () {
    controller.resetSelectedGroup();
    expect(controller.selectedGroup).toEqual('');
  });

  it('addComponent isValid true, call addComponent service', function () {
    controller.componentName = 'testComponentName';
    controller.groupName = 'testGroupName';
    controller.selectedGroup = {
      value: 'creatingGroup'
    };

    controller.addComponent();
    expect(ComponentsService.addComponent).toHaveBeenCalled();
  });

  it('addComponent isValid false, don\'t call addComponent service', function () {
    controller.addComponent();
    expect(ComponentsService.addComponent.calls.count()).toEqual(0);
  });
});
