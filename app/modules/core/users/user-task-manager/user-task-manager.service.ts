import { ITask } from './user-task-manager.component';
import { TaskStatus } from './user-task-manager.keys';
import { IErrorItem } from './csv-upload-results.component';

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

export interface IGetTaskErrorsResponse {
  items: IErrorItem[];
  paging: IPaging;
}

export class UserTaskManagerService {

  /* @ngInject */
  constructor(
    private Authinfo,
    private UrlConfig,
    private $http: ng.IHttpService,
  ) {}

  public getTasks(): ng.IPromise<ITask[]> {
    return this.$http<IGetTasksResponse>({
      method: 'GET',
      url: `${this.UrlConfig.getAdminBatchServiceUrl()}/customers/${this.Authinfo.getOrgId()}/jobs/general/useronboard`,
    }).then(response => response.data.items);
  }

  public getInProcessTasks(): ng.IPromise<ITask[]> {
    return this.$http<IGetTasksResponse>({
      method: 'GET',
      url: `${this.UrlConfig.getAdminBatchServiceUrl()}/customers/${this.Authinfo.getOrgId()}/jobs/general/useronboard?status=CREATED,STARTING,STARTED,STOPPING`,
    }).then(response => response.data.items);
  }

  public getTask(jobInstanceId: string): ng.IPromise<ITask> {
    return this.$http<ITask>({
      method: 'GET',
      url: `${this.UrlConfig.getAdminBatchServiceUrl()}/customers/${this.Authinfo.getOrgId()}/jobs/general/useronboard/${jobInstanceId}`,
    }).then(response => response.data);
  }

  public submitCsvImportTask(fileName: string, fileData: string, exactMatchCsv: boolean): ng.IPromise<ITask> {
    // submit a CSV file import task procedure:
    // 1. get Swift file location
    // 2. upload CSV file to Swift
    // 3. create and start the Kafka job
    return this.getFileUrl(fileName)
      .then(fileUploadObject => {
        return this.uploadToFileStorage(fileUploadObject, fileData)
          .then(() => {
            return this.submitCsvImportJob(fileUploadObject, exactMatchCsv)
              .then(response => {
                return response;
              });
          });
      });
  }

  private getFileUrl(fileName: string): ng.IPromise<IGetFileUrlResponse> {
    return this.$http<IGetFileUrlResponse>({
      method: 'GET',
      url: `${this.UrlConfig.getAdminServiceUrl()}csv/organizations/${this.Authinfo.getOrgId()}/uploadurl?filename=${fileName}`,
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

  private submitCsvImportJob(fileUploadObject: IGetFileUrlResponse, exactMatchCsv: boolean): ng.IPromise<ITask> {
    const taskReq: ng.IRequestConfig = {
      method: 'POST',
      url: `${this.UrlConfig.getAdminBatchServiceUrl()}/customers/${this.Authinfo.getOrgId()}/jobs/general/useronboard`,
      data: {
        exactMatchCsv: exactMatchCsv,
        csvFile: fileUploadObject.uniqueFileName,
        useLocalFile: false,
      },
    };
    return this.$http<ITask>(taskReq)
    .then(response => response.data);
  }

  public getTaskErrors(jobInstanceId: string): ng.IPromise<IErrorItem[]> {
    return this.$http<IGetTaskErrorsResponse>({
      method: 'GET',
      url: `${this.UrlConfig.getAdminBatchServiceUrl()}/customers/${this.Authinfo.getOrgId()}/jobs/general/useronboard/${jobInstanceId}/errors`,
    }).then(response => response.data.items);
  }

  public cancelTask(jobInstanceId: string): ng.IPromise<ng.IHttpResponse<{}>> {
    const postReq: ng.IRequestConfig = {
      method: 'POST',
      url: `${this.UrlConfig.getAdminBatchServiceUrl()}/customers/${this.Authinfo.getOrgId()}/jobs/general/useronboard/${jobInstanceId}/actions/abandon/invoke`,
    };
    return this.$http(postReq);
  }

  public pauseTask(jobInstanceId: string): ng.IPromise<ng.IHttpResponse<{}>> {
    const postReq: ng.IRequestConfig = {
      method: 'POST',
      url: `${this.UrlConfig.getAdminBatchServiceUrl()}/customers/${this.Authinfo.getOrgId()}/jobs/general/useronboard/${jobInstanceId}/actions/pause/invoke`,
    };
    return this.$http(postReq);
  }

  public resumeTask(jobInstanceId: string): ng.IPromise<ng.IHttpResponse<{}>> {
    const postReq: ng.IRequestConfig = {
      method: 'POST',
      url: `${this.UrlConfig.getAdminBatchServiceUrl()}/customers/${this.Authinfo.getOrgId()}/jobs/general/useronboard/${jobInstanceId}/actions/resume/invoke`,
    };
    return this.$http(postReq);
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

  public isTaskError(status: string): boolean {
    return status === TaskStatus.COMPLETED_WITH_ERRORS ||
           status === TaskStatus.FAILED;
  }

  public isTaskCanceled(status: string): boolean {
    return status === TaskStatus.ABANDONED;
  }
}
