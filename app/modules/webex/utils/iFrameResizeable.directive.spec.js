/**
 * 
 */

'use strict';
xdescribe('iFrameResizable directive', function () {
  var elm;
  var window;

  beforeEach(angular.mock.module('WebExApp'));

  beforeEach(inject(function ($rootScope, $compile, _$window_) {
    window = _$window_;

    var html = '<div><iframe i-frame-resizable></iframe></div>';
    var template = angular.element(html);
    var linkFn = $compile(template);
    elm = linkFn($rootScope);

    $rootScope.$digest();
  }));

  it('should contain iFrameresizeable', function () {
    expect(elm.html()).toContain("i-frame-resizable");
  });

  it('should define the initializeWindowSize function', inject(function ($rootScope) {
    expect($rootScope.initializeWindowSize).toBeDefined();
  }));

  it('should define the iframeHeight property', inject(function ($rootScope) {
    expect($rootScope.iframeHeight).toBeDefined();
  }));

  it('should set the iframeHeight property', inject(function ($rootScope) {
    // expect($rootScope.iframeHeight).toEqual(window.innerHeight - 200);
    expect($rootScope.iframeHeight).toEqual(window.innerHeight - 214);
  }));
});
