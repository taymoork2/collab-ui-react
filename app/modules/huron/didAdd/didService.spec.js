'use strict';

describe('Controller: DidService', function () {
  var DidService;
  var didTestData = ['12223334444', '14443332222', '19998887777', '17776665555'];

  beforeEach(angular.mock.module('Huron'));

  beforeEach(
    inject(
      function (_DidService_) {
        DidService = _DidService_;

        angular.forEach(didTestData, function (did) {
          DidService.addDid(did);
        });
      }));

  it('should be registered', function () {
    expect(DidService).toBeDefined();
  });

  it('should return the correct array', function () {
    expect(DidService.getDidList()).toEqual(didTestData);
  });

  it('didList count should increase by one when addDid is called', function () {
    expect(DidService.getDidList().length).toEqual(4);
    DidService.addDid('12223335555');
    expect(DidService.getDidList().length).toEqual(5);
  });

  it('didList count should decrease by one when addDid is called', function () {
    expect(DidService.getDidList().length).toEqual(4);
    DidService.removeDid('12223334444');
    expect(DidService.getDidList().length).toEqual(3);
  });

  it('didList should be empty when clearDidList is called', function () {
    expect(DidService.getDidList().length).toEqual(4);
    DidService.clearDidList();
    expect(DidService.getDidList().length).toEqual(0);
  });

});
