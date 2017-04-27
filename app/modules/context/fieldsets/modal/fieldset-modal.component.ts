import { Notification } from 'modules/core/notifications';
import { ContextFieldsetsService } from 'modules/context/services/context-fieldset-service';
import { ContextFieldsService } from 'modules/context/services/context-fields-service';

/**
 * Fieldset data structure
 */
interface IFieldsetData {
  id: string;
  description: string;
  fields: string[];
  lastUpdated?: string;
  publiclyAccessible: Boolean;
  publiclyAccessibleUI: string;
}

/**
 * Field data structure
 */
interface IFieldData {
  id: string;
  description: string;
  classification: string;
  dataType: string;
  fieldInfo: string;
  publiclyAccessible: Boolean;
  translations: any;
  searchable: Boolean;
  refUrl: string;
  lastUpdated: string;
}

/**
 * FieldsetModalCtrl is the controllers for New/Edit operations on a fieldset.
 * This is the common controller used for all pages in the Modal Wizard to create/edit a fieldset.
 */
class FieldsetModalCtrl implements ng.IComponentController {

  public fieldsetData: IFieldsetData;         // Fieldset Data
  public existingFieldsetIds: string[];       // For duplicate Fieldset Id validation
  public validators: Object;                  // Validators for Fieldset Id
  public validationMessages: Object;          // Validation messages for Fieldset Id
  public callback: Function;                  // Callback from previous state on success
  public dismiss: Function;                   // Dismiss callback for modal dialog
  public isAttributesPage: boolean = true;    // Fieldset Attributes Page flag
  public actionInProgress: Boolean = false;   // Flag for API operation in progress: create fieldset or loading fields

  public localizedStrings: Object;            // Localized strings
  public classificationMap: Object;           // Map for field classfication

  public fields: IFieldData[];                // Fields added to the fieldset
  public selectedField: string;               // Id for the field selected
  public allSelectableFields: IFieldData[];   // All Fields available for selection
  public fetchFailed: Boolean;                // Fetch status for loading all fields

  public createMode: Boolean;                  //whether the modal is for create or edit
  public existingFieldsetData: IFieldsetData;  //The fieldset passed in for edit
  private publiclyAccessibleMap: Object;       //Map for publiclyAccessible

  /* @ngInject */
  constructor(
    protected $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
    private Analytics,
    protected ContextFieldsetsService: ContextFieldsetsService,
    protected ContextFieldsService: ContextFieldsService,
    protected Notification: Notification,
  ) {}

  /**
   * Initialize the controller
   * a) Setup initial fieldset data
   * b) Setup validation messages and validators
   * c) Setup localized strings
   * d) Load all fields for selection in typeahead
   */
  public $onInit() {

    // Setup validation messages and validators for field id
    this.validationMessages = {
      pattern: this.$translate.instant('context.dictionary.fieldsetPage.fieldsetIdInvalidCharactersError'),
      unique: this.$translate.instant('context.dictionary.fieldsetPage.fieldsetIdUniqueError'),
    };
    this.validators = {
      pattern: this.invalidCharactersValidation,
      unique: (value: string) => this.uniqueIdValidation(value),
    };

    // Setup other localized strings
    this.localizedStrings = {
      encrypted: this.$translate.instant('context.dictionary.fieldPage.encrypted'),
      unencrypted: this.$translate.instant('context.dictionary.fieldPage.unencrypted'),
      pii: this.$translate.instant('context.dictionary.fieldPage.piiEncrypted'),
    };
    this.classificationMap = {};
    this.classificationMap['ENCRYPTED'] = this.localizedStrings['encrypted'];
    this.classificationMap['UNENCRYPTED'] = this.localizedStrings['unencrypted'];
    this.classificationMap['PII'] = this.localizedStrings['pii'];

    //map publiclyAccessible to value that matches by api
    this.publiclyAccessibleMap = {};
    this.publiclyAccessibleMap[this.$translate.instant('context.dictionary.custom')] = false;
    this.publiclyAccessibleMap[this.$translate.instant('context.dictonary.cisco')] = true;

    //check if it is create or eidt
    this.createMode = !Boolean(_.get(this.existingFieldsetData, 'id'));

    // Set initial fieldset data
    this.fieldsetData = this.createMode
     ? {
       id: '',
       description: '',
       fields: [],
       publiclyAccessible: false,
       publiclyAccessibleUI: '',
     }
     //make a copy of the existing fieldset
     : _.cloneDeep(this.existingFieldsetData);

    // load existing fields
    this.loadFields();
  }

  /**
   * Load all fields for selection in typeahead
   */
  public loadFields() {
    this.actionInProgress = true;
    this.ContextFieldsService.getFields()
      .then(data => {
        let allFields = this.processedFields(data);
        this.fields = this.getSelectedFields(allFields);
        this.allSelectableFields = this.searchOnlyAvailableFields(allFields);
        this.sortFields(this.allSelectableFields);
        this.actionInProgress = false;
        this.fetchFailed = false;
      })
      .catch( err => {
        this.fetchFailed = true;
        this.actionInProgress = false;
        return this.$q.reject(err);
      });
  }

  public fixDataForApi() {
    this.fieldsetData.publiclyAccessible = this.publiclyAccessibleMap[this.fieldsetData.publiclyAccessibleUI];
    return this.fieldsetData;
  }

  /**
   * Create a new fieldset
   * @returns {Promise<R>}
   */
  public create() {
    this.actionInProgress = true;
    return this.ContextFieldsetsService.createAndGetFieldset(this.fieldsetData)
      .then(data => {
        // must call callback method to add newly created fieldset to fieldset list
        this.callback(data);
        this.dismiss();
        this.Notification.success('context.dictionary.fieldsetPage.fieldsetCreateSuccess');
        this.Analytics.trackEvent(this.Analytics.sections.CONTEXT.eventNames.CONTEXT_CREATE_FIELDSET_SUCCESS);
      }).catch(() => {
        this.Notification.error('context.dictionary.fieldsetPage.fieldsetCreateFailure');
        this.Analytics.trackEvent(this.Analytics.sections.CONTEXT.eventNames.CONTEXT_CREATE_FIELDSET_FAILURE);
      }).then(() => {
        this.actionInProgress = false;
      });
  }

  public update () {
    this.actionInProgress = true;
    return this.ContextFieldsetsService.updateAndGetFieldset(this.fixDataForApi())
      .then(data => {
        this.fieldsetData = _.cloneDeep(data);
        this.callback(this.fieldsetData);
        this.Notification.success('context.dictionary.fieldsetPage.fieldsetUpdateSuccess');
        this.Analytics.trackEvent(this.Analytics.sections.CONTEXT.eventNames.CONTEXT_UPDATE_FIELDSET_SUCCESS);
      }).catch(() => {
        this.Notification.error('context.dictionary.fieldsetPage.fieldsetUpdateFailure');
        this.Analytics.trackEvent(this.Analytics.sections.CONTEXT.eventNames.CONTEXT_UPDATE_FIELDSET_FAILURE);
      }).then(() => {
        this.actionInProgress = false;
      });
  }

  /**
   * Checks if the conditions to enable Create/Save button are satisfied or not
   * a) No other action is in progress i.e. another Create or Load Fields
   * b) Fieldset Id validation passes and
   * c) At least one field is added to the fieldset
   * @returns {Boolean}
   */
  public createOrSaveButtonEnabled() {
    return Boolean(!this.actionInProgress &&
      this.nextButtonEnabled() && this.fieldsetData.fields.length > 0);
  }

  /**
   * Returns true if no action is in progress fieldset Id validation passes
   * a) Fieldset id doesn't contain invalid characters
   * b) Fieldset id isn't the same as an existing fieldset id.
   * @returns {Boolean}
   */
  public nextButtonEnabled() {
    return Boolean(this.fieldsetData.id &&
      this.invalidCharactersValidation(this.fieldsetData.id) &&
      this.uniqueIdValidation(this.fieldsetData.id));
  }

  /**
   * Returns true if the fieldset id contains valid characters
   * Valid characters are numbers 0 to 9, alphabets a to z or A to Z, dash, underscore and period.
   * @param viewValue is the new value for fieldset id
   * @returns {boolean}
   */
  public invalidCharactersValidation(viewValue: string) {
    let value = viewValue || '';
    let regex = new RegExp(/^[0-9a-zA-Z-_.]*$/g);
    return regex.test(value);
  }

  /**
   * Returns true if the fieldset id doesn't match an existing fieldset id
   * @param viewValue is the new value for fieldset id
   * @returns {boolean}
   */
  public uniqueIdValidation(viewValue: string) {
    let value = viewValue || '';
    return this.existingFieldsetIds.indexOf(value) === -1;
  }

  /**
   * Switches between the pages of the wizard
   * @param pageNumber
   */
  public switchToPage(pageNumber: number) {
    if (pageNumber === 2) {
      this.isAttributesPage = false;
    } else {
      this.isAttributesPage = true;
    }
  }

  /**
   * Processes Fields by setting the fieldInfo on the field object
   * fieldInfo consists of a comma separated list of the field classification and the dataType
   * @param unprocessedFields
   */
  public processedFields(unprocessedFields: IFieldData[]) {

    return _.map(unprocessedFields, (field: IFieldData) => {

      let fieldInfo = this.classificationMap[field.classification] || this.localizedStrings['unencrypted'];
      field.classification = fieldInfo;

      if (field.dataType) {
        field.dataType = _.upperFirst(field.dataType.trim());
        fieldInfo += `, ${field.dataType}`;
      }
      field.fieldInfo = fieldInfo.trim();

      return field;
    });
  }

  /**
   * Searches the available fields and returns the field list
   * @param fullFieldList
   * @returns {IFieldData[]}
   */
  private searchOnlyAvailableFields(fullFieldList: IFieldData[]) {
    for (let i = fullFieldList.length - 1; i >= 0; i--) {
      for (let j = 0; j < this.fieldsetData.fields.length; j++) {
        if (fullFieldList[i] && (fullFieldList[i].id === this.fieldsetData.fields[j])) {
          fullFieldList.splice(i, 1);
        }
      }
    }
    return fullFieldList;
  }

  /**
   * Returns the list of selected fields
   * @param fullFieldList
   * @returns {Object[]}
   */
  public getSelectedFields(fullFieldList: IFieldData[]) {
    let selectedFields: IFieldData[] = [];
    for (let i = fullFieldList.length - 1; i >= 0; i--) {
      for (let j = 0; j < this.fieldsetData.fields.length; j++) {
        if (fullFieldList[i] && (fullFieldList[i].id === this.fieldsetData.fields[j])) {
          selectedFields.push(fullFieldList[i]);
        }
      }
    }
    this.sortFields(selectedFields);
    return selectedFields;
  }

  /**
   * On selecting a field adds it to the list of selected fields for the fieldset and
   * removes it from the list of fields available for selection
   * @param field
   */
  public selectField(field: IFieldData) {
    this.selectedField = '';
    this.fields.push(field);
    this.fieldsetData.fields.push(field.id);
    _.pull(this.allSelectableFields, field);
  }

  /**
   * Removes a field for the selected fields list and adds it to the list of fields available for selection.
   * @param field
   */
  public removeFieldFromList(field: IFieldData, form: ng.IFormController) {
    _.pull(this.fields, field);
    _.pull(this.fieldsetData.fields, field.id);
    this.allSelectableFields.push(field);
    this.sortFields(this.allSelectableFields);
    form.$setDirty();
  }

  /**
   * Sorts all selectable fields so that they appear sorted in the typeahead list as we remove and add selectable fields
   */
  private sortFields(fields: IFieldData[]) {
    fields.sort(function (field1: IFieldData, field2: IFieldData) {
      return (field1.id > field2.id) ? 1 : -1;
    });
  }

}

/**
 * Fieldset Modal dialog Component used for Creating and Editing a fieldset
 */
export class FieldsetModalComponent implements ng.IComponentOptions {
  public controller = FieldsetModalCtrl;
  public templateUrl = 'modules/context/fieldsets/modal/fieldset-modal.html';
  public bindings = {
    existingFieldsetIds: '<',
    existingFieldsetData: '<',
    callback: '<',
    dismiss: '&',
  };
}

export default angular
  .module('Context')
  .component('contextFieldsetModal', new FieldsetModalComponent());
