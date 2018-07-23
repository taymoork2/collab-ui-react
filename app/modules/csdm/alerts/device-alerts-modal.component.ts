import { SearchObject } from 'modules/csdm/services/search/searchObject';
import { IStateService } from 'angular-ui-router';
import { CsdmSearchService } from '../services/csdmSearch.service';
import { FieldQuery } from '../services/search/searchElement';
import { SearchTranslator } from '../services/search/searchTranslator';

class DeviceAlertsModalCtrl implements ng.IComponentController {
  public dismiss: Function;
  public searchObject: SearchObject;

  /* @ngInject */
  constructor(private $state: IStateService,
              private $window: ng.IWindowService,
              private CsdmSearchService: CsdmSearchService,
              private DeviceSearchTranslator: SearchTranslator) {
  }

  public $onInit() {
    this.searchObject = this.$state.params.searchObject;
  }

  public save() {
    this.CsdmSearchService.subscribeToSearch({
      query: this.searchObject.getTranslatedSearchElement(this.DeviceSearchTranslator) || new FieldQuery(''),
      // Following line allows testing of local Atlas against integration CSDM:
      // url: _.replace(this.$window.location.href, 'http://127.0.0.1:8000', 'https://int-admin.ciscospark.com'),
      url: this.$window.location.href,
    }).then(() => {
      this.dismiss();
    });
  }
}

export class DeviceAlertsModalComponent implements ng.IComponentOptions {
  public controller = DeviceAlertsModalCtrl;
  public controllerAs = 'vm';
  public template = require('modules/csdm/alerts/deviceAlertsModal.html');
  public bindings = {
    dismiss: '&',
  };
}
