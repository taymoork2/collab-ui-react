'use strict';

describe('Directive: setupAssistantPages', function () {
  var $compile, $rootScope;

  // ct-name and ct-summary are not being tested as they dont have any titles
  var pageDirectives = [
    'ct-profile',
    'ct-overview',
    'ct-customer',
    'ct-feedback',
    'ct-agent-unavailable',
    'ct-off-hours',
    'ct-chat-status-messages'
  ];

  beforeEach(module('Sunlight'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  function validateAppropriateContent(directiveName, expectedContent) {
    var element = $compile("<" + directiveName + "/>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain(expectedContent);
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
