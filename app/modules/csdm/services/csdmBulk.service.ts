import IHttpPromise = angular.IHttpPromise;
import { SearchObject } from './search/searchObject';
import { IHttpResponse, IHttpService, IQService } from 'angular';
import { SearchTranslator } from './search/searchTranslator';
import { Aggregations } from './search/searchResult';
import { Dictionary } from 'lodash';
import { IIdentifiableDevice } from './deviceSearchConverter';

export class CsdmBulkService {

  /* @ngInject */
  constructor(private $http: IHttpService, private $q: IQService, private UrlConfig,
              private DeviceSearchTranslator: SearchTranslator, private Authinfo) {

  }

  public getIds(search: SearchObject): IHttpPromise<IGetIdResponse> {
    const url = this.UrlConfig.getCsdmServiceUrl() + '/organization/' + this.Authinfo.getOrgId() + '/devices/?field=url';
    return this.$http
      .post<IGetIdResponse>(
        url,
        this.constructSearchRequest(search))
      .catch(response => {
        return this.$q.reject(response);
      });
  }

  public delete(deviceUris: any[], deleteEmptyPlaces: boolean, really: boolean): IHttpPromise<IBulkResponse> {
    const url = this.UrlConfig.getCsdmServiceUrl() + '/organization/' + this.Authinfo.getOrgId() + '/devices/bulk/';
    return this.$http.post(
      url,
      {
        deviceUris: deviceUris,
        updateCommand: really
          ? { type: 'delete', deleteEmptyPlaces: deleteEmptyPlaces }
          : { type: 'longRun', sleepTimeInMilliSeconds: 111 },
        async: true,
      });
  }

  public getJobStatus(jobUrl: string): IHttpPromise<IBulkResponse> {
    const expectedStartOfUrl = this.UrlConfig.getCsdmServiceUrl() + '/organization/' + this.Authinfo.getOrgId() + '/devices/bulk/';
    if (!_.startsWith(jobUrl, expectedStartOfUrl)) {
      this.$q.reject();
    }
    return this.$http.get<IBulkResponse>(jobUrl);
  }

  public constructSearchRequest(so: SearchObject): any {
    if (!so) {
      throw new Error('Invalid search state.');
    }
    return {
      query: so.getTranslatedSearchElement(this.DeviceSearchTranslator),
      size: 100000,
    };
  }
}

export interface IGetIdResponse {
  aggregations: Aggregations;
  deviceIdentifiers: string[];
}

export interface IBulkFailure {
  code: string;
  message: string;
  parameters: { [key: string]: string };
}

export interface IBulkResponse {
  failures: { [key: string]: IBulkFailure };
  numberOfFailures: number;
  numberOfSuccesses: number;
  progressPercentage: number;
  totalNumber: number;
  updateCommand: { type: string };
  jobUrl: string;
  state: string;
  async: boolean;
}

export class BulkAction {
  private static finished = 'finished';
  private static failed = 'failed';

  private _actionName: string;
  private informHasHappend = false;
  private jobUrl: string;
  private currentBulkResponse: IBulkResponse;

  constructor(private $q: IQService, private  CsdmBulkService: CsdmBulkService,
              private action: () => IHttpPromise<IBulkResponse>,
              private actionFinalStateSubscriber: (bulkAction: BulkAction, deviceUrlsWithSuccesses: Dictionary<IIdentifiableDevice>) => void,
              private devices: Dictionary<IIdentifiableDevice>,
              actionName: string) {
    this._actionName = actionName; //, private updateProgress: (url:string)=> IHttpPromise<IBulkProgress>) {
  }

  get actionName(): string {
    return this._actionName;
  }

  public get inProgress(): boolean {
    return !this.currentBulkResponse ||
      !BulkAction.isCompleted(this.currentBulkResponse.state);
  }

  public get deviceCount() {
    return _.size(this.devices);
  }

  public static isCompleted(state: string): boolean {
    return (state === BulkAction.failed || state === BulkAction.finished);
  }

  public postBulkAction(): IPromise<IHttpResponse<IBulkResponse>> {
    return this.action().then((b: IHttpResponse<IBulkResponse>) => {
      if (b.data && b.data.jobUrl) {
        this.jobUrl = b.data.jobUrl;
      }
      return b;
    });
  }

  public pullActionProgress(): IPromise<IHttpResponse<IBulkResponse>> {
    if (!this.jobUrl) {
      this.$q.reject();
    }
    return this.CsdmBulkService.getJobStatus(this.jobUrl).then((result: IHttpResponse<IBulkResponse>) => {
      if (result.data && (result.data.state === 'finished' || result.data.state === 'failed')) {
        this.currentBulkResponse = result.data;
        this.informActionFinalState();
      }
      return result;
    });
  }

  public informActionFinalState() {
    if (this.informHasHappend || !this.currentBulkResponse) {
      return;
    }
    if (this.currentBulkResponse && (this.currentBulkResponse.state === BulkAction.finished || this.currentBulkResponse.state === BulkAction.failed)) {
      if (_.isFunction(this.actionFinalStateSubscriber)) {
        const devices = _.clone(this.devices);
        _.forEach(this.currentBulkResponse.failures, (_message, key: string) => {
          delete this.devices[key];
        });
        this.actionFinalStateSubscriber(this, devices);
      }
    }
  }
}
