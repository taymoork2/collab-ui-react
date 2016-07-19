'use strict';

describe('Chat template embed code control', function () {

  var controller, $scope, CTService, createController, createControllerWithNoTemplateId, mockWindow;

  beforeEach(module('Sunlight'));
  beforeEach(module('Hercules'));

  beforeEach(inject(function ($controller, $rootScope, _CTService_, $window) {
    $scope = $rootScope.$new();
    CTService = _CTService_;
    mockWindow = $window;
    createController = function () {
      return $controller('EmbedCodeCtrl', {
        $scope: $scope,
        CTService: CTService,
        templateId: 'abc123',
        templateHeader: 'chat template header'
      });
    };

  }));

  it('should get embed chat code snippet', function () {
    var fakeCodeSnippet = 'some_fake_script';
    spyOn(CTService, 'generateCodeSnippet').and.returnValue(fakeCodeSnippet);
    controller = createController();
    var result = controller.embedCodeSnippet;
    expect(result).toBe(fakeCodeSnippet);
  });

  it('should click the anchor element', function () {
    var fakeCodeSnippet = 'some_fake_script';
    spyOn(CTService, 'generateCodeSnippet').and.returnValue(fakeCodeSnippet);
    controller = createController();
    var anchorElem = mockWindow.document.createElement('a');
    anchorElem.setAttribute('id', 'downloadChatCodeTxt');
    mockWindow.document.body.appendChild(anchorElem);

    controller.downloadEmbedCode();

    expect(anchorElem.getAttribute('href')).toEqual('data:text/plain;charset=utf-8,some_fake_script');
  });

});
