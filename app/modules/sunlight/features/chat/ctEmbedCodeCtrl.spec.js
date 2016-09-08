'use strict';

describe('Chat template embed code control', function () {

  var controller, $scope, CTService, createController, mockWindow, anchorElem, fakeCodeSnippet;

  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('Hercules'));

  beforeEach(inject(function ($controller, $rootScope, _CTService_, $window) {
    $scope = $rootScope.$new();
    CTService = _CTService_;
    mockWindow = $window;
    anchorElem = mockWindow.document.createElement('a');
    anchorElem.setAttribute('id', 'downloadChatCodeTxt');
    mockWindow.document.body.appendChild(anchorElem);
    createController = function () {
      return $controller('EmbedCodeCtrl', {
        $scope: $scope,
        CTService: CTService,
        templateId: 'abc123',
        templateHeader: 'chat template header'
      });
    };
    fakeCodeSnippet = 'some_fake_script';
    spyOn(CTService, 'generateCodeSnippet').and.returnValue(fakeCodeSnippet);
  }));

  it('should get embed chat code snippet', function () {
    controller = createController();
    var result = controller.embedCodeSnippet;
    expect(result).toBe(fakeCodeSnippet);
  });

  it('should download the embed code on Chrome/Firefox', function () {
    controller = createController();
    mockWindow.navigator.msSaveOrOpenBlob = false;
    controller.downloadEmbedCode();
    expect(anchorElem.getAttribute('href')).toBeDefined();
    expect(anchorElem.getAttribute('download')).toBeDefined();
  });

  it('should download the embed code on IE/EDGE', function () {
    var mockEvent = { preventDefault: jasmine.createSpy() };
    controller = createController();
    mockWindow.navigator.msSaveOrOpenBlob = true;
    mockWindow.navigator.msSaveBlob = jasmine.createSpy();
    controller.downloadEmbedCode(mockEvent);
    expect(mockWindow.navigator.msSaveBlob).toHaveBeenCalled();
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

});
