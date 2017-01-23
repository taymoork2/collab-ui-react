'use strict';

describe('Controller: EdiscoverySearchController', function () {
  beforeEach(angular.mock.module('Ediscovery'));

  var $controller, $q, $scope, $translate, ediscoverySearchController, EdiscoveryService, EdiscoveryNotificationService, FeatureToggleService, Notification;

  beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _$translate_, _EdiscoveryService_, _EdiscoveryNotificationService_, _FeatureToggleService_, _Notification_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    $q = _$q_;
    $translate = _$translate_;
    EdiscoveryService = _EdiscoveryService_;
    EdiscoveryNotificationService = _EdiscoveryNotificationService_;
    FeatureToggleService = _FeatureToggleService_;
    Notification = _Notification_;

    spyOn(FeatureToggleService, 'atlasEdiscoveryGetStatus').and.returnValue($q.resolve(false));

  }));

  function initController() {
    ediscoverySearchController = $controller('EdiscoverySearchController', {
      $scope: $scope,
      $translate: $translate,
      EdiscoveryService: EdiscoveryService,
      EdiscoveryNotificationService: EdiscoveryNotificationService,
      FeatureToggleService: FeatureToggleService,
      Notification: Notification
    });

    $scope.$apply();
  }

  describe('Search for room', function () {
    beforeEach(function () {
      var lastReadableActivityDate = moment().subtract(1, 'day');
      var publishedDate = moment().subtract(2, 'day');

      var promiseUrl = $q.resolve({
        avalonRoomsUrl: 'https://whatever.com/myFancyRoomsApi',
      });

      var promise = $q.resolve({
        id: '1234',
        displayName: 'whatever',
        participants: {
          items: ['abc@test.com']
        },
        lastReadableActivityDate: lastReadableActivityDate,
        published: publishedDate,
      });

      spyOn(EdiscoveryService, 'getAvalonServiceUrl').and.returnValue(promiseUrl);
      spyOn(EdiscoveryService, 'getAvalonRoomInfo').and.returnValue(promise);
    });

    beforeEach(initController);

    beforeEach(function () {
      expect(ediscoverySearchController.searchingForRoom).toBeFalsy();
      expect(ediscoverySearchController.searchButtonDisabled()).toBeTruthy();
    });

    afterEach(function () {
      expect(ediscoverySearchController.searchingForRoom).toBeFalsy();
    });

    it('search button disabled when empty roomId search input', function () {
      ediscoverySearchController.searchCriteria.roomId = '';
      expect(ediscoverySearchController.searchButtonDisabled()).toBeTruthy();
      ediscoverySearchController.searchCriteria.roomId = 'whatever';
      expect(ediscoverySearchController.searchButtonDisabled()).toBeFalsy();
    });

    it('uses combined avalonRoomsUrl and room id to get room info', function () {
      ediscoverySearchController.searchForRoom('myRoomId');
      $scope.$apply();

      expect(ediscoverySearchController.searchingForRoom).toBeFalsy();

      expect(EdiscoveryService.getAvalonRoomInfo.calls.count()).toBe(1);

    });
  });

  describe('Search for room with status 404', function () {
    beforeEach(function () {
      sinon.stub(EdiscoveryService, 'getAvalonServiceUrl');
      var promiseUrl = $q.resolve({
        "avalonRoomsUrl": "https://whatever.com/myFancyRoomsApi",
      });
      EdiscoveryService.getAvalonServiceUrl.returns(promiseUrl);

      sinon.stub(EdiscoveryService, 'getAvalonRoomInfo');
      var promise = $q.reject({
        "status": 404
      });
      EdiscoveryService.getAvalonRoomInfo.returns(promise);
    });

    beforeEach(initController);

    it('found no room', function () {
      ediscoverySearchController.searchForRoom("myRoomId");
      expect(ediscoverySearchController.searchingForRoom).toBeTruthy();
      expect(ediscoverySearchController.searchButtonDisabled()).toBeTruthy();
      $scope.$apply();

      expect(ediscoverySearchController.searchButtonDisabled()).toBeFalsy();
      expect(ediscoverySearchController.error).toEqual("ediscovery.search.roomNotFound");
      expect(ediscoverySearchController.roomInfo).toBeNull();

    });

  });

  describe('Search for room with status 400', function () {
    beforeEach(function () {
      sinon.stub(EdiscoveryService, 'getAvalonServiceUrl');
      var promiseUrl = $q.resolve({
        "avalonRoomsUrl": "https://whatever.com/myFancyRoomsApi",
      });
      EdiscoveryService.getAvalonServiceUrl.returns(promiseUrl);

      sinon.stub(EdiscoveryService, 'getAvalonRoomInfo');
      var promise = $q.reject({
        "status": 400
      });
      EdiscoveryService.getAvalonRoomInfo.returns(promise);
    });

    beforeEach(initController);

    it('invalid room id', function () {
      ediscoverySearchController.searchForRoom("myRoomId");
      expect(ediscoverySearchController.searchingForRoom).toBeTruthy();
      expect(ediscoverySearchController.searchButtonDisabled()).toBeTruthy();
      $scope.$apply();

      expect(ediscoverySearchController.searchButtonDisabled()).toBeFalsy();
      expect(ediscoverySearchController.error).toEqual("ediscovery.search.invalidRoomId");
      expect(ediscoverySearchController.roomInfo).toBeNull();

    });
  });

  describe('Search for room with status 500', function () {
    beforeEach(function () {
      sinon.stub(EdiscoveryService, 'getAvalonServiceUrl');
      var promiseUrl = $q.resolve({
        "avalonRoomsUrl": "https://whatever.com/myFancyRoomsApi",
      });
      EdiscoveryService.getAvalonServiceUrl.returns(promiseUrl);

      sinon.stub(Notification, "error");
      sinon.stub(EdiscoveryService, 'getAvalonRoomInfo');
      var promise = $q.reject({
        "status": 500
      });
      EdiscoveryService.getAvalonRoomInfo.returns(promise);
    });

    beforeEach(initController);

    it('failed with an unexpected error', function () {
      ediscoverySearchController.searchForRoom("myRoomId");
      expect(ediscoverySearchController.searchingForRoom).toBeTruthy();
      expect(ediscoverySearchController.searchButtonDisabled()).toBeTruthy();
      $scope.$apply();

      expect(ediscoverySearchController.searchButtonDisabled()).toBeFalsy();
      expect(ediscoverySearchController.error).toEqual("ediscovery.search.roomNotFound");
      expect(ediscoverySearchController.roomInfo).toBeNull();
      expect(Notification.error.callCount).toBe(1);

    });
  });

  describe('finds a room', function () {
    beforeEach(function () {
      var lastReadableActivityDate = moment().subtract(1, "day");
      var publishedDate = moment().subtract(2, "day");

      sinon.stub(EdiscoveryService, 'getAvalonServiceUrl');
      var promiseUrl = $q.resolve({
        "avalonRoomsUrl": "https://whatever.com/myFancyRoomsApi",
      });
      EdiscoveryService.getAvalonServiceUrl.returns(promiseUrl);

      sinon.stub(EdiscoveryService, 'getAvalonRoomInfo');
      var promise = $q.resolve({
        id: '1234',
        displayName: 'whatever',
        participants: {
          items: ['abc@test.com']
        },
        lastReadableActivityDate: lastReadableActivityDate,
        published: publishedDate,
      });
      EdiscoveryService.getAvalonRoomInfo.returns(promise);
    });

    beforeEach(initController);

    it('prepopulates search date with relevant room info data', function () {
      ediscoverySearchController.searchForRoom('myRoomId');
      expect(ediscoverySearchController.searchingForRoom).toBeTruthy();
      expect(ediscoverySearchController.searchButtonDisabled()).toBeTruthy();
      $scope.$apply();

      expect(ediscoverySearchController.searchCriteria.roomId).toEqual('myRoomId');
      expect(ediscoverySearchController.searchCriteria.displayName).toEqual('whatever');
      //expect(ediscoverySearchController.searchCriteria.startDate).toEqual(publishedDate);
      //expect(ediscoverySearchController.searchCriteria.endDate).toEqual(lastReadableActivityDate);

      expect(ediscoverySearchController.searchButtonDisabled()).toBeFalsy();

    });

  });

  describe('Create report', function () {
    beforeEach(function () {
      sinon.stub(EdiscoveryService, 'runReport');
      var deferedRunReportResult = $q.defer();
      EdiscoveryService.runReport.returns(deferedRunReportResult.promise);

      sinon.stub(EdiscoveryService, 'createReport');
      var promise = $q.resolve({
        displayName: 'test',
        url: 'whatever',
        id: '12345678'
      });
      EdiscoveryService.createReport.returns(promise);
    });

    beforeEach(initController);

    it('with happy-clappy legal input parameters', function () {
      ediscoverySearchController.searchCriteria.roomId = 'whatever';
      ediscoverySearchController.searchCriteria.endDate = moment().format();
      ediscoverySearchController.searchCriteria.startDate = moment().subtract(1, 'day').format();

      ediscoverySearchController.createReport();
      $scope.$apply();

      expect(EdiscoveryService.runReport.callCount).toBe(1);
      expect(EdiscoveryService.createReport.withArgs(sinon.match.any, sinon.match.any, sinon.match.any, sinon.match.any).callCount).toBe(1);
    });

  });

  describe('Create report with error', function () {
    beforeEach(function () {
      sinon.stub(EdiscoveryService, 'createReport');
      var promise = $q.reject({
        data: {
          errorCode: 420000,
          message: 'Invalid Input',
          errors: [{
            errorCode: 420000,
            description: 'displayName: may not be empty'
          }]
        }
      });
      EdiscoveryService.createReport.returns(promise);
    });

    beforeEach(initController);

    it('received from atlas backend', function () {
      var errorNotification = sinon.stub(Notification, 'error');
      ediscoverySearchController.createReport();
      $scope.$apply();
      expect(errorNotification.called).toBeTruthy();
      expect(ediscoverySearchController.report).toBe(null);
    });
  });

  describe('Create report with error', function () {
    beforeEach(function () {
      sinon.stub(Notification, 'error');
      ediscoverySearchController.searchCriteria.roomId = 'whatever';
      ediscoverySearchController.searchCriteria.endDate = moment().format();
      ediscoverySearchController.searchCriteria.startDate = moment().subtract(1, 'day').format();

      sinon.stub(EdiscoveryService, 'runReport');
      var promise = $q.reject();
      EdiscoveryService.runReport.returns(promise);

      sinon.stub(EdiscoveryService, 'createReport');
      promise = $q.resolve({
        displayName: 'test',
        url: 'whatever',
        id: '12345678'
      });
      EdiscoveryService.createReport.returns(promise);

      sinon.stub(EdiscoveryService, 'patchReport');
      promise = $q.resolve({});
      EdiscoveryService.patchReport.returns(promise);

      sinon.stub(EdiscoveryService, 'getReport');
      promise = $q.resolve({
        displayName: 'test',
        url: 'whatever',
        id: '12345678'
      });
      EdiscoveryService.getReport.returns(promise);
    });

    beforeEach(initController);

    it('received from avalon backend', function () {
      ediscoverySearchController.createReport();
      $scope.$apply();

      expect(EdiscoveryService.runReport.callCount).toBe(1);
      expect(EdiscoveryService.createReport.withArgs(sinon.match.any, sinon.match.any, sinon.match.any, sinon.match.any).callCount).toBe(1);
      expect(Notification.error.callCount).toBe(1);
      expect(EdiscoveryService.patchReport.callCount).toBe(1);
    });
  });

  describe('entering controller with stateParams', function () {

    beforeEach(inject(function (_$translate_, _EdiscoveryService_, _$q_, _$rootScope_, _$controller_) {
      $scope = _$rootScope_.$new();
      $controller = _$controller_;
      EdiscoveryService = _EdiscoveryService_;
      $translate = _$translate_;
      $q = _$q_;
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
