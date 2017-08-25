'use strict';

/* eslint-disable no-loop-func */

describe('Controller: NewCareFeatureModalCtrl', function () {
  beforeEach(angular.mock.module('Sunlight'));
  var featureIds = ['Ch', 'Ca', 'ChCa'];
  var featureType = ['chat', 'callback', 'chatPlusCallback'];

  var $scope, Authinfo, $q, $controller, $state;
  var modalFake = {
    close: jasmine.createSpy('modalInstance.close'),
    dismiss: jasmine.createSpy('modalInstance.dismiss'),
  };
  beforeEach(inject(function ($rootScope, _$controller_, _$state_, _$q_, _Authinfo_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    Authinfo = _Authinfo_;
    $state = _$state_;
    $controller = _$controller_;
    spyOn($state, 'go');
    spyOn(Authinfo, 'isCare').and.returnValue(true);
    spyOn(Authinfo, 'isSquaredUC').and.returnValue(true);
  }));
  function callController() {
    $controller('NewCareFeatureModalCtrl', {
      $scope: $scope,
      $modalInstance: modalFake,
      $q: $q,
      $state: $state,
    });
  }
  afterEach(function () {
    Authinfo = undefined;
  });
  it('feature list to have care - chat, callback and chatPlusCallback', function () {
    callController();
    expect($scope.features.length).toEqual(featureIds.length);
  });
  // Test each known featureId that is not tied to a feature toggle
  featureIds.forEach(function (code, index) {
    it('ok function call for ' + featureType[index] + ' results in initiating state call and then closing the care new feature Modal with the value chosen.', function () {
      callController();
      $scope.ok(code);
      expect(modalFake.close).toHaveBeenCalledWith(code);
      expect($state.go).toHaveBeenCalledWith('care.setupAssistant', {
        type: featureType[index],
      });
    });
  });

  it('ok function call for VirtualAssistant results in no initiating state call But does close the care new feature Modal with the value chosen.', function () {
    callController();
    var code = 'Va';
    $scope.ok(code);
    expect(modalFake.close).toHaveBeenCalledWith(code);
    expect($state.go).toHaveBeenCalledTimes(0);
  });

  it('cancel function call results in dismissing the care new feature Modal.', function () {
    callController();
    $scope.cancel();
    expect(modalFake.dismiss).toHaveBeenCalledWith('cancel');
  });

  it('virtualAssistant Enabled feature list to have care - chat, callback, chatPlusCallback, and virtualAssistant', function () {
    $state.isVirtualAssistantEnabled = true;
    callController();
    expect($scope.features.length).toEqual(featureIds.length + 1);
  });

  // Test each known featureId that is not tied to a feature toggle to see it is still used
  featureIds.forEach(function (code, index) {
    it('ok function call for ' + featureType[index] + ' with virtual assistant enabled results in initiating state call and then closing the care new feature Modal with the value chosen.', function () {
      $state.isVirtualAssistantEnabled = true;
      callController();
      $scope.ok(code);
      expect(modalFake.close).toHaveBeenCalledWith(code);
      expect($state.go).toHaveBeenCalledWith('care.setupAssistant', {
        type: featureType[index],
      });
    });
  });
  it('ok function call for for VirtualAssistant with virtual assistant enabled results in initiating state call and then closing the care new feature Modal with the value chosen.', function () {
    $state.isVirtualAssistantEnabled = true;
    callController();
    var code = 'Va';
    $scope.ok(code);
    expect(modalFake.close).toHaveBeenCalledWith(code);
    expect($state.go).toHaveBeenCalledWith('care.assistant', {
      type: 'virtualAssistant',
    });
  });
});
