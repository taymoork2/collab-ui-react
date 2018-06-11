import IDataTypeDefinition, { ITranslationDictionary } from 'modules/context/fields/dataTypeDefinition';
import { ContextFieldsService } from 'modules/context/services/context-fields-service';
import { FieldUtils } from 'modules/context/services/fieldUtils';
import { Notification } from 'modules/core/notifications';
import { IActionItem } from 'modules/core/shared/section-title/section-title.component';

type DataDisplay = { label: string, value: string };

interface IFieldData {
  id: string;
  description: string;
  classification: string;
  classificationUI: string;
  dataType: string;
  dataTypeDefinition?: IDataTypeDefinition;
  defaultValue?: any;
  dataTypeUI: string; // use is deprecated in this controller
  dataTypeValue: DataDisplay;
  translations: any;
  searchable: Boolean;
  lastUpdated?: string;
  publiclyAccessibleUI: string;
  publiclyAccessible: Boolean;
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

  private classificationApiMap: Object;
  private classificationHelpTextMap: Object;

  public dataTypeOptions: DataDisplay[];
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
  public dataTypeDefinition: IDataTypeDefinition;

  public optionsList: IOption[] = [];
  public optionsListCopy: IOption[] = [];
  public optionReorderListCopy: IOption[] = [];
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
  public inactiveOptionsList: IOption[] = [];
  public existingFieldOptionsList: IOption[] = [];
  public firstReordering: boolean = true;
  public ENUM: string = 'enum';

  public actionList: IActionItem[];
  public actionListCopy: IActionItem[] = [];

  private inUse: boolean;

  /* @ngInject */
  constructor(
    private Analytics,
    private $translate: ng.translate.ITranslateService,
    private $timeout: ng.ITimeoutService,
    private FieldUtils: FieldUtils,
    protected Notification: Notification,
    protected ContextFieldsService: ContextFieldsService,
    protected dragularService,
    protected $scope,
  ) {}

  public $onInit() {
    this.$scope.forms = {};
    this.unencrypted = this.$translate.instant('context.dictionary.fieldPage.unencrypted');
    this.encrypted = this.$translate.instant('context.dictionary.fieldPage.encrypted');
    this.pii = this.$translate.instant('context.dictionary.fieldPage.piiEncrypted');

    this.defaultClassification = this.encrypted;

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

    const selectionTypes = this.FieldUtils.supportedUiTypes();

    // set up the options and placeholder for dataType
    this.dataTypeOptions = _.map(selectionTypes,
      (selectionType) => {
        return {
          label: this.$translate.instant(this.FieldUtils.getTypeConstant(selectionType)),
          value: selectionType,
        };
      });

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
    this.inUse = this.inUse && !this.createMode; // just in case somebody passes in-use=true _and_ create-mode=true

    if (this.createMode) {
      this.fieldData = {
        id: '',
        description: '',
        classification: '',
        classificationUI: this.defaultClassification,
        dataType: '',
        dataTypeUI: '',
        dataTypeValue: { label: '', value: '' },
        translations: {
          en_US: '',
        },
        searchable: false,
        publiclyAccessible: false,
        publiclyAccessibleUI: '',
      };
    } else {
      // make a copy to that changes to data isn't reflected in side panel as
      // new data is entered by user
      this.fieldData = _.cloneDeep(this.existingFieldData);

      // then update the dataTypeValue
      this.fieldData.dataTypeValue = {
        label: this.FieldUtils.getDataType(this.fieldData),
        value: this.FieldUtils.getDataTypeBase(this.fieldData),
      };
    }

    //copy the enum field options to the optionsList
    if (this.fieldData.dataTypeDefinition) {
      if (this.fieldData.dataTypeDefinition.enumerations) {
        //remove the inactiveOptions from the enumeration for UI display
        let activeEnumsList: string[] = [];
        if (this.fieldData.dataTypeDefinition.inactiveEnumerations) {
          activeEnumsList = _.difference(this.fieldData.dataTypeDefinition.enumerations, this.fieldData.dataTypeDefinition.inactiveEnumerations);
          this.inactiveOptionsList = this.getOptionsListFromEnumerations(this.fieldData.dataTypeDefinition.inactiveEnumerations);
        } else {
          activeEnumsList = _.cloneDeep(this.fieldData.dataTypeDefinition.enumerations);
        }

        this.optionsList = this.getOptionsListFromEnumerations(activeEnumsList);
        this.optionsListCopy = _.cloneDeep(this.optionsList);
        this.existingFieldOptionsList = _.cloneDeep(this.optionsList);
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
      actionKey: 'context.dictionary.fieldPage.enumOptionsReorder',
      actionFunction: this.setReorder.bind(this),
    });

    this.actionListCopy.push({
      actionKey: 'context.dictionary.fieldPage.enumOptionsSetDefault',
      actionFunction: this.setDefault.bind(this),
    });

    //set the actions
    if (this.optionsListCopy) {
      this.resetActionList();
    }
  }

  private getOptionsListFromEnumerations(list: string[]) {
    let optionsList: IOption[] = [];
    optionsList = _.map(list, (enumeration, index) => {
      return {
        value: enumeration,
        index: index,
        edit: false,
      };
    });

    return optionsList;
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
      actionKey: 'context.dictionary.fieldPage.enumOptionsRemoveDefault',
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

    //keep a copy of the original list for later cancel
    if (this.optionReorderListCopy) {
      this.optionReorderListCopy.length = 0;
    }
    Array.prototype.push.apply(this.optionReorderListCopy, _.cloneDeep(this.optionsListCopy));

    if (this.firstReordering) {
      this.firstReordering = false;
      this.dragularService('#optionList', {
        classes: {
          transit: 'options-reorder-transit',
        },
        containersModel: [this.optionsListCopy],
        moves: () => {
          return this.reorderEnumOptions;
        },
      });
    }
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

  private resetActionList(): void {
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

    //update the inactiveOptionsList if the newValue is new value is marked inactive
    if (!this.createMode) {
      _.remove(this.inactiveOptionsList, deleteOption => {
        return deleteOption.value === option.value;
      });
    }

    this.updateDataTypeDefinition(this.optionsList);
    this.optionsListCopy.length = 0;
    Array.prototype.push.apply(this.optionsListCopy, _.cloneDeep(this.optionsList));
    this.optionRadios = this.getOptionRadioList();
    this.resetActionList();
  }

  public updateDataTypeDefinition(list: IOption[]) {
    //update the dataTypeDefintion of fieldData
    const dataTypeDefintion: IDataTypeDefinition = {
      type: this.ENUM,
    };

    //combine with inactiveOptionsList
    if (!this.createMode) {
      list = _.concat(list, this.inactiveOptionsList);
    }

    const enumerations = _.map(list, option => {
      return option.value;
    });

    const inactiveEnumerations = _.map(this.inactiveOptionsList, option => {
      return option.value;
    });

    dataTypeDefintion.enumerations = enumerations;
    dataTypeDefintion.translations = {
      en_US: enumerations,
    };
    dataTypeDefintion.inactiveEnumerations = inactiveEnumerations;

    this.fieldData.dataTypeDefinition = dataTypeDefintion;
  }

  private isExistingOption(option: IOption) {
    const index =  _.findIndex(this.existingFieldOptionsList, existingOption => {
      return existingOption.value === option.value;
    });
    return index !== -1;
  }

  public deleteOption(option, form: ng.IFormController): void {
    _.remove(this.optionsList, function (current) {
      return current.index === option.index;
    });

    if (!this.createMode && this.isExistingOption(option)) {
      this.inactiveOptionsList = _.concat(this.inactiveOptionsList, option);
    }

    this.updateIndex(option.index);
    this.updateDataTypeDefinition(this.optionsList);
    this.optionsListCopy.length = 0;
    Array.prototype.push.apply(this.optionsListCopy, this.optionsList);
    this.optionRadios = this.getOptionRadioList();

    //remove "Remove default" from action list and update the defaultValue
    if (this.isDefaultOption(option)) {
      this.defaultOption = '';
      this.actionList.pop();
      this.fieldData.defaultValue = undefined;
    }

    this.resetActionList();
    form.$setDirty();
  }

  private updateIndex(removedIndex: number): void {
    _.each(this.optionsList, function(option) {
      if (option.index > removedIndex) {
        option.index = option.index - 1;
      }
    });
  }

  public saveOptionsList(form: ng.IFormController): void {
    if (this.reorderEnumOptions) {
      this.updateDataTypeDefinition(this.optionsListCopy);
      this.optionsList.length = 0;
      Array.prototype.push.apply(this.optionsList, _.cloneDeep(this.optionsListCopy));
      this.reorderEnumOptions = false;
      this.optionReorderListCopy = [];
      this.optionRadios = this.getOptionRadioList();
    } else if (this.setDefaultEnumOption) {
      this.setDefaultEnumOption = false;
      this.fieldData.defaultValue = this.defaultOption;
    }
    form.$setDirty();
    this.resetActionList();
  }

  private updateActionList(): void {
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
    this.uniqueOptionCheckPassed = true;
    this.nonEmptyOptionCheckPassed = true;
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
    this.uniqueOptionCheckPassed = true;
    this.nonEmptyOptionCheckPassed = true;
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

    if (this.reorderEnumOptions) {
      if (this.optionReorderListCopy) {
        this.optionsListCopy.length = 0;
        Array.prototype.push.apply(this.optionsListCopy, _.cloneDeep(this.optionReorderListCopy));
      }
    }
    this.reorderEnumOptions = false;
    this.setDefaultEnumOption = false;

    this.resetActionList();
  }

  public isMinimumOptionsSet(): boolean {
    return (this.optionsListCopy.length >= 2);
  }

  private isNotInSingleSelectEditingMode(): boolean {
    return !this.addEnumOption
      && !this.editingOption
      && !this.reorderEnumOptions
      && !this.setDefaultEnumOption;
  }

  private isEnum(): boolean {
    return this.fieldData.dataTypeValue.value === 'enumString';
  }

  public isSingleSelectCheckPassed(): boolean {
    if (this.isEnum()) {
      return this.isMinimumOptionsSet() && this.uniqueOptionCheckPassed && this.nonEmptyOptionCheckPassed && this.isNotInSingleSelectEditingMode();
    }

    return true;
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
      this.fieldData.dataTypeValue.value &&
      this.fieldData.classificationUI &&
      this.isSingleSelectCheckPassed());
  }

  public saveOptionButtonEnabled() {
    return Boolean(this.uniqueOptionCheckPassed &&
      this.nonEmptyOptionCheckPassed);
  }

  private fixEnumDataTypeDefinitionForSave(definition: IDataTypeDefinition) {

    if (this.inUse) {
      // it's in use, so we don't have to do anything special here
      return;
    }

    const enumerations = definition.enumerations;

    if (!enumerations) {
      throw new Error('invalid dataTypeDefinition');
    }

    const inactiveEnumerations = definition.inactiveEnumerations;
    if (!inactiveEnumerations) {
      // nothing to see here
      return;
    }

    // iterate over all inactive enums
    _.forEach(inactiveEnumerations, inactive => {
      // get this one's index in the array
      const index = enumerations.indexOf(inactive);
      // remove this one from all translations
      const translations: ITranslationDictionary = _.get(definition, 'translations', {});

      // iterate over all translation languages
      _.forEach(_.keys(translations), language => {
        const translationStrings = translations[language];
        if (translationStrings !== enumerations) { // en_US actually points to enumerations for now!
          // remove the transation at this index. THIS WILL PROBABLY BREAK IF TRANSLATIONS AREN'T BEING MAINTAINED PROPERLY!
          translationStrings.splice(index, 1);
        }
      });
      // now remove all inactive from enumerations
      enumerations.splice(index, 1);
    });
    definition.inactiveEnumerations = undefined;
  }

  public fixDataForApi() {
    this.fieldData.dataType = this
      .FieldUtils
      .getApiDataTypeFromSelection(this.fieldData.dataTypeValue.value);

    this.fieldData.classification = this.classificationApiMap[this.fieldData.classificationUI];

    if (!this.isEnum()) {
      this.fieldData.dataTypeDefinition = undefined;
      this.fieldData.defaultValue = undefined;
    } else {
      if (_.isEmpty(this.defaultOption)) {
        this.fieldData.defaultValue = undefined;
      }

      if (!this.fieldData.dataTypeDefinition || !this.fieldData.dataTypeDefinition.enumerations) {
        throw new Error('invalid dataTypeDefinition');
      }

      this.fixEnumDataTypeDefinitionForSave(this.fieldData.dataTypeDefinition);
    }

    return this.fieldData;
  }

  public invalidCharactersValidation(viewValue: string) {
    const value = viewValue || '';
    const regex = new RegExp(/^[0-9a-zA-Z-_]*$/g);
    return regex.test(value);
  }

  public uniqueIdValidation(viewValue: string) {
    const value = viewValue || '';
    return !this.createMode || this.existingFieldIds.indexOf(value) === -1;
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
    return this.isEnum();
  }

  public isDisabledWhenInUse() {
    return !this.createMode && this.inUse;
  }
}

export class FieldModalComponent implements ng.IComponentOptions {
  public controller = FieldModalCtrl;
  public template = require('modules/context/fields/modal/hybrid-context-field-modal.component.html');
  public bindings = {
    existingFieldIds: '<',
    existingFieldData: '<',
    callback: '<',
    dismiss: '&',
    inUse: '<',
  };
}

export default angular
  .module('Context')
  .component('contextFieldModal', new FieldModalComponent());

