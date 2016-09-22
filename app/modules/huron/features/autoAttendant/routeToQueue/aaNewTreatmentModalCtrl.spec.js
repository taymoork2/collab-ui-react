'use strict';

describe('Controller: AANewTreatmentModalCtrl', function () {

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  var $scope, controller;
  var modalFake = {
    close: jasmine.createSpy('modalInstance.close'),
    dismiss: jasmine.createSpy('modalInstance.dismiss')
  };

  beforeEach(inject(function ($rootScope, $controller, $state) {
    $scope = $rootScope.$new();

    spyOn($state, 'go');

    controller = $controller('AANewTreatmentModalCtrl', {
      $scope: $scope,
      $modalInstance: modalFake
    });

  }));

  it("length of minutes should be 60.", function () {
    expect(controller).toBeDefined();
    expect(controller.minutes.length).toEqual(60);
  });

  it("default value of minute should be 15.", function () {
    expect(controller.minute.index).toEqual(15);
  });

  it("cancel function call results in closing the Modal.", function () {
    controller.cancel();
    expect(modalFake.close).toHaveBeenCalledWith();
  });
});
