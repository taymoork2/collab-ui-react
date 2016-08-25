'use strict';

describe('Controller: CallRoutingNavCtrl', function () {
  var controller, $scope, $q, CallPark;

  var callParkList = [{
    pattern: '111'
  }, {
    pattern: '222'
  }];
  var callParkListUpdated = [{
    pattern: '111'
  }, {
    pattern: '222'
  }, {
    pattern: '333'
  }];

  function expectCount(state, count) {
    for (var i = 0; i < controller.tabs.length; i++) {
      var tab = controller.tabs[i];
      if (tab.state === state) {
        expect(tab.count).toEqual(count);
      }
    }
  }

  beforeEach(angular.mock.module('uc.callrouting'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function ($rootScope, $controller, _$q_, _CallPark_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    CallPark = _CallPark_;

    spyOn(CallPark, 'list').and.returnValue($q.when(callParkList));

    controller = $controller('CallRoutingNavCtrl', {
      $scope: $scope,
      CallPark: CallPark
    });

    $scope.$apply();
  }));

  it('should be defined', function () {
    expect(controller).toBeDefined();
    expect(controller.tabs).toBeDefined();
  });

  it('should initialize call parks', function () {
    expectCount('callpark', callParkList.length);
  });

  it('should update count', function () {
    $scope.$emit('callrouting-update', {
      state: 'callpark',
      count: callParkListUpdated.length
    });
    expectCount('callpark', callParkListUpdated.length);
  });
});
