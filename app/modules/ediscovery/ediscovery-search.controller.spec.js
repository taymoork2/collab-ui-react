'use strict';
describe('Controller: EdiscoverySearchController', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var ediscoverySearchController, EdiscoveryService, $q, $controller, httpBackend, $translate, $scope;

  beforeEach(inject(function (_$translate_, _EdiscoveryService_, _$q_, _$rootScope_, $httpBackend, _$controller_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    httpBackend = $httpBackend;
    EdiscoveryService = _EdiscoveryService_;
    $translate = _$translate_;
    $q = _$q_;

    httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});

    ediscoverySearchController = $controller('EdiscoverySearchController', {
      $translate: $translate,
      $scope: $scope,
      EdiscoveryService: EdiscoveryService
    });

  }));

  describe('Search for room', function () {
    beforeEach(function () {
      sinon.stub(EdiscoveryService, 'getAvalonServiceUrl');
      var promise = $q.resolve({
        "avalonRoomsUrl": "https://whatever.com/myFancyRoomsApi"
      });
      EdiscoveryService.getAvalonServiceUrl.returns(promise);

      expect(ediscoverySearchController.searchInProgress).toBeFalsy();
      expect(ediscoverySearchController.searchButtonDisabled()).toBeTruthy();
    });

    afterEach(function () {
      expect(ediscoverySearchController.searchInProgress).toBeFalsy();
    });

    it('search button disabled when empty roomId search input', function () {
      ediscoverySearchController.searchCriteria.roomId = "";
      expect(ediscoverySearchController.searchButtonDisabled()).toBeTruthy();
      ediscoverySearchController.searchCriteria.roomId = "whatever";
      expect(ediscoverySearchController.searchButtonDisabled()).toBeFalsy();
    });

    it('uses combined avalonRoomsUrl and room id to get room info', function () {

      sinon.stub(EdiscoveryService, 'getAvalonRoomInfo');
      var promise = $q.resolve({});
      EdiscoveryService.getAvalonRoomInfo.returns(promise);

      ediscoverySearchController.searchForRoom("myRoomId");
      httpBackend.flush();

      expect(ediscoverySearchController.searchInProgress).toBeFalsy();

      var expectedArgument = "https://whatever.com/myFancyRoomsApi" + "/" + "myRoomId";
      expect(EdiscoveryService.getAvalonRoomInfo.withArgs(expectedArgument).callCount).toBe(1);
      expect(ediscoverySearchController.searchButtonDisabled()).toBeTruthy();

    });

    it('found a room', function () {

      sinon.stub(EdiscoveryService, 'getAvalonRoomInfo');
      var promise = $q.resolve({
        "displayName": "whatever"
      });
      EdiscoveryService.getAvalonRoomInfo.returns(promise);

      ediscoverySearchController.searchForRoom("myRoomId");
      expect(ediscoverySearchController.searchInProgress).toBeTruthy();
      expect(ediscoverySearchController.searchButtonDisabled()).toBeTruthy();
      httpBackend.flush();

      expect(ediscoverySearchController.roomInfo).toEqual({
        "displayName": "whatever"
      });
      expect(ediscoverySearchController.searchButtonDisabled()).toBeTruthy();

    });

    it('found no room', function () {

      sinon.stub(EdiscoveryService, 'getAvalonRoomInfo');
      var promise = $q.reject({
        "status": "404"
      });
      EdiscoveryService.getAvalonRoomInfo.returns(promise);

      ediscoverySearchController.searchForRoom("myRoomId");
      expect(ediscoverySearchController.searchInProgress).toBeTruthy();
      expect(ediscoverySearchController.searchButtonDisabled()).toBeTruthy();
      httpBackend.flush();

      expect(ediscoverySearchController.error).toEqual("ediscovery.searchError");
      expect(ediscoverySearchController.searchButtonDisabled()).toBeTruthy();

    });
  });

  describe('Create report', function () {

    it('with happy-clappy legal input parameters', function () {

      sinon.stub(EdiscoveryService, 'runReport');
      var deferedRunReportResult = $q.defer();
      EdiscoveryService.runReport.returns(deferedRunReportResult.promise);

      sinon.stub(EdiscoveryService, 'createReport');
      var promise = $q.resolve({
        "displayName": "test",
        "url": "whatever",
        "id": "12345678"
      });
      EdiscoveryService.createReport.returns(promise);

      ediscoverySearchController.createReport();
      httpBackend.flush();

      expect(ediscoverySearchController.searchResult).toEqual({
        "displayName": "test",
        "url": "whatever",
        "id": "12345678"
      });

      expect(EdiscoveryService.runReport.callCount).toBe(1);

    });

    it('receives error from backend', function () {

      sinon.stub(EdiscoveryService, 'createReport');
      var promise = $q.reject({
        data: {
          "errorCode": 420000,
          "message": "Invalid Input",
          "errors": [{
            "errorCode": 420000,
            "description": "displayName: may not be empty"
          }]
        }
      });
      EdiscoveryService.createReport.returns(promise);

      ediscoverySearchController.createReport();
      httpBackend.flush();

      expect(ediscoverySearchController.errors).toEqual(
        [{
          "errorCode": 420000,
          "description": "displayName: may not be empty"
        }]
      );
    });

  });

});
