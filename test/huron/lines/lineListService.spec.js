'use strict';

describe('Service: LineListService', function () {
  var $httpBackend, LineListService;

  beforeEach(module('Huron'));

  beforeEach(inject(function (_$httpBackend_, _LineListService_) {
    $httpBackend = _$httpBackend_;
    LineListService = _LineListService_;
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('LineListService', function () {

    it('should get all the user list line list', function () {
      $httpBackend.whenGET('/modules/huron/lines/all.json?count=100&searchStr=&skip=0&sortBy=name&sortOrder=ascending').respond(200, []);
      LineListService.getLineList(0, 100, 'name', 'ascending', '', 'all')
        .then(function (response) {
          expect(response).toBeTruthy();
        });
      $httpBackend.flush();
    });

    it('should get the sorted user line list based on search pattern', function () {
      $httpBackend.whenGET('/modules/huron/lines/all.json?count=100&searchStr=100&skip=0&sortBy=name&sortOrder=ascending').respond(200, []);
      LineListService.getLineList(0, 100, 'name', 'ascending', '100', 'all')
        .then(function (response) {
          expect(response).toBeTruthy();
        });
      $httpBackend.flush();
    });

    it('should get assigned user line list', function () {
      $httpBackend.whenGET('/modules/huron/lines/assignedLines.json?count=100&searchStr=&skip=0&sortBy=name&sortOrder=ascending').respond(200, []);
      LineListService.getLineList(0, 100, 'name', 'ascending', '', 'assignedLines')
        .then(function (response) {
          expect(response).toBeTruthy();
        });
      $httpBackend.flush();
    });
  });

});
