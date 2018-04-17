'use strict';

var ediscoveryModule = require('./ediscovery.module');
describe('Controller: EdiscoverySearchController', function () {
  beforeEach(angular.mock.module(ediscoveryModule));
  var promise, result, startDate, endDate;
  var testEncryptionKeyUrl = 'kms://cisco.com/keys/14eed485-c7e0-4e4b-970b-802c63da4058';

  function initDependencySpies() {
    spyOn(this.Analytics, 'trackEvent').and.returnValue(this.$q.resolve());
    spyOn(this.Analytics, 'trackEdiscoverySteps').and.returnValue(this.$q.resolve());
    spyOn(this.Authinfo, 'isEnterpriseCustomer').and.returnValue(false);
    spyOn(this.ProPackService, 'hasProPackPurchased').and.returnValue(this.$q.resolve(false));
    spyOn(this.ProPackService, 'hasProPackEnabled').and.returnValue(this.$q.resolve(false));
    spyOn(this.FeatureToggleService, 'atlasF3346EdiscoverySearchLimitGetStatus').and.returnValue(this.$q.resolve(false));
  }

  function init() {
    this.initModules(ediscoveryModule);
    this.injectDependencies('$controller', '$q', '$scope', '$translate', 'Analytics', 'Authinfo', 'EdiscoveryNotificationService', 'EdiscoveryService', 'FeatureToggleService', 'Notification', 'ProPackService'
    );
    initDependencySpies.apply(this);
  }

  function initController() {
    this.ediscoverySearchController = this.$controller('EdiscoverySearchController', {
      $scope: this.$scope,
      $translate: this.$translate,
      Analytics: this.Analytics,
      Authinfo: this.Authinfo,
      EdiscoveryService: this.EdiscoveryService,
      EdiscoveryNotificationService: this.EdiscoveryNotificationService,
      FeatureToggleService: this.FeatureToggleService,
      Notification: this.Notification,
      ProPackService: this.ProPackService,
    });

    this.$scope.$apply();
  }

  beforeEach(init);

  describe('Search for space or email address', function () {
    it('should contain default values', function () {
      promise = this.$q.resolve({
        numFiles: 10,
        numMessages: 10,
        numRooms: 10,
        totalSizeInBytes: 100,
      });
      spyOn(this.EdiscoveryService, 'getArgonautServiceUrl').and.returnValue(promise);
      initController.apply(this);
      expect(this.ediscoverySearchController.searchingForRoom).toBeFalsy();
      expect(this.ediscoverySearchController.encryptedEmails).toBeNull();
      expect(this.ediscoverySearchController.unencryptedRoomIds).toBeNull();
      expect(this.ediscoverySearchController.searchingForRoom).toBeFalsy();
    });
  });

  describe('limit for email and space search validation ', function () {
    beforeEach(function () {
      initController.apply(this);
      spyOn(this.ediscoverySearchController, 'advancedSearch');
    });

    it('should allow limit of 5 if FT is false', function () {
      this.ediscoverySearchController.limitErrorMessage = '';
      this.ediscoverySearchController.searchModel = 'one, two, three, four, five';
      this.ediscoverySearchController.searchByLimit();
      expect(this.ediscoverySearchController.limitErrorMessage).toBe('');
      expect(this.ediscoverySearchController.advancedSearch).toHaveBeenCalled();
    });

    it('should not allow greater than 5 if FT is false', function () {
      this.ediscoverySearchController.limitErrorMessage = '';
      this.ediscoverySearchController.searchModel = 'one, two, three, four, five, six';
      this.ediscoverySearchController.searchByLimit();
      expect(this.ediscoverySearchController.limitErrorMessage).toBe('ediscovery.searchErrors.invalidEmailLimit');
      expect(this.ediscoverySearchController.advancedSearch).not.toHaveBeenCalled();
    });

    it('should limit the max number to whatever the FT is set', function () {
      this.FeatureToggleService.atlasF3346EdiscoverySearchLimitGetStatus.and.returnValue(this.$q.resolve('6'));
      initController.apply(this);
      spyOn(this.ediscoverySearchController, 'advancedSearch');
      this.ediscoverySearchController.limitErrorMessage = '';
      this.ediscoverySearchController.searchModel = 'one, two, three, four, five, six';
      this.ediscoverySearchController.searchByLimit();
      expect(this.ediscoverySearchController.limitErrorMessage).toBe('');
      expect(this.ediscoverySearchController.advancedSearch).toHaveBeenCalled();
    });
  });

  describe('Date Validation', function () {
    beforeEach(function () {
      initController.apply(this);
    });

    it('should not return an error', function () {
      startDate = moment().subtract(30, 'days').format();
      endDate = moment().format();
      result = this.ediscoverySearchController.dateErrors(startDate, endDate);
      expect(result).toEqual([]);
    });

    it('should not have end date be before start date', function () {
      startDate = moment().format();
      endDate = moment().subtract(2, 'days').format();
      result = this.ediscoverySearchController.dateErrors(startDate, endDate);
      expect(result).toEqual(['ediscovery.dateError.StartDateMustBeforeEndDate']);
      expect(this.ediscoverySearchController.validateDate()).toBe(true);
    });

    it('should not have a start date that is in the future', function () {
      startDate = moment().add(1, 'day').format();
      endDate = moment().format();
      result = this.ediscoverySearchController.dateErrors(startDate, endDate);
      expect(result).toEqual(['ediscovery.dateError.StartDateMustBeforeEndDate', 'ediscovery.dateError.StartDateCannotBeInTheFuture']);
    });

    it('should not exceed a 90 day range if ProPack is not purchased', function () {
      startDate = moment().subtract(91, 'days').format();
      endDate = moment().format();
      result = this.ediscoverySearchController.dateErrors(startDate, endDate);
      expect(result).toEqual(['ediscovery.dateError.InvalidDateRange']);
    });
  });

  describe('Create report', function () {
    beforeEach(function () {
      var deferredRunReportResult = this.$q.defer();

      promise = this.$q.resolve({
        displayName: 'test',
        url: 'whatever',
        id: '12345678',
      });

      spyOn(this.EdiscoveryService, 'createReport').and.returnValue(promise);
      spyOn(this.EdiscoveryService, 'generateReport').and.returnValue(deferredRunReportResult.promise);
    });

    beforeEach(function () {
      initController.apply(this);
    });

    it('with happy-clappy legal input parameters', function () {
      this.ediscoverySearchController.searchCriteria.roomId = 'whatever';
      this.ediscoverySearchController.searchCriteria.endDate = moment().format();
      this.ediscoverySearchController.searchCriteria.startDate = moment().subtract(1, 'day').format();
      var params = {
        displayName: jasmine.any,
        roomIds: jasmine.any,
        startDate: jasmine.any,
        endDate: jasmine.any,
        keyword: jasmine.any,
        emailAddresses: null,
      };

      this.ediscoverySearchController.createReport(params);
      this.$scope.$apply();
      expect(this.EdiscoveryService.createReport).toHaveBeenCalled();
      expect(this.EdiscoveryService.generateReport.calls.count()).toBe(1);
    });
  });

  describe('Create report with error', function () {
    it('received from atlas backend', function () {
      initController.apply(this);
      var errorNotification = spyOn(this.Notification, 'errorWithTrackingId');
      promise = this.$q.reject({
        config: {
          headers: {
            TrackingID: 12345678,
          },
        },
        data: {
          errorCode: 420000,
          message: 'Invalid Input',
          errors: [{
            errorCode: 420000,
            description: 'displayName: may not be empty',
          }],
        },
      });

      spyOn(this.EdiscoveryService, 'createReport').and.callFake(function () {
        return promise;
      });
      this.ediscoverySearchController.createReport();
      this.$scope.$apply();
      expect(errorNotification).toHaveBeenCalled();
      expect(this.ediscoverySearchController.report).toBeNull();
    });
  });

  describe('Create report with error', function () {
    beforeEach(function () {
      promise = this.$q.resolve({
        displayName: 'test',
        url: 'whatever',
        id: '12345678',
      });

      spyOn(this.EdiscoveryService, 'createReport').and.returnValue(promise);
      spyOn(this.EdiscoveryService, 'patchReport').and.returnValue(this.$q.resolve({}));
      spyOn(this.EdiscoveryService, 'getReport').and.returnValue(promise);
      spyOn(this.Notification, 'errorWithTrackingId').and.callFake(function () {
        return true;
      });
    });

    it('received from avalon backend', function () {
      initController.apply(this);
      spyOn(this.EdiscoveryService, 'generateReport').and.returnValue(this.$q.reject());
      this.ediscoverySearchController.searchCriteria.roomId = 'whatever';
      this.ediscoverySearchController.searchCriteria.endDate = moment().format();
      this.ediscoverySearchController.searchCriteria.startDate = moment().subtract(1, 'day').format();
      this.ediscoverySearchController.createReport();
      this.$scope.$apply();

      expect(this.EdiscoveryService.generateReport.calls.count()).toBe(1);
      expect(this.EdiscoveryService.createReport).toHaveBeenCalled();
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
      expect(this.EdiscoveryService.patchReport.calls.count()).toBe(1);
    });
  });

  describe('Generate report and retrieve the key', function () {
    var generatedResult;
    beforeEach(function () {
      initController.apply(this);
      generatedResult = {
        displayName: 'test1',
        url: 'whatever',
        id: '12345678',
        state: 'COMPLETED',
        encryptionKeyUrl: testEncryptionKeyUrl,
      };

      spyOn(this.EdiscoveryService, 'createReport').and.returnValue(promise);
      spyOn(this.EdiscoveryService, 'generateReport').and.returnValue(this.$q.resolve(generatedResult));
      spyOn(this.EdiscoveryService, 'getReport');
      spyOn(this.EdiscoveryService, 'getReportKey').and.returnValue(this.$q.resolve('key123'));
      spyOn(this.EdiscoveryNotificationService, 'notify');
    });

    it('should get the key when report is complete and has encryptionKeyUrl', function () {
      this.EdiscoveryService.getReport.and.returnValue(this.$q.resolve(generatedResult));
      this.ediscoverySearchController.generateReport({});
      this.$scope.$apply();
      expect(this.EdiscoveryService.getReportKey).toHaveBeenCalledWith(testEncryptionKeyUrl, undefined);
      expect(this.ediscoverySearchController.report.reportKey).toBe('key123');
    });

    it('should not attempt to get the key if encryptionKeyUrl is not set in the report', function () {
      var noUrlResult = _.clone(generatedResult);
      delete (noUrlResult.encryptionKeyUrl);
      this.EdiscoveryService.getReport.and.returnValue(this.$q.resolve(noUrlResult));
      this.ediscoverySearchController.generateReport({});
      this.$scope.$apply();
      expect(this.EdiscoveryService.getReportKey).not.toHaveBeenCalled();
      expect(this.ediscoverySearchController.report.reportKey).toBeUndefined();
      expect(this.EdiscoveryNotificationService.notify).toHaveBeenCalled();
      expect(this.ediscoverySearchController.isReportComplete).toBe(true);
    });

    it('should not attempt to get the key if report is FAILED or ABORTED', function () {
      generatedResult.state = 'ABORTED';
      this.EdiscoveryService.getReport.and.returnValue(this.$q.resolve(generatedResult));
      this.ediscoverySearchController.generateReport({});
      this.$scope.$apply();
      expect(this.EdiscoveryService.getReportKey).not.toHaveBeenCalled();
      expect(this.ediscoverySearchController.report.reportKey).toBeUndefined();

      generatedResult.state = 'FAILED';
      this.EdiscoveryService.getReport.and.returnValue(this.$q.resolve(generatedResult));
      this.ediscoverySearchController.generateReport({});
      this.$scope.$apply();
      expect(this.EdiscoveryService.getReportKey).not.toHaveBeenCalled();
      expect(this.ediscoverySearchController.report.reportKey).toBeUndefined();
    });
  });

  describe('entering controller with stateParams', function () {
    it('inits a rerun using stateParams content', function () {
      this.ediscoverySearchController = this.$controller('EdiscoverySearchController', {
        $translate: this.$translate,
        $scope: this.$scope,
        EdiscoveryService: this.EdiscoveryService,
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

      expect(this.ediscoverySearchController.searchCriteria.roomId).toEqual('roomIdFromStateParam');
      expect(this.ediscoverySearchController.searchCriteria.displayName).toEqual('whatever');
      expect(this.ediscoverySearchController.searchCriteria.startDate).toEqual('startDateFromStateParam');
      expect(this.ediscoverySearchController.searchCriteria.endDate).toEqual('endDateFromStateParam');
      expect(this.ediscoverySearchController.report).toBe(null);
      expect(this.ediscoverySearchController.currentReportId).toBe(null);
    });

    it('shows a report and starts polling when stateParams rerun is false', function () {
      this.ediscoverySearchController = this.$controller('EdiscoverySearchController', {
        $translate: this.$translate,
        $scope: this.$scope,
        EdiscoveryService: this.EdiscoveryService,
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
      expect(this.ediscoverySearchController.searchCriteria.roomId).toEqual('roomIdFromStateParam');
      expect(this.ediscoverySearchController.searchCriteria.displayName).toEqual('whatever');
      expect(this.ediscoverySearchController.searchCriteria.startDate).toEqual('startDateFromStateParam');
      expect(this.ediscoverySearchController.searchCriteria.endDate).toEqual('endDateFromStateParam');
      expect(this.ediscoverySearchController.report.id).toEqual('4567');
      expect(this.ediscoverySearchController.report.displayName).toEqual('whatever');
      expect(this.ediscoverySearchController.currentReportId).toBe('4567');
    });
  });

  describe('helper function:', function () {
    beforeEach(function () {
      initController.apply(this);
    });

    it('splitWords should return an array with no empty strings and no white spaces', function () {
      var words = 'hello,   foo,   abc   ,';
      var splitWordsResponse = ['hello', 'foo', 'abc'];

      var splitWords = this.ediscoverySearchController.splitWords(words);
      expect(splitWords).toEqual(splitWordsResponse);
    });
  });
});
