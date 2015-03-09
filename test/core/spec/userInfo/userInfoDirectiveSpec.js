'use strict';

describe('UserInfoDirective', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $compile, $rootScope;
  beforeEach(inject(function ($httpBackend, _$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $httpBackend.when('GET', 'l10n/en_US.json').respond({});
    $httpBackend.when('GET', 'https://identity.webex.com/identity/scim/null/v1/Users/me').respond({});
    $httpBackend.when('POST', 'https://conv-a.wbx2.com/conversation/api/v1/users/deskFeedbackUrl').respond({});
  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<cr-user-info/>")($rootScope);
    $rootScope.$digest();

    expect($rootScope.sendFeedback).toBeTruthy();
    $rootScope.sendFeedback = sinon.stub();

    element.find('#feedback-lnk').click();
    expect($rootScope.sendFeedback.callCount).toBe(1);
  });
});
