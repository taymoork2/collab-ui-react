'use strict';

describe('Directive: ucVoicemail', function() {
  var $compile, $rootScope;

  beforeEach(module('Huron'));

  beforeEach(inject(function(_$compile_, _$rootScope_){
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('replaces the element with the appropriate content', function() {
    var element = $compile("<uc-voicemail/>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("voicemailForm");
  });
});