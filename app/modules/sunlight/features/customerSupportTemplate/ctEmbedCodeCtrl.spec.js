'use strict';

describe('Chat template embed code control', function () {
  var controller, $scope, CTService, createController, mockWindow, anchorElem, fakeCodeSnippet, SunlightConfigService, q;

  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('Hercules'));

  beforeEach(inject(function ($controller, $rootScope, _CTService_, $window, _SunlightConfigService_, $q) {
    q = $q;
    $scope = $rootScope.$new();
    CTService = _CTService_;
    SunlightConfigService = _SunlightConfigService_;
    mockWindow = $window;
    anchorElem = mockWindow.document.createElement('a');
    anchorElem.setAttribute('id', 'downloadChatCodeTxt');
    mockWindow.document.body.appendChild(anchorElem);
    createController = function () {
      return $controller('EmbedCodeCtrl', {
        $scope: $scope,
        CTService: CTService,
        templateId: 'abc123',
        templateHeader: 'chat template header',
        SunlightConfigService: SunlightConfigService,
        templateName: 'dummyTemplate',
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

  it('should return null data when the org has no verified domains', function () {
    spyOn(SunlightConfigService, 'getChatConfig').and.callFake(function () {
      var data = {
        allowedOrigins: [
          '.*',
        ],
      };
      return q.resolve({ data: data });
    });
    controller = createController();
    $scope.$apply();
    var result = controller.domainInfo;
    expect(result.data).toBe(null);
    expect(result.error).toBe(false);
    expect(result.warn).toBe(true);
  });

  it('should return data when the org has verified domains', function () {
    spyOn(SunlightConfigService, 'getChatConfig').and.callFake(function () {
      var data = {
        allowedOrigins: [
          'ciscoccservice.com',
          'cisco.com',
        ],
      };
      return q.resolve({ data: data });
    });
    controller = createController();
    $scope.$apply();
    var result = controller.domainInfo;
    expect(result.data.length).toBe(2);
    expect(result.error).toBe(false);
    expect(result.warn).toBe(false);
  });

  it('should return error when config service gives a error response', function () {
    spyOn(SunlightConfigService, 'getChatConfig').and.callFake(function () {
      return q.reject({});
    });
    controller = createController();
    $scope.$apply();
    var result = controller.domainInfo;
    expect(result.data).toBe(null);
    expect(result.error).toBe(true);
    expect(result.warn).toBe(false);
  });
});
