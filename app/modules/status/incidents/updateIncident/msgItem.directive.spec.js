/**
 * Created by pso on 16-8-25.
 */
'use strict';

describe('UI: msgItemDirective', function () {
  var $compile, $rootScope, $scope;
  var element;
  beforeEach(angular.mock.module('Status.incidents'));
  beforeEach(inject(dependencies));
  function dependencies(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
  }
  it('should replace the element', function () {
    element = angular.element("<msg-item info='msg'></msg-item>");
    $compile(element)($scope);
    $scope.$digest();
    expect(element.html()).toContain("editMsg");
  });
});
