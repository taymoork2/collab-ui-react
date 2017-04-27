'use strict';

describe('Controller: EdiscoverySearchController', function () {
  beforeEach(angular.mock.module('Ediscovery'));
  beforeEach(angular.mock.module('Huron'));

  var $controller, $q, $scope, $translate, Analytics, ediscoverySearchController, EdiscoveryService, EdiscoveryNotificationService, FeatureToggleService, ITProPackService, Notification, TrialService;
  var promiseUrl, promise, result, startDate, endDate;

  beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _$translate_, _Analytics_, _EdiscoveryService_, _EdiscoveryNotificationService_, _FeatureToggleService_, _ITProPackService_, _Notification_, _TrialService_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    $q = _$q_;
    $translate = _$translate_;
    Analytics = _Analytics_;
    EdiscoveryService = _EdiscoveryService_;
    EdiscoveryNotificationService = _EdiscoveryNotificationService_;
    FeatureToggleService = _FeatureToggleService_;
    Notification = _Notification_;
    TrialService = _TrialService_;
    ITProPackService = _ITProPackService_;

    promiseUrl = $q.resolve({
      avalonRoomsUrl: 'https://whatever.com/myFancyRoomsApi',
    });

    spyOn(Analytics, 'trackEvent').and.returnValue($q.resolve());
    spyOn(FeatureToggleService, 'atlasEdiscoveryGetStatus').and.returnValue($q.resolve(false));
    spyOn(ITProPackService, 'hasITProPackPurchased').and.returnValue($q.resolve(false));
    spyOn(ITProPackService, 'hasITProPackEnabled').and.returnValue($q.resolve(false));
    spyOn(TrialService, 'getTrial').and.returnValue($q.resolve());
    spyOn(TrialService, 'getDaysLeftForCurrentUser');

  }));

  function initController() {
    ediscoverySearchController = $controller('EdiscoverySearchController', {
      $scope: $scope,
      $translate: $translate,
      Analytics: Analytics,
      EdiscoveryService: EdiscoveryService,
      EdiscoveryNotificationService: EdiscoveryNotificationService,
      FeatureToggleService: FeatureToggleService,
      Notification: Notification,
      ITProPackService: ITProPackService,
    });

    $scope.$apply();
  }

  describe('Search for space or email address', function () {
    beforeEach(function () {
      spyOn(EdiscoveryService, 'getArgonautServiceUrl').and.returnValue(promiseUrl);
    });

    beforeEach(initController);

    it('should contain default values', function () {
      expect(ediscoverySearchController.encryptedEmails).toBeNull();
      expect(ediscoverySearchController.unencryptedRoomIds).toBeNull();
    });
  });

  describe('Date Validation', function () {
    beforeEach(initController);

    it('should not return an error', function () {
      startDate = moment().subtract(30, 'days').format();
      endDate = moment().format();

      result = ediscoverySearchController.dateErrors(startDate, endDate);

      expect(result).toEqual([]);
    });

    it('should not have end date be before start date', function () {
      startDate = moment().format();
      endDate = moment().subtract(2, 'days').format();

      result = ediscoverySearchController.dateErrors(startDate, endDate);

      expect(result).toEqual(['ediscovery.dateError.StartDateMustBeforeEndDate']);
    });

    it('should not have a start date that is in the future', function () {
      startDate = moment().add(1, 'day').format();
      endDate = moment().format();

      result = ediscoverySearchController.dateErrors(startDate, endDate);

      expect(result).toEqual(['ediscovery.dateError.StartDateMustBeforeEndDate', 'ediscovery.dateError.StartDateCannotBeInTheFuture']);
    });

    it('should not exceed a 90 day range if itProPack is not purchased', function () {
      startDate = moment().subtract(91, 'days').format();
      endDate = moment().format();

      result = ediscoverySearchController.dateErrors(startDate, endDate);

      expect(result).toEqual(['ediscovery.dateError.InvalidDateRange']);
    });
  });

  describe('Search for room', function () {
    beforeEach(function () {
      var lastReadableActivityDate = moment().subtract(1, 'day');
      var publishedDate = moment().subtract(2, 'day');

      promise = $q.resolve({
        id: '1234',
        displayName: 'whatever',
        participants: {
          items: ['abc@test.com'],
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
      promise = $q.reject({
        "status": 404,
      });

      spyOn(EdiscoveryService, 'getAvalonServiceUrl').and.returnValue(promiseUrl);
      spyOn(EdiscoveryService, 'getAvalonRoomInfo').and.returnValue(promise);
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
      promise = $q.reject({
        "status": 400,
      });

      spyOn(EdiscoveryService, 'getAvalonServiceUrl').and.returnValue(promiseUrl);
      spyOn(EdiscoveryService, 'getAvalonRoomInfo').and.returnValue(promise);
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
      promise = $q.reject({
        "status": 500,
      });
      spyOn(Notification, 'error').and.callFake(function () {
        return true;
      });
      spyOn(EdiscoveryService, 'getAvalonServiceUrl').and.returnValue(promiseUrl);
      spyOn(EdiscoveryService, 'getAvalonRoomInfo').and.returnValue(promise);
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
      expect(Notification.error.calls.count()).toBe(1);

    });
  });

  describe('finds a room', function () {
    beforeEach(function () {
      var lastReadableActivityDate = moment().subtract(1, "day");
      var publishedDate = moment().subtract(2, "day");

      promise = $q.resolve({
        id: '1234',
        displayName: 'whatever',
        participants: {
          items: ['abc@test.com'],
        },
        lastReadableActivityDate: lastReadableActivityDate,
        published: publishedDate,
      });

      spyOn(EdiscoveryService, 'getAvalonServiceUrl').and.returnValue(promiseUrl);
      spyOn(EdiscoveryService, 'getAvalonRoomInfo').and.returnValue(promise);
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
      var deferedRunReportResult = $q.defer();

      promise = $q.resolve({
        displayName: 'test',
        url: 'whatever',
        id: '12345678',
      });

      spyOn(EdiscoveryService, 'runReport').and.returnValue(deferedRunReportResult.promise);
      spyOn(EdiscoveryService, 'createReport').and.returnValue(promise);
    });

    beforeEach(initController);

    it('with happy-clappy legal input parameters', function () {
      ediscoverySearchController.searchCriteria.roomId = 'whatever';
      ediscoverySearchController.searchCriteria.endDate = moment().format();
      ediscoverySearchController.searchCriteria.startDate = moment().subtract(1, 'day').format();
      var params = {
        displayName: jasmine.any,
        roomIds: jasmine.any,
        startDate: jasmine.any,
        endDate: jasmine.any,
        keyword: jasmine.any,
        emailAddresses: null,
      };

      ediscoverySearchController.createReport(params);
      $scope.$apply();

      expect(EdiscoveryService.runReport.calls.count()).toBe(1);
      expect(EdiscoveryService.createReport).toHaveBeenCalled();
    });

  });

  describe('Create report with error', function () {
    beforeEach(function () {
      promise = $q.reject({
        data: {
          errorCode: 420000,
          message: 'Invalid Input',
          errors: [{
            errorCode: 420000,
            description: 'displayName: may not be empty',
          }],
        },
      });

      spyOn(EdiscoveryService, 'createReport').and.returnValue(promise);
    });

    beforeEach(initController);

    it('received from atlas backend', function () {
      var errorNotification = sinon.stub(Notification, 'error');
      ediscoverySearchController.createReport();
      $scope.$apply();
      expect(errorNotification.called).toBeTruthy();
      expect(ediscoverySearchController.report).toBeNull();
    });
  });

  describe('Create report with error', function () {
    beforeEach(function () {

      ediscoverySearchController.searchCriteria.roomId = 'whatever';
      ediscoverySearchController.searchCriteria.endDate = moment().format();
      ediscoverySearchController.searchCriteria.startDate = moment().subtract(1, 'day').format();

      promise = $q.resolve({
        displayName: 'test',
        url: 'whatever',
        id: '12345678',
      });

      spyOn(EdiscoveryService, 'runReport').and.returnValue($q.reject());
      spyOn(EdiscoveryService, 'createReport').and.returnValue(promise);
      spyOn(EdiscoveryService, 'patchReport').and.returnValue($q.resolve({}));
      spyOn(EdiscoveryService, 'getReport').and.returnValue(promise);
      spyOn(Notification, 'error').and.callFake(function () {
        return true;
      });
    });

    beforeEach(initController);

    it('received from avalon backend', function () {
      var params = {
        displayName: jasmine.any,
        roomIds: jasmine.any,
        startDate: jasmine.any,
        endDate: jasmine.any,
        keyword: jasmine.any,
        emailAddresses: null,
      };

      ediscoverySearchController.createReport(params);
      $scope.$apply();

      expect(EdiscoveryService.runReport.calls.count()).toBe(1);
      expect(EdiscoveryService.createReport).toHaveBeenCalled();
      expect(Notification.error.calls.count()).toBe(1);
      expect(EdiscoveryService.patchReport.calls.count()).toBe(1);
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
              endDate: 'endDateFromStateParam',
            },
          },
          reRun: true,
        },
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
            },
          },
          reRun: false,
        },
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
