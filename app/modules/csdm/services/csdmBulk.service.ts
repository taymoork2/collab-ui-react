import IHttpPromise = angular.IHttpPromise;
import { SearchObject } from './search/searchObject';
import { IHttpService, IQService } from 'angular';
import { SearchTranslator } from './search/searchTranslator';
import { Aggregations } from './search/searchResult';

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
          : { type: 'longRun', sleepTimeInSeconds: 1 },
        async: true,
      });
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
  jobUrl: URL;
  state: string;
}

export class BulkAction {
  private _actionName: string;
  constructor(private action: () => IHttpPromise<IBulkResponse>, actionName: string) {
    this._actionName = actionName; //, private updateProgress: (url:string)=> IHttpPromise<IBulkProgress>) {
  }

  get actionName(): string {
    return this._actionName;
  }

  public perform(): IHttpPromise<IBulkResponse> {
    return this.action();
  }
}
