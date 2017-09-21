import { ITask } from './user-task-mgr.component';

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

export class UserTaskMgrService {

  /* @ngInject */
  constructor(
    private Authinfo,
    private UrlConfig,
    private $http: ng.IHttpService,
    // private $q: ng.IQService,
  ) {}

  public getTasks(): ng.IPromise<ITask[]> {
    return this.$http<IGetTasksResponse>({
      method: 'GET',
      url: `${this.UrlConfig.getAdminBatchServiceUrl()}/customers/${this.Authinfo.getOrgId()}/jobs/general/useronboard`,
    }).then(response => response.data.items);
  }

}
