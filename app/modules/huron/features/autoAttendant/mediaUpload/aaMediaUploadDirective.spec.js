'use strict';

describe('Directive: aaMediaUpload', function () {
  var $compile, $rootScope;

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('creates the appropriate content as element', function () {
    var element = $compile("<aa-media-upload name='mediaUploadInput'></aa-media-upload>")($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain("mediaUpload");
  });

  it('creates the appropriate content as attribute', function () {
    var element = $compile("<div aa-media-upload name='mediaUploadInput'></div>")($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain("mediaUpload");
  });
});
