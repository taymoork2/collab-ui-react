import { Notification } from 'modules/core/notifications';
import { ContextFieldsetsService } from 'modules/context/services/context-fieldset-service';
import { ContextFieldsService } from 'modules/context/services/context-fields-service';
import { PropertyService, PropertyConstants } from 'modules/context/services/context-property-service';
import { Authinfo } from 'modules/core/scripts/services/authinfo';
import { FieldUtils } from 'modules/context/services/fieldUtils';

/**
 * Fieldset data structure
 */
interface IFieldsetData {
  id: string;
  description: string;
  fields: string[];
  inactiveFields: string[];
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

  public selectedFields: IFieldData[];        // Fields added to the fieldset
  public inactiveFields: IFieldData[];        // Fields marked inactive on Update
  public selectedField: string;               // Id for the field selected
  public allSelectableFields: IFieldData[];   // All Fields available for selection
  public fetchFailed: Boolean;                // Fetch status for loading all fields

  public createMode: Boolean;                  //whether the modal is for create or edit
  public existingFieldsetData: IFieldsetData;  //The fieldset passed in for edit

  public enableFieldsSelection: Boolean = false; //whether enable the fields selection
  public inUse: Boolean;                         // Fieldset in-use

  private maxFieldsPerFieldsetAllowed: number = PropertyConstants.MAX_FIELDS_PER_FIELDSET_DEFAULT_VALUE; //maximum fields per fieldset allowed

  /* @ngInject */
  constructor(
    protected $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
    private Analytics,
    protected ContextFieldsetsService: ContextFieldsetsService,
    protected ContextFieldsService: ContextFieldsService,
    protected Notification: Notification,
    protected PropertyService: PropertyService,
    protected Authinfo: Authinfo,
    private FieldUtils: FieldUtils,
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

    //check if it is create or eidt
    this.createMode = !Boolean(_.get(this.existingFieldsetData, 'id'));

    // Set initial fieldset data
    this.fieldsetData = this.createMode
     ? {
       id: '',
       description: '',
       fields: [],
       inactiveFields: [],
       publiclyAccessible: false,
       publiclyAccessibleUI: '',
     }
     //make a copy of the existing fieldset
     : _.cloneDeep(this.existingFieldsetData);

    // load existing fields
    this.loadFields()
      .then( () => {
        this.getMaxFieldsAllowed();
      });
  }

  public setFieldsSelection () {
    this.enableFieldsSelection = this.selectedFields.length < this.maxFieldsPerFieldsetAllowed;
  }

  /**
   * Get the maximum fields allowed value per org
   */
  public getMaxFieldsAllowed () {
    this.actionInProgress = true;
    return this.PropertyService.getProperty(PropertyConstants.MAX_FIELDS_PER_FIELDSET_PROP_NAME, this.Authinfo.getOrgId())
      .then(value => {
        this.maxFieldsPerFieldsetAllowed = value;
      })
      .catch( () => {
        this.fetchFailed = true;
        this.actionInProgress = false;
      })
      .then(() => {
        this.setFieldsSelection();
        this.actionInProgress = false;
        return this.maxFieldsPerFieldsetAllowed;
      });
  }

  /**
   * Load all fields for selection in typeahead
   */
  public loadFields() {
    this.actionInProgress = true;
    return this.ContextFieldsService.getFields()
      .then(data => {
        const allFields = this.processedFields(data);
        this.inactiveFields = this.getInactiveFields(allFields);
        this.selectedFields = this.getSelectedFields(allFields);
        this.allSelectableFields = this.getSelectableFields(allFields);
        this.sortFields(this.allSelectableFields);
      })
      .catch( err => {
        this.fetchFailed = true;
        this.actionInProgress = false;
        return this.$q.reject(err);
      });
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
    return this.ContextFieldsetsService.updateAndGetFieldset(this.fieldsetData)
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
      this.nextButtonEnabled() && this.selectedFields.length > 0);
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
    const value = viewValue || '';
    const regex = new RegExp(/^[0-9a-zA-Z-_.]*$/g);
    return regex.test(value);
  }

  /**
   * Returns true if the fieldset id doesn't match an existing fieldset id
   * @param viewValue is the new value for fieldset id
   * @returns {boolean}
   */
  public uniqueIdValidation(viewValue: string) {
    const value = viewValue || '';
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

      const classification = this.classificationMap[field.classification] || this.localizedStrings['unencrypted'];
      field.classification = classification;

      const dataType = this.FieldUtils.getDataType(field);
      const fieldInfo = `${dataType}, ${classification}`.trim();
      field.fieldInfo = fieldInfo;

      return field;
    });
  }

  /**
   * Searches the available selectedFields and returns the field list
   * @param fullFieldList
   * @returns {IFieldData[]}
   */
  private getSelectableFields(fullFieldList: IFieldData[]) {
    return _.difference(fullFieldList, this.selectedFields);
  }

  /**
   * Returns the list of selected selectedFields
   * @param fullFieldList
   * @returns {Object[]}
   */
  public getSelectedFields(fullFieldList: IFieldData[]) {
    const activeFields: string[] = _.difference(this.fieldsetData.fields, this.fieldsetData.inactiveFields);

    const selectedFields: IFieldData[] = [];
    // Not using lodash filter/includes because we have to maintain the order of selected fields.
    for (let i = 0; i < activeFields.length; i++) {
      for (let j = 0; j < fullFieldList.length; j++) {
        if (fullFieldList[j] && (fullFieldList[j].id === activeFields[i])) {
          selectedFields.push(fullFieldList[j]);
        }
      }
    }

    return selectedFields;
  }

  /**
   * Returns the list of inactiveField objects
   * @param fullFieldList
   * @returns {Object[]}
   */
  public getInactiveFields(fullFieldList: IFieldData[]) {
    // Filters the list of all fields by using id to matches the inactive fields
    const inactiveFields: any = _(fullFieldList).keyBy('id').at(this.fieldsetData.inactiveFields).value();
    return inactiveFields;
  }

  /**
   * On selecting a field adds it to the list of selected selectedFields for the fieldset and
   * removes it from the list of selectedFields available for selection
   * @param field
   */
  public selectField(field: IFieldData) {
    this.selectedField = '';
    this.selectedFields.push(field);

    // If it is in the inactive list, remove it from that list
    if (_.filter(this.inactiveFields, { id: field.id }).length > 0) {

      // remove this field from the inactiveFields
      _.pull(this.inactiveFields, field);
      _.pull(this.fieldsetData.inactiveFields, field.id);

      // To reset the order, remove it from the fields list and add it at the end.
      _.pull(this.fieldsetData.fields, field.id);
      this.fieldsetData.fields.push(field.id);

    } else {

      this.fieldsetData.fields.push(field.id);

    }

    _.pull(this.allSelectableFields, field);
    this.setFieldsSelection();
  }

  /**
   * Removes a field for the selected fields list and adds it to the list of fields available for selection.
   * If the fieldset is in-Use, the removed field will be added to the inactiveFields list
   * else, the removed field will be deleted from the fields list in the fieldset
   * @param field
   */
  public removeFieldFromList(field: IFieldData, form: ng.IFormController) {

    if (this.inUse) {

      _.pull(this.selectedFields, field);
      this.inactiveFields.push(field);
      this.fieldsetData.inactiveFields.push(field.id);

    } else {

      _.pull(this.selectedFields, field);
      _.pull(this.fieldsetData.fields, field.id);

    }

    this.allSelectableFields.push(field);
    this.sortFields(this.allSelectableFields);
    form.$setDirty();
    this.setFieldsSelection();
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
  public template = require('modules/context/fieldsets/modal/fieldset-modal.html');
  public bindings = {
    existingFieldsetIds: '<',
    existingFieldsetData: '<',
    inUse: '<',
    callback: '<',
    dismiss: '&',
  };
}

export default angular
  .module('Context')
  .component('contextFieldsetModal', new FieldsetModalComponent());
