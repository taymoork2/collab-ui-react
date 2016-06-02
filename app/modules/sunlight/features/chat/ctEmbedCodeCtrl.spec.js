'use strict';

describe('Chat template embed code control', function () {

  var controller, $scope, CTService, createController, createControllerWithNoTemplateId;

  beforeEach(module('Sunlight'));

  beforeEach(inject(function ($controller, $rootScope, _CTService_) {
    $scope = $rootScope.$new();
    CTService = _CTService_;

    createController = function () {
      return $controller('EmbedCodeCtrl', {
        $scope: $scope,
        CTService: CTService,
        templateId: 'abc123'
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

});
