import { IStateParamsService } from 'angular-ui-router';
import { BulkAction, IBulkFailure, IBulkResponse } from '../services/csdmBulk.service';
import { IHttpResponse, IHttpService, IIntervalService, IScope } from 'angular';
import IDevice = csdm.IDevice;
import * as moment from 'moment';

interface IBulkFailureData {
  url: string;
  error: string;
  name: string;
}

class BulkModalCtrl implements ng.IComponentController {
  private failuresData: IBulkFailureData[] = [];
  public dismiss: Function;
  public gridApi: uiGrid.IGridApi;
  public numberOfSuccesses = 0;
  public numberOfErrors = 0;
  public progress = 0;
  public actionName;
  public startTime;
  public gridOptions: uiGrid.IGridOptionsOf<IBulkFailureData>;
  public bulkResult: IBulkResponse;
  public bulkActionPoller: IPromise<void>;

  public get title() {
    return _.get(this.$stateParams, 'title');
  }

  public get hasErrors() {
    return this.gridOptions.data && this.gridOptions.data.length > 0;
  }

  /* @ngInject */
  constructor(private $stateParams: IStateParamsService,
              private $interval: IIntervalService,
              private $http: IHttpService,
              private $scope: IScope) {
    this.initGrid();
    this.perform();
  }

  public $onInit() {
    this.actionName = this.$stateParams.bulkAction.actionName;
  }

  public initGrid() {
    this.gridOptions = {
      columnDefs: [
        { displayName: 'Device belongs to', name: 'name', width: 200 },
        { displayName: 'Errors', name: 'error', width: 249 }],
      enableSorting: false,
      enableMinHeightCheck: false,
    };
  }

  public perform() {
    const bulkAction: BulkAction = this.$stateParams.bulkAction;
    if (!(bulkAction instanceof BulkAction)) {
      return;
    }
    const localeData: any = moment.localeData(moment.locale());
    localeData._calendar.sameElse = 'lll';
    this.startTime = moment(Date.now()).calendar();
    bulkAction.perform().then((result: IHttpResponse<IBulkResponse>) => {
      this.bulkResult = result.data;

      if (!this.bulkActionPoller) {
        this.bulkActionPoller = this.$interval(() => this.pollBulkAction(result.data.jobUrl), 1000, 0);
        this.$scope.$on('$destroy', () => {
          this.$interval.cancel(this.bulkActionPoller);
        });
      }
    });
  }

  private pollBulkAction(url: URL) {
    this.$http.get(url.toString()).then((result: IHttpResponse<IBulkResponse>) => {
      this.processBulkResponse(result.data);
      if (result.data.state === 'failed' || result.data.state === 'finished') {
        this.$interval.cancel(this.bulkActionPoller);
      }
    });
  }

  private processBulkResponse(response: IBulkResponse) {
    this.progress = response.progressPercentage;
    this.numberOfSuccesses = response.numberOfSuccesses;
    _.forEach(response.failures, (failure: IBulkFailure, url: string) => {
      if (!_.some(this.failuresData, ['url', url])) {
        this.$http.get(url.toString()).then((result: IHttpResponse<IDevice>) => {
          this.failuresData.push({ url: url, error: failure.message, name: result.data.displayName });
          this.gridOptions.data = this.failuresData;
          this.numberOfErrors = _.size(this.failuresData);
        });
      }
    });
  }
}

export class BulkModalComponent implements ng.IComponentOptions {
  public controller = BulkModalCtrl;
  public controllerAs = 'vm';
  public template = require('modules/csdm/bulk/bulkModal.html');
  public bindings = {
    dismiss: '&',
  };
}
