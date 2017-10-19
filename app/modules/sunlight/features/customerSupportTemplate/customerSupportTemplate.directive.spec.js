'use strict';

describe('Directive: customerSupportTemplate', function () {
  var $compile, $rootScope;
  var element;

  // ct-name and ct-summary are not being tested as they dont have any titles
  var pageDirectives = [
    'ct-profile',
    'ct-overview',
    'ct-proactive-prompt',
    'ct-customer',
    'ct-feedback',
    'ct-agent-unavailable',
    'ct-off-hours',
    'ct-chat-status-messages',
  ];

  afterEach(function () {
    if (element) {
      element.remove();
    }
    element = undefined;
  });

  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $rootScope.careSetupAssistant = {};
  }));

  function validateAppropriateContent(directiveName, expectedContent) {
    element = $compile('<' + directiveName + " mode='chat'/>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain(expectedContent);
    expect($rootScope.careSetupAssistant.cardMode).toContain('chat');
  }

  it('replaces the elements with the appropriate content', function () {
    pageDirectives.forEach(function (directiveName) {
      validateAppropriateContent(directiveName, 'ct-title');
    });
  });

  it('replaces the elements of ct-name with the appropriate content', function () {
    validateAppropriateContent('ct-name', 'ct-input');
  });
});
