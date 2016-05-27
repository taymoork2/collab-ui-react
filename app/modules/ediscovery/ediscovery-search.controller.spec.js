'use strict';
describe('Controller: EdiscoverySearchController', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var EdiscoveryService, $q, $controller, httpBackend, $translate, $scope;

  beforeEach(inject(function (_EdiscoveryService_, _$q_, _$rootScope_, $httpBackend, _$controller_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    httpBackend = $httpBackend;
    EdiscoveryService = _EdiscoveryService_;
    $q = _$q_;

    httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});
  }));

  describe('Create report', function () {
    var ediscoverySearchController;
    beforeEach(function () {
      ediscoverySearchController = $controller('EdiscoverySearchController', {
        $translate: $translate,
        $scope: $scope,
        EdiscoveryService: EdiscoveryService
      });
    });

    it('with happy-clappy legal input parameters', function () {

      var runReportSpy = sinon.stub(EdiscoveryService, 'runReport');
      var deferedRunReportResult = $q.defer();
      EdiscoveryService.runReport.returns(deferedRunReportResult.promise);

      sinon.stub(EdiscoveryService, 'createReport');
      var deferedResult = $q.defer();
      deferedResult.resolve({
        "displayName": "test",
        "url": "whatever",
        "id": "12345678"
      });
      EdiscoveryService.createReport.returns(deferedResult.promise);

      ediscoverySearchController.createReport();
      httpBackend.flush();

      expect(ediscoverySearchController.searchResult).toEqual({
        "displayName": "test",
        "url": "whatever",
        "id": "12345678"
      });

      expect(runReportSpy.callCount).toBe(1);

    });

    it('get error from backend', function () {
      sinon.stub(EdiscoveryService, 'createReport');
      var deferedResult = $q.defer();
      deferedResult.reject({
        data: {
          "errorCode": 420000,
          "message": "Invalid Input",
          "errors": [{
            "errorCode": 420000,
            "description": "displayName: may not be empty"
          }]
        }
      });

      EdiscoveryService.createReport.returns(deferedResult.promise);

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
