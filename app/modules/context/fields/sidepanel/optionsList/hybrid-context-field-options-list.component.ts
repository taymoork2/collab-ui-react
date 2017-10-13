import IDataTypeDefinition, { EnumDataTypeUtils } from 'modules/context/fields/dataTypeDefinition';

export class SidePanelOptionsListCtrl implements ng.IComponentController {

  private typeDefinition: IDataTypeDefinition;
  private defaultOption?: String;

  /* @ngInject */
  constructor(
    private $state,
    private $translate,
    ) {
  }

  public $onInit() {
    // just in case this doesn't exist for UTs
    if (_.has(this.$state, 'current.data')) {
      // set the breadcrumb label
      this.$state.current.data.displayName = this.$translate.instant('context.dictionary.fieldPage.optionsLabel');
    }
  }

  public getDataTypeDefinition() {
    return _.cloneDeep(this.typeDefinition);
  }

  public getOptions() {
    return EnumDataTypeUtils.getActiveOptions(this.typeDefinition);
  }

  public getOptionsCount() {
    return EnumDataTypeUtils.getActiveOptionsCount(this.typeDefinition);
  }

  public isDefault(option: String) {
    return _.isEqual(this.defaultOption, option);
  }

  public getToolTip(option: String) {
    return option;
  }

  public getClassesForOption(option: String) {
    return {
      option: true,
      'option-default': this.isDefault(option),
    };
  }
}

export class SidePanelOptionsListComponent implements ng.IComponentOptions {
  public controller = SidePanelOptionsListCtrl;
  public template = require('modules/context/fields/sidepanel/optionsList/hybrid-context-field-options-list.html');
  public bindings = {
    // NOTE: using 'dataTypeDefinition' results in a kebab-case of 'data-type-definition', and any HTML attribute that
    // starts with 'data-' is "special", so we can't use that
    typeDefinition: '<',
    defaultOption: '@',
  };
}

export default angular
  .module('Context')
  .component('contextFieldSidepanelOptionsList', new SidePanelOptionsListComponent());
