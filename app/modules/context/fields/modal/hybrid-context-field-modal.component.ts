import { Notification } from 'modules/core/notifications';
import { ContextFieldsService } from 'modules/context/services/context-fields-service';
import { IActionItem } from '../../../core/components/sectionTitle/sectionTitle.component';

interface IFieldData {
  id: string;
  description: string;
  classification: string;
  classificationUI: string;
  dataType: string;
  dataTypeDefinition?: IDataTypeDefinition;
  defaultValue?: any;
  dataTypeUI: string;
  translations: any;
  searchable: Boolean;
  lastUpdated?: string;
  publiclyAccessibleUI: string;
  publiclyAccessible: Boolean;
}

interface IDataTypeDefinition {
  type: string;
  enumerations?: string[];
  translations?: any;
}

interface IOption {
  edit?: boolean;
  value: string;
  index: number;
}

class FieldModalCtrl implements ng.IComponentController {
  private unencrypted: string;
  private encrypted: string;
  private pii: string;

  private defaultClassification: string;

  private dataTypeApiMap: Object;
  private classificationApiMap: Object;
  private classificationHelpTextMap: Object;
  private publiclyAccessibleMap: Object;

  public dataTypeOptions: string[];
  public dataTypePlaceholder: string;
  public classificationOptions: string[];
  public classificationHelpText: string;

  public actionInProgress: Boolean = false;

  public existingFieldIds: string[];
  public existingFieldData: IFieldData;
  public validators: Object;
  public validationMessages: Object;
  public callback: Function;
  public dismiss: Function;
  public createMode: Boolean;
  public fieldData: IFieldData;
  public dataTypeDefinition: Object;

  public optionsList: IOption[] = [];
  public optionsListCopy: IOption[] = [];
  public optionReorderListCopy: IOption[] | undefined;
  public newOption: string;
  public editingOption: boolean;
  public addEnumOption: boolean;
  public reorderEnumOptions: boolean;
  public setDefaultEnumOption: boolean;
  public optionValidators: Object;
  public optionValidationMessages: Object;
  public defaultOption: string;
  public optionRadios: Object[];
  public uniqueOptionCheckPassed: boolean = true;
  public nonEmptyOptionCheckPassed: boolean = true;
  public minimumOptionsCheckPassed: boolean = true;
  public hasContextExpandedTypesToggle: boolean;

  public actionList: IActionItem[];
  public actionListCopy: IActionItem[] = [];
  /* @ngInject */
  constructor(
    private Analytics,
    private $translate: ng.translate.ITranslateService,
    private $timeout: ng.ITimeoutService,
    protected Notification: Notification,
    protected ContextFieldsService: ContextFieldsService,
    protected dragularService,
    protected $scope,
    protected ModalService,
  ) {}

  public $onInit() {
    this.$scope.forms = {};
    this.unencrypted = this.$translate.instant('context.dictionary.fieldPage.unencrypted');
    this.encrypted = this.$translate.instant('context.dictionary.fieldPage.encrypted');
    this.pii = this.$translate.instant('context.dictionary.fieldPage.piiEncrypted');

    this.defaultClassification = this.encrypted;

    // map datatype to value that is accepted by api
    this.dataTypeApiMap = {};
    this.dataTypeApiMap[this.$translate.instant('context.dictionary.dataTypes.boolean')] = 'boolean';
    this.dataTypeApiMap[this.$translate.instant('context.dictionary.dataTypes.double')] = 'double';
    this.dataTypeApiMap[this.$translate.instant('context.dictionary.dataTypes.integer')] = 'integer';
    this.dataTypeApiMap[this.$translate.instant('context.dictionary.dataTypes.string')] = 'string';
    if (this.hasContextExpandedTypesToggle) {
      this.dataTypeApiMap[this.$translate.instant('context.dictionary.dataTypes.enumString')] = 'string';
    }

    // map encrypted type to value that is accepted by api
    this.classificationApiMap = {};
    this.classificationApiMap[this.unencrypted] = 'UNENCRYPTED';
    this.classificationApiMap[this.encrypted] = 'ENCRYPTED';
    this.classificationApiMap[this.pii] = 'PII';

    // map encryption type to help text
    this.classificationHelpTextMap = {};
    this.classificationHelpTextMap[this.unencrypted] = this.$translate.instant('context.dictionary.fieldPage.unencryptedHelpText');
    this.classificationHelpTextMap[this.encrypted] = this.$translate.instant('context.dictionary.fieldPage.encryptedHelpText');
    this.classificationHelpTextMap[this.pii] = this.$translate.instant('context.dictionary.fieldPage.PiiEncryptedHelpText');

    //map publiclyAccessible to value that matches by api
    this.publiclyAccessibleMap = {};
    this.publiclyAccessibleMap[this.$translate.instant('context.dictionary.custom')] = false;
    this.publiclyAccessibleMap[this.$translate.instant('context.dictonary.cisco')] = true;

    // set up the options and placeholder for dataType
    this.dataTypeOptions = _.keys(this.dataTypeApiMap).sort();
    this.dataTypePlaceholder = this.$translate.instant('context.dictionary.fieldPage.dataTypePlaceholder');

    // set up the options and help test for classification (data privacy)
    this.classificationOptions = _.keys(this.classificationApiMap);
    this.classificationHelpText = this.classificationHelpTextMap[this.defaultClassification];

    this.validationMessages = {
      pattern: this.$translate.instant('context.dictionary.fieldPage.fieldIdInvalidCharactersError'),
      unique: this.$translate.instant('context.dictionary.fieldPage.fieldIdUniqueError'),
    };

    this.validators = {
      pattern: this.invalidCharactersValidation,
      // use arrow function here to auto-bind this
      unique: (viewValue: string) => this.uniqueIdValidation(viewValue),
    };

    // if data with an id isn't passed in, we are in create mode
    this.createMode = !Boolean(_.get(this.existingFieldData, 'id'));

    this.fieldData = this.createMode
      ? {
        id: '',
        description: '',
        classification: '',
        classificationUI: this.defaultClassification,
        dataType: '',
        dataTypeUI: '',
        translations: {
          en_US: '',
        },
        searchable: false,
        publiclyAccessible: false,
        publiclyAccessibleUI: '',
      }
      // make a copy to that changes to data isn't reflected in side panel as
      // new data is entered by user
      : _.cloneDeep(this.existingFieldData);


    //copy the enum field options to the optionsList
    if (this.fieldData.dataTypeDefinition) {
      if (this.fieldData.dataTypeDefinition.enumerations) {
        let count = this.optionsList.length - 1;
        this.optionsList = _.map(this.fieldData.dataTypeDefinition.enumerations, enumeration => {
          count++;
          return {
            value: enumeration,
            index: count,
            edit: false,
          };
        });
        this.optionsListCopy = _.cloneDeep(this.optionsList);
      }
    }


    this.optionValidationMessages = {
      unique: this.$translate.instant('context.dictionary.fieldPage.optionUniqueError'),
      required: this.$translate.instant('context.dictionary.fieldPage.optionRequired'),
    };

    this.optionValidators = {
      unique: (optionValue: string) => this.uniqueOptionValidation(optionValue),
    };

    this.defaultOption = this.fieldData.defaultValue;
    this.optionRadios = this.getOptionRadioList();


    this.actionListCopy.push({
      actionKey: this.$translate.instant('context.dictionary.fieldPage.enumOptionsReorder'),
      actionFunction: this.setReorder.bind(this),
    });

    this.actionListCopy.push({
      actionKey: this.$translate.instant('context.dictionary.fieldPage.enumOptionsSetDefault'),
      actionFunction: this.setDefault.bind(this),
    });

    //set the actions
    if (this.optionsListCopy) {
      this.resetActionList();
    }
  }

  private getOptionRadioList() {
    return _.map(this.optionsListCopy, option => {
      return {
        label: option.value,
        value: option.value,
        id: option.index,
        name: option.value,
      };
    });
  }

  private addRemoveDefaultOptionToActionList(): void {
    this.actionList.push({
      actionKey: this.$translate.instant('context.dictionary.fieldPage.enumOptionsRemoveDefault'),
      actionFunction: this.removeDefault.bind(this),
    });
  }


  public setAddEnumOptions() {
    const option = {
      index: this.optionsList.length,
      value: '',
      edit: true,
    };
    this.optionsList.push(option);

    this.setEdit(option, false);
    this.addEnumOption = true;
    this.$timeout(function () {
      $('#option-' + option.index).focus();
    }, 100);
  }

  public setEdit(option: IOption, isUpdate: boolean): void {
    if (_.isObject(option) && _.has(option, 'value')) {
      this.editingOption = true;
      option.edit = true;

      //for edit, need to update the optionsList to get the edit flag
      if (isUpdate) {
        this.optionsList = _.cloneDeep(this.optionsListCopy);
      }
      this.newOption = option.value;
      this.actionList = [];
    }
  }

  public setReorder(): void {
    this.reorderEnumOptions = true;
    this.actionList = [];
    this.optionReorderListCopy = _.cloneDeep(this.optionsListCopy);

    this.dragularService('.options-container', {
      classes: {
        transit: 'options-reorder-transit',
      },
      containersModel: [this.optionsListCopy],
      revertOnSpill: true,
      removeOnSpill: false,
      moves: () => {
        return this.reorderEnumOptions;
      },
    });
  }

  public setDefault(): void {
    this.setDefaultEnumOption = true;
    this.actionList = [];
  }

  public removeDefault(): void {
    this.defaultOption = '';
    if (this.fieldData.defaultValue) {
      this.fieldData.defaultValue = undefined;
    }
    this.resetActionList();
    this.$scope.forms.newFieldForm.$setDirty();

  }

  public resetActionList(): void {
    if (!this.isMinimumOptionsSet()) {
      this.actionList = [];
      return;
    }
    this.actionList = _.cloneDeep(this.actionListCopy);
    this.updateActionList();
  }

  public saveOption(): void {
    const option = _.find(this.optionsList, {
      edit: true,
    });
    option.edit = false;

    const optionOrig = _.cloneDeep(option);

    option.value = this.newOption;
    this.editingOption = false;
    this.addEnumOption = false;

    //update the defaultOption if the changed option is defaultValue
    if (this.isDefaultOption(optionOrig) && !_.isEmpty(this.newOption)) {
      this.defaultOption = this.newOption;
      this.fieldData.defaultValue = this.defaultOption;
    }
    this.updateDataTypeDefinition(this.optionsList);
    this.optionsListCopy = _.cloneDeep(this.optionsList);
    this.optionRadios = this.getOptionRadioList();
    this.resetActionList();
  }

  public updateDataTypeDefinition(list: IOption[]) {
    //update the dataTypeDefintion of fieldData
    const dataTypeDefintion: IDataTypeDefinition = {
      type: 'enum',
    };
    const enumerations = _.map(list, function (option) {
      return option.value;
    });

    dataTypeDefintion.enumerations = enumerations;
    dataTypeDefintion.translations = {
      en_US: enumerations,
    };

    this.fieldData.dataTypeDefinition = dataTypeDefintion;
  }

  public deleteOption(option, form: ng.IFormController): void {
    this.ModalService.open({
      title: this.$translate.instant('context.dictionary.fieldPage.deleteOptionConfirmationHeader'),
      message: this.$translate.instant('context.dictionary.fieldPage.deleteOptionConfirmation'),
      close: this.$translate.instant('common.delete'),
      dismiss: this.$translate.instant('common.cancel'),
      btnType: 'negative',
    }).result.then(() => {
      _.remove(this.optionsList, function(current) {
        return current.index === option.index;
      });
      this.updateIndex(option.index);
      this.updateDataTypeDefinition(this.optionsList);
      this.optionsListCopy = _.cloneDeep(this.optionsList);
      this.optionRadios = this.getOptionRadioList();

      //remove "Remove default" from action list and update the defaultValue
      if (this.isDefaultOption(option)) {
        this.defaultOption = '';
        this.actionList.pop();
        this.fieldData.defaultValue = undefined;
      }

      this.resetActionList();
      form.$setDirty();
    });
  }

  public updateIndex(removedIndex: number): void {
    _.each(this.optionsList, function(option) {
      if (option.index > removedIndex) {
        option.index = option.index - 1;
      }
    });
  }
  public saveOptionsList(form: ng.IFormController): void {
    if (this.reorderEnumOptions) {
      this.updateDataTypeDefinition(this.optionsListCopy);
      this.optionsList = _.cloneDeep(this.optionsListCopy);
      this.reorderEnumOptions = false;
      this.optionReorderListCopy = undefined;
      this.optionRadios = this.getOptionRadioList();
    } else if (this.setDefaultEnumOption) {
      this.setDefaultEnumOption = false;
      this.fieldData.defaultValue = this.defaultOption;
    }
    form.$setDirty();
    this.resetActionList();
  }

  public updateActionList(): void {
    if (!_.isEmpty(this.defaultOption)) {
      this.addRemoveDefaultOptionToActionList();
    }
  }

  public isDefaultOption(option: IOption): boolean {
    return this.defaultOption ? this.defaultOption === option.value : false;
  }

  public showDefaultFlag(): boolean {
    return !_.isEmpty(this.defaultOption);
  }

  public cancelAddOption(): void {
    this.addEnumOption = false;
    this.editingOption = false;
    this.resetActionList();
    //reset optionsList to remove the just added new empty option
    this.optionsList = _.cloneDeep(this.optionsListCopy);
  }

  public cancelEditOption(): void {
    const option = _.find(this.optionsList, {
      edit: true,
    });
    option.edit = false;

    this.optionsListCopy = _.cloneDeep(this.optionsList);
    this.editingOption = false;
    this.resetActionList();
  }

  public showEditOptionIcons(): boolean {
    return !this.editingOption && !this.reorderEnumOptions && !this.setDefaultEnumOption;
  }

  public showEditOptionsListIcons(): boolean {
    return this.reorderEnumOptions || this.setDefaultEnumOption;
  }

  public showAddButton(): boolean {
    return !this.addEnumOption && !this.editingOption && !this.reorderEnumOptions && !this.setDefaultEnumOption;
  }

  public cancelOptionsList(): void {
    if (this.setDefaultEnumOption) {
      this.defaultOption = '';
    }
    this.reorderEnumOptions = false;
    this.setDefaultEnumOption = false;
    this.resetActionList();
    if (this.optionReorderListCopy) {
      this.optionsListCopy = _.cloneDeep(this.optionReorderListCopy);
    }
  }

  public isMinimumOptionsSet(): boolean {
    this.minimumOptionsCheckPassed = (this.optionsListCopy.length >= 2);
    return this.minimumOptionsCheckPassed;
  }

  public create() {
    this.actionInProgress = true;
    return this.ContextFieldsService.createAndGetField(this.fixDataForApi())
      .then(data => {
        // must call callback method to add newly created field to field list
        this.callback(data);
        this.dismiss();
        this.Notification.success('context.dictionary.fieldPage.fieldCreateSuccess');
        this.Analytics.trackEvent(this.Analytics.sections.CONTEXT.eventNames.CONTEXT_CREATE_FIELD_SUCCESS);
      }).catch(() => {
        this.Notification.error('context.dictionary.fieldPage.fieldCreateFailure');
        this.Analytics.trackEvent(this.Analytics.sections.CONTEXT.eventNames.CONTEXT_CREATE_FIELD_FAILURE);
      }).then(() => {
        this.actionInProgress = false;
      });
  }

  public update() {
    this.actionInProgress = true;
    return this.ContextFieldsService.updateAndGetField(this.fixDataForApi())
      .then(data => {
        // need to clone the new fielddata so user can perform
        // another update if they want to
        this.fieldData = _.cloneDeep(data);
        // must call callback method to update field data in side panel;
        // however, don't dismiss the modal as it will overwrite the updated field data in the side panel
        this.callback(this.fieldData);
        this.Notification.success('context.dictionary.fieldPage.fieldUpdateSuccess');
        this.Analytics.trackEvent(this.Analytics.sections.CONTEXT.eventNames.CONTEXT_UPDATE_FIELD_SUCCESS);
      }).catch(() => {
        this.Notification.error('context.dictionary.fieldPage.fieldUpdateFailure');
        this.Analytics.trackEvent(this.Analytics.sections.CONTEXT.eventNames.CONTEXT_UPDATE_FIELD_FAILURE);
      }).then(() => {
        this.actionInProgress = false;
      });
  }

  public createOrSaveButtonEnabled() {
    return Boolean(!this.actionInProgress &&
      this.fieldData.id &&
      this.invalidCharactersValidation(this.fieldData.id) &&
      this.uniqueIdValidation(this.fieldData.id) &&
      this.fieldData.translations &&
      this.fieldData.translations.en_US &&
      this.fieldData.dataTypeUI &&
      this.fieldData.classificationUI);
  }

  public fixDataForApi() {
    this.fieldData.dataType = this.dataTypeApiMap[this.fieldData.dataTypeUI];
    this.fieldData.classification = this.classificationApiMap[this.fieldData.classificationUI];
    this.fieldData.publiclyAccessible = this.publiclyAccessibleMap[this.fieldData.publiclyAccessibleUI];

    return this.fieldData;
  }

  public invalidCharactersValidation(viewValue: string) {
    const value = viewValue || '';
    const regex = new RegExp(/^[0-9a-zA-Z-_]*$/g);
    return regex.test(value);
  }

  public uniqueIdValidation(viewValue: string) {
    const value = viewValue || '';
    return this.existingFieldIds.indexOf(value) === -1;
  }

  public uniqueOptionValidation(optionValue: string) {
    const value = optionValue || '';
    const index =  _.findIndex(this.optionsListCopy, function (current) {
      return current.value === value;
    });

    //handle when edit, allow the same value can be added
    if (!this.addEnumOption) {
      const existingOption = _.find(this.optionsListCopy, function (item) {
        return item.edit === true;
      });

      if (existingOption.value === value) {
        this.uniqueOptionCheckPassed = true;
        this.nonEmptyOptionCheckPassed = !_.isEmpty(value);
        return true;
      }
    }


    this.uniqueOptionCheckPassed = index === -1;
    this.nonEmptyOptionCheckPassed = !_.isEmpty(value);

    return this.uniqueOptionCheckPassed;
  }

  public classificationOnChange() {
    this.classificationHelpText = this.classificationHelpTextMap[this.fieldData.classificationUI];
  }

  public displaySingleSelectOptions() {
    return this.fieldData.dataTypeUI === this.$translate.instant('context.dictionary.dataTypes.enumString');
  }
}

export class FieldModalComponent implements ng.IComponentOptions {
  public controller = FieldModalCtrl;
  public templateUrl = 'modules/context/fields/modal/hybrid-context-field-modal.component.html';
  public bindings = {
    existingFieldIds: '<',
    existingFieldData: '<',
    callback: '<',
    dismiss: '&',
    hasContextExpandedTypesToggle: '<',
  };
}

export default angular
  .module('Context')
  .component('contextFieldModal', new FieldModalComponent());
