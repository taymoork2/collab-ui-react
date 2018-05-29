import { IStateService } from 'angular-ui-router';
import { IComponentController, IComponentOptions } from 'angular';
import { CsdmBulkService } from '../services/csdmBulk.service';
import { QueryParser } from '../services/search/queryParser';
import { SearchTranslator } from '../services/search/searchTranslator';
import { BulkActionName, ICsdmAnalyticHelper } from '../services/csdm-analytics-helper.service';

class BulkExportCtrl implements IComponentController {
  private dismiss: Function;

  public fields: { [key: string]: { included: boolean, label: string} } = {};

  public get numberOfDevices() {
    return _.size(this.$state.params.selectedDevices);
  }

  /* @ngInject */
  constructor(private $state: IStateService,
              private CsdmBulkService: CsdmBulkService,
              private DeviceSearchTranslator: SearchTranslator,
              private CsdmAnalyticsHelper: ICsdmAnalyticHelper,
              ) {
    this.addField(QueryParser.Field_Displayname, true);
    this.addField(QueryParser.Field_Product, true);
    this.addField(QueryParser.Field_Mac, true);
    this.addField(QueryParser.Field_IP, true);
    this.addField(QueryParser.Field_Serial, true);
    this.addField(QueryParser.Field_SipUrl, false);
    this.addField(QueryParser.Field_Software, false);
    this.addField(QueryParser.Field_ConnectionStatus, false);
    this.addField(QueryParser.Field_ActiveInterface, false);
    this.addField(QueryParser.Field_UpgradeChannel, false);
    this.addField(QueryParser.Field_ErrorCodes, false);
    this.addField(QueryParser.Field_Tag, false);
  }

  private addField(fieldKey: string, included: boolean) {
    this.fields[fieldKey] = { included: included, label: this.DeviceSearchTranslator.getTranslatedQueryFieldDisplayName(fieldKey) };
  }

  public export() {
    const selectedFields = _.keys(_.pickBy(this.fields, f => f.included));
    this.CsdmBulkService.export(_.keys(this.$state.params.selectedDevices), selectedFields)
      .then((res) => {
        if (res) {
          this.close();
        }
      });
    this.CsdmAnalyticsHelper.trackBulkExport(
      {
        mainAction: BulkActionName.EXPORT,
        selectedDevices: _.size(this.$state.params.selectedDevices),
        selectedExportFields: selectedFields,
      });
  }

  public close() {
    this.dismiss();
  }
}

export class BulkExportComponent implements IComponentOptions {
  public controller = BulkExportCtrl;
  public template = require('modules/csdm/bulk/bulkExport.html');
  public bindings = {
    dismiss: '&',
  };
}
