/**
 * Created by snzheng on 16/9/23.
 */
'use strict';

describe('Message service', function () {
  var DcomponentService, $http;
  var newComponent;
  function dependencies(_DcomponentService_, _$http_) {
    //  $httpBackend = _$httpBackend_;
    DcomponentService = _DcomponentService_;
    $http = _$http_;
    spyOn($http, 'put').and.returnValue(
      true
    );
    newComponent = { "componentId": 463, "serviceId": 141, "componentName": "Chat", "status": "operational", "description": "" };
  }
  beforeEach(angular.mock.module('Status'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(inject(dependencies));
  it('should exist', function () {
    expect(DcomponentService).toBeDefined();
  });
  it('should getComponents successfully', function () {
    DcomponentService
      .getComponents(141)
      .then(function (components) {
        for (var component in components) {
          expect(component.status).toBe("operational");
        }
      });
  });

  it('modifyComponent should call modify function', function () {
    var modifyResult = DcomponentService.modifyComponent(newComponent);
    expect(modifyResult).toBe(true);
  });

});
