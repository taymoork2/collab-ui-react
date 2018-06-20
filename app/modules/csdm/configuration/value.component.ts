import IDevice = csdm.IDevice;
import { CsdmLyraConfigurationService } from '../services/csdm-lyra-configuration.service';
import { ConfigNode } from './configuration';
import { IOnChangesObject } from 'angular';

class ValueCtrl implements ng.IComponentController {
  public enumValue: boolean;
  public stringValue: boolean;
  public intValue: boolean;
  public selectedValue: any;
  public enumValues: string[];
  public currentValue: any;

  public sliderInputOptions = {
    showSelectionBar: false,
    floor: 0,
    ceil: 100,
  };

  //bindings
  public selection: ConfigNode;
  public device: IDevice;
  public numberOfSuggestions: number;
  public highlightedSuggestion: number;

  /* @ngInject */
  constructor(private CsdmLyraConfigurationService: CsdmLyraConfigurationService) {
  }

  public $onChanges(onChangesObj: IOnChangesObject) {
    const currentSelection = _.get<ConfigNode>(onChangesObj, 'selection.currentValue');
    if (!currentSelection || !currentSelection.value) {
      this.currentValue = null;
      this.selectedValue = null;
      this.intValue = false;
      this.stringValue = false;
      this.enumValue = false;
      return;
    }
    if (!this.device.wdmUrl) {
      return;
    }
    if (this.selection && this.selection.value) {
      this.CsdmLyraConfigurationService.getConfig(this.device.cisUuid, this.device.wdmUrl, this.selection.key)
        .then((value) => {
          this.currentValue = value;
          this.selectedValue = value.value;
        })
        .catch(() => {
          this.selectedValue = undefined;
        });
      if (this.selection.value.schema.type === 'string' && this.selection.value.schema.enum) {
        this.enumValue = true;
        this.enumValues = this.selection.value.schema.enum;
        this.numberOfSuggestions = this.enumValues.length;
      } else if (this.selection.value.schema.type === 'string') {
        this.stringValue = true;
      } else {
        this.intValue = true;
      }
    }
  }

  public selectValue(value?: any) {
    if (!_.isUndefined(value)) {
      this.selectedValue = value;
    }
  }
}

export class ValueSuggestionsComponent implements ng.IComponentOptions {
  public controller = ValueCtrl;
  public controllerAs = 'vctrl';
  public template = require('modules/csdm/configuration/value-suggestion.html');
  public bindings = {
    device: '<',
    highlightedSuggestion: '<',
    numberOfSuggestions: '=',
    selectedValue: '=',
    selection: '<',
  };
}
