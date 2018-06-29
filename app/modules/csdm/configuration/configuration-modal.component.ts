import { IStateParamsService, IStateService } from 'angular-ui-router';
import { CsdmLyraConfigurationService } from '../services/csdm-lyra-configuration.service';
import IDevice = csdm.IDevice;
import { Configuration, ConfigNode } from './configuration';
import { Codes } from '../../core/accessibility/accessibility.service';
import { IQService, ITimeoutService } from 'angular';

class ConfigurationModalCtrl implements ng.IComponentController {
  private getSchemaPromise: IPromise<any>;
  public dismiss: Function;
  public selectedDevice: IDevice;
  public configuration: Configuration;
  public selection: ConfigNode | null;
  private _searchQuery: string = '';
  public suggestions: ConfigNode[];
  public highlightedSuggestion = 0;
  public lastSelection: ConfigNode;
  public selections: ConfigNode[] = [];
  private ghostSelections: ConfigNode[] = [];
  public numberOfValueSuggestion = 0;
  private selectedValue: any;

  public configLog: { config: ConfigNode, value: any, success: boolean }[] = [];

  public get title() {
    return _.get(this.$stateParams, 'title');
  }

  /* @ngInject */
  constructor(private $element: ng.IRootElementService,
              private $q: IQService,
              private $state: IStateService,
              private $stateParams: IStateParamsService,
              private $timeout: ITimeoutService,
              private CsdmLyraConfigurationService: CsdmLyraConfigurationService,
              private LaunchAdvancedSettingsModal,
  ) {
  }

  public $onInit() {
    this.selectedDevice = this.$state.params.selectedDevice;
    if (!this.selectedDevice.wdmUrl) {
      return;
    }
    this.getSchemaPromise = this.CsdmLyraConfigurationService.getSchema(this.selectedDevice.cisUuid,
      this.selectedDevice.wdmUrl)
      .then((res) => {
        const configuration = new Configuration(res);
        this.configuration = configuration;
        this.lastSelection = configuration.rootNode;
        this.searchQuery = this._searchQuery; //trigger the suggestion parsing.
      });
  }

  public get searchQuery(): string {
    return this._searchQuery;
  }

  public set searchQuery(value: string) {
    this._searchQuery = value;
    this.suggest().then(s => {
      this.suggestions = s;
      this.highlightedSuggestion = 0;
    });
  }

  public get configInput() {
    return this.lastSelection && this.lastSelection.value ? this.selectedValue : this.searchQuery;
  }

  public set configInput(value: string) {
    if (this.lastSelection && this.lastSelection.value) {
      this.selectedValue = value;
    } else {
      this.searchQuery = value;
    }
  }

  public openDeviceWebPortal() {
    this.LaunchAdvancedSettingsModal.open(this.selectedDevice);
  }

  public suggest(): IPromise<ConfigNode[]> {
    const deferred = this.$q.defer<ConfigNode[]>();
    this.getSchemaPromise.then(() => {
      this._searchQuery = this._searchQuery.split(' ').slice(-1)[0];
      const query = this._searchQuery;
      const result: ConfigNode[] = _.values(this.configuration.suggest(
        {
          selections: this.selections,
          cursor: this.selections.length + 1,
          query: query,
        }));
      deferred.resolve(result);
    });
    return deferred.promise;
  }

  public select(selection: ConfigNode) {
    this.lastSelection = selection;
    const newSelections = [];
    this.recursiveSelectParents(selection, newSelections);
    this.selections = newSelections;
    this.searchQuery = '';
    if (this.ghostSelections.length > 0) {
      this.ghostSelections.slice(1);
      if (!selection.sortedChildren()[this.ghostSelections[0].name]) {
        this.ghostSelections = [];
      }
    }
    this.focusInput();
  }

  public focusInput() {
    this.$timeout(0).then(() => {
      this.$element.find('#config-input').focus();
      if (this.lastSelection.value) {
        this.$timeout(0).then(() => {
          const inputField = this.$element.find('#config-input');
          const inputFieldElement = inputField[0] as HTMLInputElement;
          inputFieldElement.setSelectionRange(0, inputFieldElement.value.length);
        });
      }
    });
  }

  public ghostSelectionsAsString() {
    return _.map(this.ghostSelections, 'name').join(' ');
  }

  private recursiveSelectParents(selection: ConfigNode, selections: ConfigNode[]) {
    if (selection.parent) {
      this.recursiveSelectParents(selection.parent, selections);
      selections.push(selection);
    }
  }

  public selectLevel(sel: ConfigNode) {
    this.ghostSelections = this.selections.slice(sel.level - 1);
    this.selections = this.selections.slice(0, sel.level - 1);
    this.lastSelection = this.selections.slice(-1).pop() || this.configuration.rootNode;
    this.focusInput();
    this.searchQuery = '';
  }

  private selectHighlightedSuggestion() {
    if (this.highlightedSuggestion < this.suggestions.length) {
      this.select(this.suggestions[this.highlightedSuggestion]);
      return;
    }
  }

  private onSearchKeyDown($keyEvent: KeyboardEvent) {
    if ($keyEvent && $keyEvent.key) {
      switch ($keyEvent.key) {
        case Codes.Enter:
        case Codes.Tab:
          this.selectHighlightedSuggestion();
          $keyEvent.preventDefault();
          return;
        case Codes.ArrowDown:
          this.highlightedSuggestion++;
          this.highlightedSuggestion = this.highlightedSuggestion >= this.suggestions.length ? this.suggestions.length - 1 : this.highlightedSuggestion;
          return;
        case Codes.ArrowUp:
          this.highlightedSuggestion--;
          this.highlightedSuggestion = this.highlightedSuggestion < 0 ? 0 : this.highlightedSuggestion;
          return;
      }
    }
  }

  private onConfigValueKeyDown(keyEvent: KeyboardEvent) {
    if (keyEvent && keyEvent.key) {
      switch (keyEvent.key) {
        case Codes.ArrowDown:
          this.highlightedSuggestion++;
          this.highlightedSuggestion = this.highlightedSuggestion >= this.numberOfValueSuggestion ? this.numberOfValueSuggestion - 1 : this.highlightedSuggestion;
          return;
        case Codes.ArrowUp:
          this.highlightedSuggestion--;
          this.highlightedSuggestion = this.highlightedSuggestion < 0 ? 0 : this.highlightedSuggestion;
          return;
      }
    }
  }

  public onConfigInputKeyPress(keyEvent: KeyboardEvent) {
    if (this.lastSelection && this.lastSelection.value) {
      return this.onConfigValueKeypress(keyEvent);
    }
    return this.onSearchKeyPress(keyEvent);
  }

  public onConfigInputKeyDown(keyEvent: KeyboardEvent) {
    if (keyEvent && keyEvent.key) {
      switch (keyEvent.key) {
        case Codes.Backspace:
          if (!this.configInput) {
            this.selectLevel(this.selections.slice(-1)[0]);
          }
          return;
      }

    }
    if (this.lastSelection && this.lastSelection.value) {
      this.onConfigValueKeyDown(keyEvent);
      return;
    }
    return this.onSearchKeyDown(keyEvent);
  }

  private onSearchKeyPress(_$keyEvent: KeyboardEvent) {
    return;
  }

  private onConfigValueKeypress(keyEvent: KeyboardEvent) {
    if (keyEvent && keyEvent.key) {
      switch (keyEvent.key) {
        case Codes.Enter:
          this.validateAndSetValue();
          break;
        case Codes.Tab:
          break;
      }
    }
  }

  public validateAndSetValue(): angular.IPromise<void> {
    const configNode = this.lastSelection;
    if (!this.selectedDevice.wdmUrl || !configNode) {
      return this.$q.resolve();
    }
    if (!configNode.value ||
      (configNode.value.schema.enum && -1 === _.indexOf(configNode.value.schema.enum,
        this.selectedValue))) {
      return this.$q.resolve();
    }
    const value = configNode.value.schema.type === 'integer'
      ? _.toInteger(this.selectedValue)
      : this.selectedValue;
    return this.CsdmLyraConfigurationService.writeConfig(
      this.selectedDevice.cisUuid,
      this.selectedDevice.wdmUrl,
      configNode.key,
      value)
      .then(() => {
        this.configLog.push({ config: configNode, value: value, success: true });
      })
      .catch(() => {
        this.configLog.push({ config: configNode, value: value, success: false });
      });
  }
}

export class ConfigurationModalComponent implements ng.IComponentOptions {
  public controller = ConfigurationModalCtrl;
  public controllerAs = 'vm';
  public template = require('modules/csdm/configuration/configurationModal.html');
  public bindings = {
    dismiss: '&',
  };
}
