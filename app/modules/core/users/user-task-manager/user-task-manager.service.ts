import { ITask } from './user-task-manager.component';
import { TaskStatus } from './user-task-manager.constants';
import { IErrorItem, IErrorRow } from './csv-upload-results.component';

export interface IDateAndTime {
  date: string;
  time: string;
}

export interface IPaging {
  count: number;
  limit: number;
  offset: number;
  pages: number;
  prev: any[];
  next: any[];
}

export interface IGetTasksResponse {
  items: ITask[];
  paging: IPaging;
}

export interface IGetFileUrlResponse {
  tempUrl: string;
  uniqueFileName: string;
}

export interface IGetFileChecksumResponse {
  tempUrl: string;
  uniqueFileName: string;
  md5: string;
}

export interface IGetTaskErrorsResponse {
  items: IErrorItem[];
  paging: IPaging;
}

export interface IGetUserResponse {
  displayName: string;
  userName: string;
}

interface IntervalTypeOf<T> {
  detail: T;
  list: T;
  running: T;
}

type IntervalType = keyof IntervalTypeOf<any>;

enum IntervalDelay {
  SHORT = 5000,   // 5 sec
  MEDIUM = 30000, // 30 sec
  LONG = 120000,  // 2 min
}

export class UserTaskManagerService {
  public IntervalDelay = IntervalDelay;
  public readonly ERROR_LIMIT = 200;
  public activeTask?: ITask;
  private cancelDownloadErrorsDeferred?: ng.IDeferred<void>;
  public errorArray: IErrorRow[] = [];

  private interval: IntervalTypeOf<ng.IPromise<ITask> | undefined> = {
    detail: undefined,
    list: undefined,
    running: undefined,
  };

  private intervalCallbacks: IntervalTypeOf<Function[]> = {
    detail: [],
    list: [],
    running: [],
  };

  private intervalInProgress: IntervalTypeOf<boolean> = {
    detail: false,
    list: false,
    running: false,
  };

  private intervalDelay: IntervalTypeOf<number> = {
    detail: IntervalDelay.SHORT,
    list: IntervalDelay.MEDIUM,
    running: IntervalDelay.LONG,
  };

  private intervalFunction: IntervalTypeOf<(() => ng.IPromise<any>) | undefined> = {
    detail: undefined,
    list: undefined,
    running: undefined,
  };

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $interval: ng.IIntervalService,
    private $translate: ng.translate.ITranslateService,
    private $q: ng.IQService,
    private Authinfo,
    private UrlConfig,
    private UserCsvService,
  ) {}

  public getTasks(): ng.IPromise<ITask[]> {
    return this.$http<IGetTasksResponse>({
      method: 'GET',
      url: this.USER_ONBOARD_URL,
    }).then(response => response.data.items);
  }

  public getInProcessTasks(): ng.IPromise<ITask[]> {
    return this.$http<IGetTasksResponse>({
      method: 'GET',
      url: this.USER_ONBOARD_URL,
    }).then(response => {
      return _.filter(_.get(response, 'data.items', []), (task: ITask) => {
        return this.isTaskPending(task.latestExecutionStatus);
      });
    });
  }

  public getTask(id: string): ng.IPromise<ITask> {
    return this.$http<ITask>({
      method: 'GET',
      url: this.getJobSpecificUrl(id),
    }).then(response => response.data);
  }

  public submitCsvImportTask(fileName: string, fileData: string, fileChecksum: string, exactMatchCsv: boolean): ng.IPromise<ITask> {
    // submit a CSV file import task procedure:
    // 1. get Swift file location
    // 2. upload CSV file to Swift
    // 3. compare checksum
    // 4. create and start the Kafka job
    return this.getFileUrl(fileName)
      .then(fileUploadObject => {
        return this.uploadToFileStorage(fileUploadObject, fileData)
          .then(() => this.checkFileChecksum(fileUploadObject, fileChecksum))
          .then(() => this.submitCsvImportJob(fileUploadObject, exactMatchCsv));
      });
  }

  public getUserDisplayAndEmail(userId: string): ng.IPromise<string> {
    const scimUrl = `${this.UrlConfig.getScimUrl(this.Authinfo.getOrgId())}/${userId}`;
    return this.$http.get<IGetUserResponse>(scimUrl)
      .then(response => `${response.data.displayName} (${response.data.userName})`);
  }

  public getDateAndTime(isoDate: string | number): IDateAndTime {
    const date = moment(isoDate);
    const isDateValid = date.isValid();
    return {
      date: isDateValid ? date.format('ll') : '',
      time: isDateValid ? date.format('LT') : '',
    };
  }

  public getTaskStatusTranslate(task: ITask): string {
    let statusTranslate = '';
    switch (task.latestExecutionStatus) {
      case TaskStatus.CREATED:
        statusTranslate = this.$translate.instant('userTaskManagerModal.taskStatus.created');
        break;
      case TaskStatus.STARTED:
      case TaskStatus.STARTING:
      case TaskStatus.STOPPING:
        statusTranslate = this.$translate.instant('userTaskManagerModal.taskStatus.processing');
        break;
      case TaskStatus.ABANDONED:
        statusTranslate = this.$translate.instant('userTaskManagerModal.taskStatus.canceled');
        break;
      case TaskStatus.COMPLETED:
        if (task.counts.usersFailed > 0) {
          statusTranslate = this.$translate.instant('userTaskManagerModal.taskStatus.completedWithErrors');
        } else {
          statusTranslate = this.$translate.instant('userTaskManagerModal.taskStatus.completed');
        }
        break;
      case TaskStatus.FAILED:
        statusTranslate = this.$translate.instant('userTaskManagerModal.taskStatus.failed');
        break;
      case TaskStatus.STOPPED:
        statusTranslate = this.$translate.instant('userTaskManagerModal.taskStatus.stopped');
        break;
      case TaskStatus.UNKNOWN:
        statusTranslate = this.$translate.instant('userTaskManagerModal.taskStatus.unknown');
        break;
    }
    return statusTranslate;
  }

  public isTaskPending(status: string): boolean {
    return status === TaskStatus.CREATED ||
           status === TaskStatus.STARTED ||
           status === TaskStatus.STARTING ||
           status === TaskStatus.STOPPING;
  }

  public isTaskInProcess(status: string): boolean {
    return status === TaskStatus.STARTED ||
           status === TaskStatus.STARTING ||
           status === TaskStatus.STOPPING;
  }

  public isTaskError(task: ITask): boolean {
    const status = task.latestExecutionStatus;
    return (status === TaskStatus.COMPLETED && task.counts.usersFailed > 0) ||
           status === TaskStatus.FAILED;
  }

  public isTaskCanceled(status: string): boolean {
    return status === TaskStatus.ABANDONED;
  }

  public cancelTask(id: string): ng.IPromise<ng.IHttpResponse<{}>> {
    const postReq: ng.IRequestConfig = {
      method: 'POST',
      url: this.getJobSpecificUrl(id, '/actions/abandon/invoke'),
    };
    return this.$http(postReq);
  }

  public pauseTask(id: string): ng.IPromise<ng.IHttpResponse<{}>> {
    const postReq: ng.IRequestConfig = {
      method: 'POST',
      url: this.getJobSpecificUrl(id, '/actions/pause/invoke'),
    };
    return this.$http(postReq);
  }

  public resumeTask(id: string): ng.IPromise<ng.IHttpResponse<{}>> {
    const postReq: ng.IRequestConfig = {
      method: 'POST',
      url: this.getJobSpecificUrl(id, '/actions/resume/invoke'),
    };
    return this.$http(postReq);
  }

  private getFileUrl(fileName: string): ng.IPromise<IGetFileUrlResponse> {
    return this.$http<IGetFileUrlResponse>({
      method: 'GET',
      url: `${this.UrlConfig.getAdminServiceUrl()}csv/organizations/${this.Authinfo.getOrgId()}/uploadurl`,
      params: {
        filename: fileName,
      },
    }).then(response => response.data);
  }

  private uploadToFileStorage(fileUploadObject: IGetFileUrlResponse, fileData: string): ng.IPromise<ng.IHttpResponse<{}>> {
    const uploadReq: ng.IRequestConfig = {
      method: 'PUT',
      url: fileUploadObject.tempUrl,
      headers: {
        'Content-Type': 'text/csv',
      },
      data: fileData,
    };
    return this.$http(uploadReq);
  }

  private getFileChecksum(uniqueFileName: string): ng.IPromise<IGetFileChecksumResponse> {
    return this.$http<IGetFileChecksumResponse>({
      method: 'GET',
      url: `${this.UrlConfig.getAdminServiceUrl()}csv/organizations/${this.Authinfo.getOrgId()}/downloadurl`,
      params: {
        filename: uniqueFileName,
      },
    }).then(response => response.data);
  }

  private checkFileChecksum(fileUploadObject: IGetFileUrlResponse, fileChecksum: string): ng.IPromise<void> {
    return this.$q((resolve, reject) => {
      this.getFileChecksum(fileUploadObject.uniqueFileName)
        .then(fileChecksumObject => {
          if (fileChecksumObject.md5 === fileChecksum) {
            resolve();
          } else {
            reject(this.$translate.instant('userTaskManagerModal.csvFileChecksumError'));
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  private submitCsvImportJob(fileUploadObject: IGetFileUrlResponse, exactMatchCsv: boolean): ng.IPromise<ITask> {
    const taskReq: ng.IRequestConfig = {
      method: 'POST',
      url: this.USER_ONBOARD_URL,
      data: {
        exactMatchCsv: exactMatchCsv,
        csvFile: fileUploadObject.uniqueFileName,
        useLocalFile: false,
      },
    };
    return this.$http<ITask>(taskReq)
      .then(response => response.data);
  }

  public getTaskErrors(id: string, cancelPromise?: ng.IPromise<void>): ng.IPromise<IGetTaskErrorsResponse> {
    return this.$http<IGetTaskErrorsResponse>({
      method: 'GET',
      url: this.getJobSpecificUrl(id, '/errors'),
      timeout: cancelPromise,
      params: {
        limit: this.ERROR_LIMIT,
      },
    }).then(response => response.data);
  }

  public getNextTaskErrors(url: string, cancelPromise?: ng.IPromise<void>): ng.IPromise<IGetTaskErrorsResponse> {
    return this.$http<IGetTaskErrorsResponse>({
      method: 'GET',
      url: url,
      timeout: cancelPromise,
    }).then(response => response.data);
  }

  private appendErrorArray(url: string, cancelPromise?: ng.IPromise<void>): ng.IPromise<void> {
    return this.getNextTaskErrors(url, cancelPromise).then(response => {
      this.errorArray = _.concat(this.errorArray, this.transformErrorData(response.items));
      if (!_.isEmpty(response.paging.next)) {
        return this.appendErrorArray(response.paging.next[0], cancelPromise);
      }
    });
  }

  public downloadTaskErrors(): ng.IPromise<void> {
    this.errorArray = [];
    this.cancelDownloadErrorsDeferred = this.$q.defer();
    return this.getTaskErrors(this.activeTask!.id, this.cancelDownloadErrorsDeferred!.promise).then(response => {
      this.errorArray = _.concat(this.errorArray, this.transformErrorData(response.items));
      if (!_.isEmpty(response.paging.next)) {
        return this.appendErrorArray(response.paging.next[0], this.cancelDownloadErrorsDeferred!.promise).then(() => {
          this.cancelDownloadErrorsDeferred = undefined;
        });
      }
    });
  }

  public transformErrorData(errors: IErrorItem[]): IErrorRow[] {
    const tempUserErrorArray: IErrorRow[] = [];
    _.forEach(errors, errorEntry => {
      _.forEach(errorEntry.error.message, msg => {
        let errorMessage = '';
        const errorType = _.split(_.get(msg, 'code'), '-')[0];
        const errorCode = _.split(_.get(msg, 'code'), '-')[1];

        if (!_.isUndefined(errorType) && _.startsWith(errorType, 'BATCH')) {
          // For EFT, if the code starts with 'BATCH', use the description
          errorMessage = msg.description;
        } else if (errorCode) {
          // get the localized error message
          errorMessage = this.UserCsvService.getBulkErrorResponse(_.parseInt(_.get(errorEntry, 'error.key')), errorCode);
          // For EFT, if the error messages are stock/generic messages, use the description
          if (errorMessage === this.$translate.instant('firstTimeWizard.bulk400Error')
          || errorMessage === this.$translate.instant('firstTimeWizard.bulk401And403Error')
          || errorMessage === this.$translate.instant('firstTimeWizard.bulk404Error')
          || errorMessage === this.$translate.instant('firstTimeWizard.bulk408Error')
          || errorMessage === this.$translate.instant('firstTimeWizard.bulk409Error')) {
            errorMessage = msg.description;
          }
        } else {
          errorMessage = msg.description;
        }

        tempUserErrorArray.push({
          row: _.get(errorEntry, 'itemNumber'),
          error: `${errorMessage} TrackingID: ${_.get(errorEntry, 'trackingId')}`,
        });
      });
    });
    return tempUserErrorArray;
  }

  public initTaskDetailPolling(id: string, callback: Function, scope: ng.IScope) {
    return this.initTaskPolling('detail', () => this.getTask(id), callback, scope);
  }

  public initRunningTaskListPolling(callback: Function, scope: ng.IScope) {
    return this.initTaskPolling('running', () => this.getInProcessTasks(), callback, scope);
  }

  public initAllTaskListPolling(callback: Function, scope: ng.IScope) {
    return this.initTaskPolling('list', () => this.getTasks(), callback, scope);
  }

  public changeRunningTaskListPolling(newDelay: number) {
    return this.changeTaskPollingDelay('running', newDelay);
  }

  public changeAllTaskListPolling(newDelay: number) {
    return this.changeTaskPollingDelay('list', newDelay);
  }

  public cleanupTaskDetailPolling(callback: Function) {
    return this.cleanupTaskPolling('detail', callback);
  }

  public cleanupRunningTaskListPolling(callback: Function) {
    return this.cleanupTaskPolling('running', callback);
  }

  public cleanupAllTaskListPolling(callback: Function) {
    return this.cleanupTaskPolling('list', callback);
  }

  public setActiveTask(taskSelected: ITask) {
    if (this.cancelDownloadErrorsDeferred) {
      this.cancelDownloadErrorsDeferred.resolve();
      this.cancelDownloadErrorsDeferred = undefined;
    }
    this.activeTask = taskSelected;
  }

  private changeTaskPollingDelay(intervalType: IntervalType, newDelay: number) {
    const interval = this.interval[intervalType];
    const intervalFunction = this.intervalFunction[intervalType];
    const oldDelay = this.intervalDelay[intervalType];
    if (newDelay === oldDelay || !interval || !intervalFunction) {
      return;
    }

    this.$interval.cancel(interval);
    this.interval[intervalType] = undefined;
    this.intervalDelay[intervalType] = newDelay;
    this.initInterval(intervalType);
  }

  private initTaskPolling(intervalType: IntervalType, intervalFunction: () => ng.IPromise<any>, callback: Function, scope: ng.IScope) {
    const interval = this.interval[intervalType];
    const intervalCallbacks = this.intervalCallbacks[intervalType];
    this.intervalFunction[intervalType] = intervalFunction;

    if (!_.includes(intervalCallbacks, callback)) {
      intervalCallbacks.push(callback);
    }

    scope.$on('$destroy', () => this.cleanupTaskPolling(intervalType, callback));

    if (interval) {
      return;
    }

    this.doIntervalFunction(intervalType);
    this.initInterval(intervalType);
  }

  private initInterval(intervalType: IntervalType) {
    this.interval[intervalType] = this.$interval(() => {
      if (this.intervalInProgress[intervalType]) {
        return;
      }
      this.doIntervalFunction(intervalType);
    }, this.intervalDelay[intervalType]);
  }

  private doIntervalFunction(intervalType: IntervalType) {
    const intervalFunction = this.intervalFunction[intervalType];
    if (!_.isFunction(intervalFunction)) {
      return;
    }

    this.intervalInProgress[intervalType] = true;
    intervalFunction()
      .then((...args) => _.forEach(this.intervalCallbacks[intervalType], intervalCallback => intervalCallback(...args)))
      .finally(() => this.intervalInProgress[intervalType] = false);
  }

  private cleanupTaskPolling(intervalType: IntervalType, callback: Function) {
    const interval = this.interval[intervalType];
    const intervalCallbacks = this.intervalCallbacks[intervalType];
    _.pull(intervalCallbacks, callback);

    if (intervalCallbacks.length === 0 && interval) {
      this.$interval.cancel(interval);
      this.interval[intervalType] = undefined;
    }
  }

  private get USER_ONBOARD_URL() {
    return `${this.UrlConfig.getAdminBatchServiceUrl()}/customers/${this.Authinfo.getOrgId()}/jobs/general/useronboard`;
  }

  private getJobSpecificUrl(id: string, additionalPath: string = '') {
    return `${this.USER_ONBOARD_URL}/${encodeURIComponent(id)}${additionalPath}`;
  }
}
