import userTaskManagerModuleName from './index';
import { UserTaskManagerService } from './user-task-manager.service';

import 'moment';
import 'moment-timezone';

type Test = atlas.test.IServiceTest<{
  $interval: ng.IIntervalService;
  $rootScope: ng.IRootScopeService;
  Authinfo;
  UrlConfig;
  UserTaskManagerService: UserTaskManagerService;
}>;

describe('Service: UserTaskManagerService', () => {

  beforeEach(function (this: Test) {
    this.initModules(userTaskManagerModuleName);
    this.injectDependencies(
      '$interval',
      '$rootScope',
      'Authinfo',
      'UrlConfig',
      'UserTaskManagerService',
    );

    this.taskList = _.cloneDeep(require('./test-tasks.json').taskManagerTasks);

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('123');
    this.URL = `${this.UrlConfig.getAdminBatchServiceUrl()}/customers/${this.Authinfo.getOrgId()}/jobs/general/useronboard`;
    this.UPLOAD_URL = `${this.UrlConfig.getAdminServiceUrl()}csv/organizations/${this.Authinfo.getOrgId()}/uploadurl`;

    installPromiseMatchers();

    moment.tz.setDefault('America/Los_Angeles');
  });

  afterEach(function (this: Test) {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('Task Management', () => {
    it('should get all tasks', function (this: Test) {
      this.$httpBackend.expectGET(this.URL).respond({
        items: this.taskList,
      });
      expect(this.UserTaskManagerService.getTasks()).toBeResolvedWith(this.taskList);
    });

    it('should get in process tasks', function (this: Test) {
      this.$httpBackend.expectGET(`${this.URL}?status=CREATED,STARTING,STARTED,STOPPING`).respond({
        items: this.taskList,
      });
      expect(this.UserTaskManagerService.getInProcessTasks()).toBeResolvedWith(this.taskList);
    });

    it('should get a specific task', function (this: Test) {
      this.$httpBackend.expectGET(`${this.URL}/456`).respond(this.taskList[0]);
      expect(this.UserTaskManagerService.getTask('456')).toBeResolvedWith(this.taskList[0]);
    });

    it('should submit a csv import task', function (this: Test) {
      const myFilename = 'myFilename';
      const fileData = 'fileData';
      const exactMatch = true;

      const tempUploadUrl = 'tempUploadUrl';
      const uniqueFileName = 'uniqueFileName';
      this.$httpBackend.expectGET(`${this.UPLOAD_URL}?filename=${myFilename}`).respond({
        tempUrl: tempUploadUrl,
        uniqueFileName: uniqueFileName,
      });
      this.$httpBackend.expectPUT(tempUploadUrl, fileData).respond(200);
      this.$httpBackend.expectPOST(this.URL, {
        exactMatchCsv: exactMatch,
        csvFile: uniqueFileName,
        useLocalFile: false,
      }).respond(this.taskList[0]);

      const promise = this.UserTaskManagerService.submitCsvImportTask(myFilename, fileData, exactMatch);
      expect(promise).toBeResolvedWith(this.taskList[0]);
    });

    it('should get task errors', function (this: Test) {
      const errors = [{
        error: {
          key: 'error-key',
          message: 'error-message',
        },
        trackingId: 'error-trackingId',
        itemNumber: 1,
        errorMessage: 'error-message',
      }];
      this.$httpBackend.expectGET(`${this.URL}/456/errors`).respond({
        items: errors,
      });
      expect(this.UserTaskManagerService.getTaskErrors('456')).toBeResolvedWith(errors);
    });

    it('should cancel task', function (this: Test) {
      this.$httpBackend.expectPOST(`${this.URL}/456/actions/abandon/invoke`).respond(200);
      expect(this.UserTaskManagerService.cancelTask('456')).toBeResolved();
    });

    it('should pause task', function (this: Test) {
      this.$httpBackend.expectPOST(`${this.URL}/456/actions/pause/invoke`).respond(200);
      expect(this.UserTaskManagerService.pauseTask('456')).toBeResolved();
    });

    it('should resume task', function (this: Test) {
      this.$httpBackend.expectPOST(`${this.URL}/456/actions/resume/invoke`).respond(200);
      expect(this.UserTaskManagerService.resumeTask('456')).toBeResolved();
    });

    it('should get user display and email', function (this: Test) {
      this.$httpBackend.expectGET(`${this.UrlConfig.getScimUrl(this.Authinfo.getOrgId())}/456`).respond({
        displayName: 'John Smith',
        userName: 'jsmith',
      });

      const promise = this.UserTaskManagerService.getUserDisplayAndEmail('456');
      expect(promise).toBeResolvedWith('John Smith (jsmith)');
    });
  });

  describe('Task Status', () => {
    it('should show pending task', function (this: Test) {
      expect(this.UserTaskManagerService.isTaskPending('CREATED')).toBe(true);
      expect(this.UserTaskManagerService.isTaskPending('STARTED')).toBe(true);
      expect(this.UserTaskManagerService.isTaskPending('STARTING')).toBe(true);
      expect(this.UserTaskManagerService.isTaskPending('STOPPING')).toBe(true);
    });

    it('should show processing task', function (this: Test) {
      expect(this.UserTaskManagerService.isTaskInProcess('STARTED')).toBe(true);
      expect(this.UserTaskManagerService.isTaskInProcess('STARTING')).toBe(true);
      expect(this.UserTaskManagerService.isTaskInProcess('STOPPING')).toBe(true);
    });

    it('should show error task', function (this: Test) {
      expect(this.UserTaskManagerService.isTaskError('COMPLETED_WITH_ERRORS')).toBe(true);
      expect(this.UserTaskManagerService.isTaskError('FAILED')).toBe(true);
    });

    it('should show canceled task', function (this: Test) {
      expect(this.UserTaskManagerService.isTaskCanceled('ABANDONED')).toBe(true);
    });
  });

  describe('Date and Time', () => {
    beforeEach(function (this: Test) {
      jasmine.clock().install();
      jasmine.clock().mockDate();
    });

    afterEach(function (this: Test) {
      jasmine.clock().uninstall();
    });

    it('should format correctly', function (this: Test) {
      const isoDate = '2017-10-06T20:54:22.535Z';
      const { date, time } = this.UserTaskManagerService.getDateAndTime(isoDate);
      expect(date).toBe('Oct 6, 2017');
      expect(time).toBe('1:54 PM');
    });
  });

  describe('Intervals', () => {
    beforeEach(function (this: Test) {
      jasmine.clock().install();
      jasmine.clock().mockDate();

      this.expectRequestAfterIntervalPeriod = (delay) => {
        this.$interval.flush(delay - 1);
        expect(() => this.$httpBackend.flush(1)).toThrow(); // nothing yet to flush
        this.$interval.flush(1);
        expect(() => this.$httpBackend.flush(1)).not.toThrow(); // flush number of expected requests
        expect(() => this.$httpBackend.flush(1)).toThrow(); // nothing afterwards to flush
      };
    });

    afterEach(function (this: Test) {
      jasmine.clock().uninstall();
    });

    it('should get task list on interval', function (this: Test) {
      this.$httpBackend.whenGET(this.URL).respond({
        items: this.taskList,
      });
      const INTERVAL_DELAY = 30000;
      const callbackSpy = jasmine.createSpy('callbackSpy');
      const scope = this.$rootScope.$new();
      this.UserTaskManagerService.initAllTaskListPolling(callbackSpy, scope);

      this.$httpBackend.flush(1); // initial request before interval starts
      expect(callbackSpy).toHaveBeenCalledTimes(1);
      this.expectRequestAfterIntervalPeriod(INTERVAL_DELAY);
      expect(callbackSpy).toHaveBeenCalledTimes(2);
      this.expectRequestAfterIntervalPeriod(INTERVAL_DELAY);
      expect(callbackSpy).toHaveBeenCalledTimes(3);

      scope.$destroy();
      this.$interval.flush(INTERVAL_DELAY);
      expect(() => this.$httpBackend.flush(1)).toThrow(); // nothing to flush because interval was destroyed
    });

    it('should manually cleanup interval', function (this: Test) {
      this.$httpBackend.whenGET(this.URL).respond({
        items: this.taskList,
      });
      const INTERVAL_DELAY = 30000;
      const callbackSpy = jasmine.createSpy('callbackSpy');
      const scope = this.$rootScope.$new();
      this.UserTaskManagerService.initAllTaskListPolling(callbackSpy, scope);

      this.$httpBackend.flush(1); // initial request before interval starts
      expect(callbackSpy).toHaveBeenCalledTimes(1);
      this.expectRequestAfterIntervalPeriod(INTERVAL_DELAY);
      expect(callbackSpy).toHaveBeenCalledTimes(2);
      this.expectRequestAfterIntervalPeriod(INTERVAL_DELAY);
      expect(callbackSpy).toHaveBeenCalledTimes(3);

      this.UserTaskManagerService.cleanupAllTaskListPolling(callbackSpy);
      this.$interval.flush(INTERVAL_DELAY);
      expect(() => this.$httpBackend.flush(1)).toThrow(); // nothing to flush because interval was destroyed
    });

    it('should handle multiple callbacks of the same interval', function (this: Test) {
      this.$httpBackend.whenGET(this.URL).respond({
        items: this.taskList,
      });
      const INTERVAL_DELAY = 30000;
      const callbackSpy1 = jasmine.createSpy('callbackSpy');
      const scope1 = this.$rootScope.$new();
      this.UserTaskManagerService.initAllTaskListPolling(callbackSpy1, scope1);

      this.$httpBackend.flush(1); // initial request before interval starts
      expect(callbackSpy1).toHaveBeenCalledTimes(1);
      this.expectRequestAfterIntervalPeriod(INTERVAL_DELAY);
      expect(callbackSpy1).toHaveBeenCalledTimes(2);
      this.expectRequestAfterIntervalPeriod(INTERVAL_DELAY);
      expect(callbackSpy1).toHaveBeenCalledTimes(3);

      const callbackSpy2 = jasmine.createSpy('callbackSpy');
      const scope2 = this.$rootScope.$new();
      this.UserTaskManagerService.initAllTaskListPolling(callbackSpy2, scope2);

      this.expectRequestAfterIntervalPeriod(INTERVAL_DELAY);
      expect(callbackSpy1).toHaveBeenCalledTimes(4);
      expect(callbackSpy2).toHaveBeenCalledTimes(1);

      this.expectRequestAfterIntervalPeriod(INTERVAL_DELAY);
      expect(callbackSpy1).toHaveBeenCalledTimes(5);
      expect(callbackSpy2).toHaveBeenCalledTimes(2);

      scope1.$destroy();

      this.expectRequestAfterIntervalPeriod(INTERVAL_DELAY);
      expect(callbackSpy1).toHaveBeenCalledTimes(5); // is not called because callback was removed
      expect(callbackSpy2).toHaveBeenCalledTimes(3);

      this.expectRequestAfterIntervalPeriod(INTERVAL_DELAY);
      expect(callbackSpy1).toHaveBeenCalledTimes(5); // is not called because callback was removed
      expect(callbackSpy2).toHaveBeenCalledTimes(4);

      scope2.$destroy();

      this.$interval.flush(INTERVAL_DELAY);
      expect(() => this.$httpBackend.flush(1)).toThrow(); // nothing to flush because interval was destroyed
    });

    it('should handle interval delay change on existing interval', function (this: Test) {
      this.$httpBackend.whenGET(this.URL).respond({
        items: this.taskList,
      });
      const INTERVAL_DELAY = 30000;
      const NEW_DELAY = 5000;
      const callbackSpy = jasmine.createSpy('callbackSpy');
      const scope = this.$rootScope.$new();
      this.UserTaskManagerService.initAllTaskListPolling(callbackSpy, scope);

      this.$httpBackend.flush(1); // initial request before interval starts
      expect(callbackSpy).toHaveBeenCalledTimes(1);
      this.expectRequestAfterIntervalPeriod(INTERVAL_DELAY);
      expect(callbackSpy).toHaveBeenCalledTimes(2);
      this.expectRequestAfterIntervalPeriod(INTERVAL_DELAY);
      expect(callbackSpy).toHaveBeenCalledTimes(3);

      this.UserTaskManagerService.changeAllTaskListPolling(NEW_DELAY);

      this.expectRequestAfterIntervalPeriod(NEW_DELAY);
      expect(callbackSpy).toHaveBeenCalledTimes(4);
      this.expectRequestAfterIntervalPeriod(NEW_DELAY);
      expect(callbackSpy).toHaveBeenCalledTimes(5);

      this.UserTaskManagerService.changeAllTaskListPolling(INTERVAL_DELAY);

      this.expectRequestAfterIntervalPeriod(INTERVAL_DELAY);
      expect(callbackSpy).toHaveBeenCalledTimes(6);

      scope.$destroy();
      this.$interval.flush(INTERVAL_DELAY);
      expect(() => this.$httpBackend.flush(1)).toThrow(); // nothing to flush because interval was destroyed
    });
  });
});
