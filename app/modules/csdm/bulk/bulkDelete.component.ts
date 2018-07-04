import { IStateService } from 'angular-ui-router';
import { BulkAction, CsdmBulkService } from '../services/csdmBulk.service';
import { IComponentController, IComponentOptions } from 'angular';
import { BulkActionName, ICsdmAnalyticHelper } from '../services/csdm-analytics-helper.service';
import { SearchObject } from '../services/search/searchObject';
import { CsdmSearchService, Caller } from 'modules/csdm/services/csdmSearch.service';
import { QueryParser } from 'modules/csdm/services/search/queryParser';
import { SearchTranslator } from 'modules/csdm/services/search/searchTranslator';
import { IDevice } from 'modules/squared/devices/emergencyServices';
import { Dictionary } from 'lodash';

class BulkDeleteCtrl implements IComponentController {
  private dismiss: Function;
  public title: string;
  private deleteEmptyPlaces: boolean;
  public numberOfActiveDevices: number = 0;
  public searchForActiveDevicesComplete = false;
  private testDelete: boolean = false;

  /* @ngInject */
  constructor(private $state: IStateService,
              private CsdmBulkService: CsdmBulkService,
              private CsdmSearchService: CsdmSearchService,
              private CsdmAnalyticsHelper: ICsdmAnalyticHelper,
              private Notification,
              private $q) {
    this.title = this.$state.params.title;
    this.searchForActiveDevices();
  }

  public get numberOfDevices() {
    return _.size(this.$state.params.selectedDevices);
  }

  private searchForActiveDevices() {
    const selectedDevices: Dictionary<IDevice> = this.$state.params.selectedDevices;
    const queryParser = new QueryParser(new SearchTranslator(null, null));
    const searchObject = SearchObject.createWithQuery(queryParser, 'url=(' + _.join(_.keys(selectedDevices), ' OR ') + ')');
    searchObject.aggregates = [SearchObject.Aggregate_ConnectionStatus];

    this.CsdmSearchService.search(searchObject, Caller.searchOrLoadMore)
      .then((response) => {
        if (response && response.data) {
          this.searchForActiveDevicesComplete = true;
          this.numberOfActiveDevices = _.sumBy(response.data.aggregations.connectionStatus.buckets, (element): number => {
            if (element.key !== 'offline_expired') { return element.docCount; }
            return 0;
          });
        }
      })
      .catch(e => {
        this.Notification.errorResponse(e, 'deviceBulk.failedToSearchForActiveDevices');
        this.numberOfActiveDevices = -1;
      });
  }

  public delete() {
    const bulkAction = new BulkAction(
      this.$q,
      this.CsdmBulkService,
      this.CsdmBulkService.delete.bind(this.CsdmBulkService,
        _.keys(this.$state.params.selectedDevices),
        this.deleteEmptyPlaces,
        !this.testDelete),
      this.$state.params.devicesDeleted,
      this.$state.params.selectedDevices,
      'deviceBulk.deleted');
    this.$state.go('deviceBulkFlow.perform',
      {
        title: this.title,
        bulkAction: bulkAction,
      },
    );
    this.CsdmAnalyticsHelper.trackBulkAction(
      BulkActionName.DELETE,
      {
        mainAction: this.testDelete ? BulkActionName.DELETE_FAKE : BulkActionName.DELETE,
        selectedDevices: _.size(this.$state.params.selectedDevices),
      });
  }

  public close() {
    this.dismiss();
  }
}

export class BulkDeleteComponent implements IComponentOptions {
  public controller = BulkDeleteCtrl;
  public template = require('modules/csdm/bulk/bulkDelete.html');
  public bindings = {
    dismiss: '&',
  };
}
