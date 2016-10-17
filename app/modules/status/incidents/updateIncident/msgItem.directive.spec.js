/**
 * Created by snzheng on 16/10/14.
 */

'use strict';

xdescribe('UI: msgItemDirective', function () {
  var $compile, $rootScope, $scope;
  beforeEach(angular.mock.module('Status.incidents'));
  beforeEach(angular.mock.module('Status'));
  beforeEach(angular.mock.module('ui.router'));
  beforeEach(inject(dependencies));
  function dependencies(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
  }
  it('should replace the element', function () {
    var element = $compile('<msg-item info="msg"></msg-item>')($scope);
    //$compile(element)($scope);
    $scope.$digest();
    expect(element.attr('info')).toContain("editMsg");
  });
});
