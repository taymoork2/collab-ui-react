import { IStateParamsService } from 'angular-ui-router';
import { BulkAction, IBulkFailure, IBulkResponse } from '../services/csdmBulk.service';
import { IHttpResponse, IHttpService, IIntervalService, IScope } from 'angular';
import IDevice = csdm.IDevice;
import moment = require('moment');
import { Notification } from '../../core/notifications/notification.service';

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
  private bulkAction: BulkAction;
  private pullProgressErrorCount = 0;

  public get title() {
    return _.get(this.$stateParams, 'title');
  }

  public get inProgress() {
    return this.pullProgressErrorCount < 10 && (!this.bulkAction || this.bulkAction.inProgress);
  }

  public get hasErrors() {
    return this.gridOptions.data && this.gridOptions.data.length > 0;
  }

  /* @ngInject */
  constructor(private $stateParams: IStateParamsService,
              private $interval: IIntervalService,
              private $http: IHttpService,
              private $scope: IScope,
              private Notification: Notification) {
  }

  public $onInit() {
    this.actionName = this.$stateParams.bulkAction.actionName;
    this.bulkAction = this.$stateParams.bulkAction;
    this.initGrid();
    this.perform();
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
    const bulkAction: BulkAction = this.bulkAction;
    if (!(bulkAction instanceof BulkAction)) {
      return;
    }
    const localeData: any = moment.localeData(moment.locale());
    localeData._calendar.sameElse = 'lll';
    this.startTime = moment(Date.now()).calendar();
    bulkAction.postBulkAction().then((result: IHttpResponse<IBulkResponse>) => {
      this.bulkResult = result.data;

      if (!this.bulkActionPoller) {
        this.bulkActionPoller = this.$interval(() => this.pollBulkAction(), 1000, 0);
        this.$scope.$on('$destroy', () => {
          this.$interval.cancel(this.bulkActionPoller);
        });
      }
    }).catch(error => {
      this.Notification.errorWithTrackingId(error, 'deviceBulk.deletionFullError');
    });
  }

  private pollBulkAction() {
    this.bulkAction.pullActionProgress()
      .then((result: IHttpResponse<IBulkResponse>) => {
        this.pullProgressErrorCount = 0;
        this.processBulkResponse(result.data);
        if (BulkAction.isCompleted(result.data.state)) {
          this.$interval.cancel(this.bulkActionPoller);
        }
      })
      .catch(error => {
        if (error) {
          this.pullProgressErrorCount++;
        } else {
          //possibly the url is wrong
          this.Notification.error('deviceBulk.pollProgressError');
        }
        if (this.pullProgressErrorCount > 9) { //ten seconds with consecutive errors with the current poller
          this.$interval.cancel(this.bulkActionPoller);
          this.Notification.errorWithTrackingId(error, 'deviceBulk.pollProgressError');
        }
      });
  }

  private processBulkResponse(response: IBulkResponse) {
    this.progress = response.progressPercentage;
    this.numberOfSuccesses = response.numberOfSuccesses;
    _.forEach(response.failures, (failure: IBulkFailure, url: string) => {
      if (!_.some(this.failuresData, ['url', url])) {
        this.$http.get(url).then((result: IHttpResponse<IDevice>) => {
          this.failuresData.push({ url: url, error: failure.message, name: result.data.displayName });
          this.gridOptions.data = this.failuresData;
          this.numberOfErrors = _.size(this.failuresData);
        });
      }
    });
    if (BulkAction.isCompleted(response.state)) {
      if (this.numberOfErrors > 0 || this.numberOfSuccesses !== this.bulkAction.deviceCount) {
        this.Notification.warning('deviceBulk.deletionCompletedXDeleted',
          {
            nDevices: this.numberOfSuccesses,
            nTotalDevices: this.bulkAction.deviceCount,
          },
          'deviceBulk.deletionCompletedWErrorTitle');
      } else {
        this.Notification.success('deviceBulk.deletionCompletedXDeleted',
          {
            nDevices: this.numberOfSuccesses,
            nTotalDevices: this.bulkAction.deviceCount,
          },
          'deviceBulk.deletionCompletedTitle');
      }
    }
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
