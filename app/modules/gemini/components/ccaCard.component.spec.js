'use strict';

describe('Component: ccaCard', function () {
  var $q, $state, $componentCtrl, ctrl;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));

  function dependencies($injector, _$state_, _$q_) {
    $q = _$q_;
    $state = _$state_;
    $componentCtrl = $injector.get('$componentController');
    ctrl = $componentCtrl('ccaCard', { $scope: {} });
    spyOn($state, 'go').and.returnValue($q.when());
  }

  it('should goto have been called', function () {
    ctrl.goto();
    expect($state.go).toHaveBeenCalledWith('gem.servicesPartner');
  });
});
