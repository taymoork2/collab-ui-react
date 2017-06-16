'use strict';

describe('Controller: EdiscoverySearchController', function () {
  beforeEach(angular.mock.module('Ediscovery'));
  beforeEach(angular.mock.module('Huron'));

  var $controller, $q, $scope, $translate, Analytics, ediscoverySearchController, EdiscoveryService, EdiscoveryNotificationService, FeatureToggleService, ProPackService, Notification, TrialService;
  var promise, result, startDate, endDate;

  beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _$translate_, _Analytics_, _EdiscoveryService_, _EdiscoveryNotificationService_, _FeatureToggleService_, _ProPackService_, _Notification_, _TrialService_) {
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
    ProPackService = _ProPackService_;

    spyOn(Analytics, 'trackEvent').and.returnValue($q.resolve());
    spyOn(Analytics, 'trackEdiscoverySteps').and.returnValue($q.resolve());
    spyOn(FeatureToggleService, 'atlasEdiscoveryGetStatus').and.returnValue($q.resolve(false));
    spyOn(FeatureToggleService, 'atlasEdiscoveryIPSettingGetStatus').and.returnValue($q.resolve(false));
    spyOn(ProPackService, 'hasProPackPurchased').and.returnValue($q.resolve(false));
    spyOn(ProPackService, 'hasProPackEnabled').and.returnValue($q.resolve(false));
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
      ProPackService: ProPackService,
    });

    $scope.$apply();
  }

  describe('Search for space or email address', function () {
    beforeEach(function () {
      promise = $q.resolve({
        numFiles: 10,
        numMessages: 10,
        numRooms: 10,
        totalSizeInBytes: 100,
      });

      spyOn(EdiscoveryService, 'getArgonautServiceUrl').and.returnValue(promise);
    });

    beforeEach(initController);

    beforeEach(function () {
      expect(ediscoverySearchController.searchingForRoom).toBeFalsy();
    });

    afterEach(function () {
      expect(ediscoverySearchController.searchingForRoom).toBeFalsy();
    });

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
      expect(ediscoverySearchController.validateDate()).toBe(true);
    });

    it('should not have a start date that is in the future', function () {
      startDate = moment().add(1, 'day').format();
      endDate = moment().format();

      result = ediscoverySearchController.dateErrors(startDate, endDate);

      expect(result).toEqual(['ediscovery.dateError.StartDateMustBeforeEndDate', 'ediscovery.dateError.StartDateCannotBeInTheFuture']);
    });

    it('should not exceed a 90 day range if ProPack is not purchased', function () {
      startDate = moment().subtract(91, 'days').format();
      endDate = moment().format();

      result = ediscoverySearchController.dateErrors(startDate, endDate);

      expect(result).toEqual(['ediscovery.dateError.InvalidDateRange']);
    });
  });

  describe('Create report', function () {
    beforeEach(function () {
      FeatureToggleService.atlasEdiscoveryGetStatus.and.returnValue($q.resolve(true));
      var deferredRunReportResult = $q.defer();

      promise = $q.resolve({
        displayName: 'test',
        url: 'whatever',
        id: '12345678',
      });

      spyOn(EdiscoveryService, 'createReport').and.returnValue(promise);
      spyOn(EdiscoveryService, 'generateReport').and.returnValue(deferredRunReportResult.promise);
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
      expect(EdiscoveryService.createReport).toHaveBeenCalled();
      expect(EdiscoveryService.generateReport.calls.count()).toBe(1);
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
      var errorNotification = spyOn(Notification, 'error');
      ediscoverySearchController.createReport();
      $scope.$apply();
      expect(errorNotification).toHaveBeenCalled();
      expect(ediscoverySearchController.report).toBeNull();
    });
  });

  describe('Create report with error', function () {
    beforeEach(function () {
      FeatureToggleService.atlasEdiscoveryGetStatus.and.returnValue($q.resolve(true));
      ediscoverySearchController.searchCriteria.roomId = 'whatever';
      ediscoverySearchController.searchCriteria.endDate = moment().format();
      ediscoverySearchController.searchCriteria.startDate = moment().subtract(1, 'day').format();

      promise = $q.resolve({
        displayName: 'test',
        url: 'whatever',
        id: '12345678',
      });

      spyOn(EdiscoveryService, 'createReport').and.returnValue(promise);
      spyOn(EdiscoveryService, 'generateReport').and.returnValue($q.reject());
      spyOn(EdiscoveryService, 'patchReport').and.returnValue($q.resolve({}));
      spyOn(EdiscoveryService, 'getReport').and.returnValue(promise);
      spyOn(Notification, 'error').and.callFake(function () {
        return true;
      });
    });

    beforeEach(initController);

    it('received from avalon backend', function () {
      ediscoverySearchController.createReport();
      $scope.$apply();

      expect(EdiscoveryService.generateReport.calls.count()).toBe(1);
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
