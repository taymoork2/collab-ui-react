/**
 * Created by snzheng on 16/9/21.
 */
'use strict';

describe('Message service', function () {
  var ComponentsService, $http;
  var newComponent;
  function dependencies(_ComponentsService_, _$http_) {
    //  $httpBackend = _$httpBackend_;
    ComponentsService = _ComponentsService_;
    $http = _$http_;
    spyOn($http, 'post').and.returnValue(
      true
    );
    spyOn($http, 'delete').and.returnValue(
      true
    );
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
    expect(ComponentsService).toBeDefined();
  });
  it('should getComponents successfully', function () {
    ComponentsService
      .getComponents(141)
      .then(function (components) {
        for (var component in components) {
          expect(component.status).toBe("operational");
        }
      });
  });
  it('should getGroupComponents successfully', function () {
    ComponentsService
      .getGroupComponents(141)
      .then(function (components) {
        expect(components[0].componentId).toEqual(461);
        expect(components[1].componentId).toEqual(501);
      });
  });
  it('addComponent should call post function', function () {
    var addResult = ComponentsService.addComponent(141, newComponent);
    expect(addResult).toBe(true);
  });
  it('delComponent should call delete function', function () {
    var deleteResult = ComponentsService.delComponent(newComponent);
    expect(deleteResult).toBe(true);
  });
  it('modifyComponent should call modify function', function () {
    var modifyResult = ComponentsService.modifyComponent(newComponent);
    expect(modifyResult).toBe(true);
  });

});
