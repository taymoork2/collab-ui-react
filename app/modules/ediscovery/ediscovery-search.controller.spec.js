'use strict';
describe('Controller: EdiscoverySearchController', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var ediscoverySearchController, EdiscoveryService, EdiscoveryNotificationService, $q, $controller, httpBackend, $translate, $scope;

  beforeEach(inject(function (_$translate_, _EdiscoveryService_, _EdiscoveryNotificationService_, _$q_, _$rootScope_, $httpBackend, _$controller_, Notification) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    httpBackend = $httpBackend;
    EdiscoveryService = _EdiscoveryService_;
    EdiscoveryNotificationService = _EdiscoveryNotificationService_;
    $translate = _$translate_;
    $q = _$q_;
    Notification = _Notification_;

    httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});

    ediscoverySearchController = $controller('EdiscoverySearchController', {
      $translate: $translate,
      $scope: $scope,
      EdiscoveryService: EdiscoveryService,
      EdiscoveryNotificationService: EdiscoveryNotificationService,
      Notification: Notification
    });

  }));

  beforeEach(function () {
    sinon.stub(EdiscoveryService, 'getAvalonServiceUrl');
    var promise = $q.resolve({
      "avalonRoomsUrl": "https://whatever.com/myFancyRoomsApi"
    });
    EdiscoveryService.getAvalonServiceUrl.returns(promise);
    sinon.stub(EdiscoveryNotificationService, 'notify', function () {});
  });

  describe('Search for room', function () {
    beforeEach(function () {
      expect(ediscoverySearchController.searchingForRoom).toBeFalsy();
      expect(ediscoverySearchController.searchButtonDisabled()).toBeTruthy();
    });

    afterEach(function () {
      expect(ediscoverySearchController.searchingForRoom).toBeFalsy();
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

      expect(ediscoverySearchController.searchingForRoom).toBeFalsy();

      var expectedArgument = "https://whatever.com/myFancyRoomsApi" + "/" + "myRoomId";
      expect(EdiscoveryService.getAvalonRoomInfo.withArgs(expectedArgument).callCount).toBe(1);

    });

    describe('finds a room', function () {
      var lastReadableActivityDate = moment().subtract(1, "day");
      var publishedDate = moment().subtract(2, "day");

      beforeEach(function () {
        sinon.stub(EdiscoveryService, 'getAvalonRoomInfo');

        var promise = $q.resolve({
          "id": "1234",
          "displayName": "whatever",
          "lastReadableActivityDate": lastReadableActivityDate,
          "published": publishedDate
        });
        EdiscoveryService.getAvalonRoomInfo.returns(promise);
      });

      it('prepopulates search date with relevant room info data', function () {
        ediscoverySearchController.searchForRoom("myRoomId");
        expect(ediscoverySearchController.searchingForRoom).toBeTruthy();
        expect(ediscoverySearchController.searchButtonDisabled()).toBeTruthy();
        httpBackend.flush();

        expect(ediscoverySearchController.searchCriteria.roomId).toEqual("myRoomId");
        expect(ediscoverySearchController.searchCriteria.displayName).toEqual("whatever");
        expect(ediscoverySearchController.searchCriteria.startDate).toEqual(publishedDate);
        expect(ediscoverySearchController.searchCriteria.endDate).toEqual(lastReadableActivityDate);

        expect(ediscoverySearchController.searchButtonDisabled()).toBeFalsy();

      });

    });

    it('found no room', function () {
      sinon.stub(EdiscoveryService, 'getAvalonRoomInfo');
      var promise = $q.reject({
        "status": "404"
      });
      EdiscoveryService.getAvalonRoomInfo.returns(promise);

      ediscoverySearchController.searchForRoom("myRoomId");
      expect(ediscoverySearchController.searchingForRoom).toBeTruthy();
      expect(ediscoverySearchController.searchButtonDisabled()).toBeTruthy();
      httpBackend.flush();

      expect(ediscoverySearchController.searchButtonDisabled()).toBeFalsy();
      expect(ediscoverySearchController.error).toEqual("ediscovery.searchError");
      expect(ediscoverySearchController.roomInfo).toBeNull();

    });
  });

  describe('Create report', function () {

    it('with happy-clappy legal input parameters', function () {
      ediscoverySearchController.searchCriteria.roomId = "whatever";
      ediscoverySearchController.searchCriteria.endDate = moment().format();
      ediscoverySearchController.searchCriteria.startDate = moment().subtract(1, "day").format();

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

      expect(EdiscoveryService.runReport.callCount).toBe(1);
      expect(EdiscoveryService.createReport.withArgs(sinon.match.any, sinon.match.any, sinon.match.any, sinon.match.any).callCount).toBe(1);
    });

    it('receives error from atlas backend', function () {
      var errorNotification = sinon.stub(Notification, "error");
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
      expect(errorNotification.called).toBeTruthy();
      expect(ediscoverySearchController.report).toBe(null);
    });

    it('receives error from avalon backend', function () {
      sinon.stub(Notification, "error");
      ediscoverySearchController.searchCriteria.roomId = "whatever";
      ediscoverySearchController.searchCriteria.endDate = moment().format();
      ediscoverySearchController.searchCriteria.startDate = moment().subtract(1, "day").format();

      sinon.stub(EdiscoveryService, 'runReport');
      var promise = $q.reject();
      EdiscoveryService.runReport.returns(promise);

      sinon.stub(EdiscoveryService, 'createReport');
      promise = $q.resolve({
        "displayName": "test",
        "url": "whatever",
        "id": "12345678"
      });
      EdiscoveryService.createReport.returns(promise);

      sinon.stub(EdiscoveryService, 'patchReport');
      promise = $q.resolve({});
      EdiscoveryService.patchReport.returns(promise);

      sinon.stub(EdiscoveryService, 'getReport');
      promise = $q.resolve({
        "displayName": "test",
        "url": "whatever",
        "id": "12345678"
      });
      EdiscoveryService.getReport.returns(promise);

      ediscoverySearchController.createReport();
      httpBackend.flush();

      expect(EdiscoveryService.runReport.callCount).toBe(1);
      expect(EdiscoveryService.createReport.withArgs(sinon.match.any, sinon.match.any, sinon.match.any, sinon.match.any).callCount).toBe(1);
      expect(Notification.error.callCount).toBe(1);
      expect(EdiscoveryService.patchReport.callCount).toBe(1);
    });

  });

  describe('entering controller with stateParams', function () {

    var $stateParams;

    beforeEach(inject(function (_$stateParams_, _$translate_, _EdiscoveryService_, _$q_, _$rootScope_, $httpBackend, _$controller_) {
      $scope = _$rootScope_.$new();
      $controller = _$controller_;
      httpBackend = $httpBackend;
      EdiscoveryService = _EdiscoveryService_;
      $translate = _$translate_;
      $q = _$q_;
      $stateParams = _$stateParams_;

      httpBackend
        .when('GET', 'l10n/en_US.json')
        .respond({});
    }));

    it('inits a rerun using stateParams content', function () {
      ediscoverySearchController = $controller('EdiscoverySearchController', {
        $translate: $translate,
        $scope: $scope,
        EdiscoveryService: EdiscoveryService,
        $stateParams: {
          report: {
            id: '1234',
            displayName: 'whatever',
            roomQuery: {
              roomId: 'roomIdFromStateParam',
              startDate: 'startDateFromStateParam',
              endDate: 'endDateFromStateParam'
            }
          },
          reRun: true
        }
      });

      expect(ediscoverySearchController.searchCriteria.roomId).toEqual('roomIdFromStateParam');
      expect(ediscoverySearchController.searchCriteria.displayName).toEqual('whatever');
      expect(ediscoverySearchController.searchCriteria.startDate).toEqual('startDateFromStateParam');
      expect(ediscoverySearchController.searchCriteria.endDate).toEqual('endDateFromStateParam');
      expect(ediscoverySearchController.report).toBe(null);
      expect(ediscoverySearchController.currentReportId).toBe(null);
    });

    it('shows a report and starts polling when stateParams rerun is false', function () {
      ediscoverySearchController = $controller('EdiscoverySearchController', {
        $translate: $translate,
        $scope: $scope,
        EdiscoveryService: EdiscoveryService,
        $stateParams: {
          report: {
            id: '4567',
            displayName: 'whatever',
            roomQuery: {
              roomId: 'roomIdFromStateParam',
              startDate: 'startDateFromStateParam',
              endDate: 'endDateFromStateParam',
            }
          },
          reRun: false
        }
      });
      expect(ediscoverySearchController.searchCriteria.roomId).toEqual('roomIdFromStateParam');
      expect(ediscoverySearchController.searchCriteria.displayName).toEqual('whatever');
      expect(ediscoverySearchController.searchCriteria.startDate).toEqual('startDateFromStateParam');
      expect(ediscoverySearchController.searchCriteria.endDate).toEqual('endDateFromStateParam');
      expect(ediscoverySearchController.report.id).toEqual('4567');
      expect(ediscoverySearchController.report.displayName).toEqual('whatever');
      expect(ediscoverySearchController.currentReportId).toBe('4567');
    });

  });

});
