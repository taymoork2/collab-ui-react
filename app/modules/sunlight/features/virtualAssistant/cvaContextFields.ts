import { ContextFieldsetsService } from 'modules/context/services/context-fieldset-service';
import { ContextFieldsService } from 'modules/context/services/context-fields-service';
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
 *  Establishes CS fields to Dialogflow context input association
 */
interface IContextAssociationData {
  contextFieldId: string;
  contextAssociation: string;
}

/**
 * Object to wrap functionality around retrieving Context Services fields, presenting them for selection, then allowing for
 * association with Dialogflow input context. The data is stored/retrieved through CVA config API.
 * This object is used by cvaSetup.component.ts.
 */
export class CvaContextFields {
  protected associatedFields: IContextAssociationData[] = [];

  protected selectedFields: IFieldData[] = [];         // Fields already selected
  protected allSelectableFields: IFieldData[] = [];    // Fields available for selection
  protected selectedField: string = '';                // Id for the field selected

  private fetchFailed: boolean = false;                // Fetch status for loading all fields

  private localizedStrings: Object;            // Localized strings
  private classificationMap: Object;           // Map for field classfication

  private formErrors: Object = {};

  private MAX_INPUT_LENGTH: number = 50;
  private MAX_SELECTION_SET: number = 20; //maximum fields
  private CUSTOMER_FIELDSET: string = 'cisco.base.customer';

  protected ERROR_TYPES = Object.freeze({
    ERROR_MAX_LENGTH: 'errorMaxContextLength',
    ERROR_MIN_LENGTH: 'errorMinContextLength',
    ERROR_INVALID_VALUE: 'errorInvalidCharacters',
    ERROR_NONE: 'none',
  });

  /* @ngInject */
  constructor(
    protected ContextFieldsetsService: ContextFieldsetsService,
    protected ContextFieldsService: ContextFieldsService,
    private $translate: ng.translate.ITranslateService,
    private FieldUtils: FieldUtils,
    protected $q: ng.IQService,
  ) {}

  /**
   *  Initialize this object, which includes loading fields to memory
   *
   * @param storedFields
   * @returns {any}
   */
  public init(storedFields: any) {

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

    return this.loadFields(storedFields);
  }

  /**
   *  Returns object containing map of CS field to Dialogflow input context.
   *  Note: the object expected by CVA is in format: { key1: value1, key2: value2, ... }, where the 'key' element
   *  is from contextFieldId, and the 'value' is from contextAssociation.
   * @returns {{}}
   */
  public getContextServiceFieldsObject() {
    const fields = {};
    this.associatedFields.forEach((entry) => {
      fields[entry.contextFieldId] = entry.contextAssociation;
    });
    return fields;
  }

  /**
   * Verifies all entries in the form are ok (used to enable for next screen).
   * @returns {boolean}
   */
  public isFormValid(): boolean {
    for (const key in this.formErrors) {
      if (this.isLineError(key)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Load customer fields for selection in typeahead
   */
  public loadFields(storedFields: any) {
    // Convert from object (originated from CVA in format 'key:value') to array of IContextAssociationData.
    // The array is needed for the type-ahead functionality in cvaContextFields.tpl.html.
    if (storedFields && this.associatedFields.length === 0) {
      Object.keys(storedFields).forEach((key) => {
        const associated: IContextAssociationData = {
          contextFieldId: key,
          contextAssociation: storedFields[key],
        };
        this.associatedFields.push(associated);
      });
    }
    return this.fetchData();
  }

  /**
   *  Performs the actual load of the data and preparation within individual lists: selected and selectable.
   *  Called by exposed method: loadFields() or Retry button (see .tpl.html).
   * @returns {any}
   */
  protected fetchData() {
    return this.ContextFieldsetsService.getFieldset(this.CUSTOMER_FIELDSET)
      .then(fieldset => {
        return this.ContextFieldsService.getFields()
          .then(data => {
            const allFields = this.processedFields(data);
            this.selectedFields = this.getSelectedFields(allFields, this.associatedFields);
            this.allSelectableFields = this.getSelectableFields(fieldset, allFields);
            this.fetchFailed = false;
          })
          .catch(err => {
            this.fetchFailed = true;
            return this.$q.reject(err);
          });
      })
      .catch(err => {
        this.fetchFailed = true;
        return this.$q.reject(err);
      });
  }

  /**
   *  Verify if this inputed value is valid, and if not already listed on other entry.
   * @param {IContextAssociationData} field
   * @returns {string} error code (used by UT)
   */
  protected validateInput(field: IContextAssociationData) {
    const value = field.contextAssociation;

    let thisEntryError = this.ERROR_TYPES.ERROR_NONE;
    if (!value) {
      thisEntryError = this.ERROR_TYPES.ERROR_MIN_LENGTH;
    } else if (!this.charactersValidation(value)) {
      thisEntryError = this.ERROR_TYPES.ERROR_INVALID_VALUE;
    } else if (value.length > this.MAX_INPUT_LENGTH) {
      thisEntryError = this.ERROR_TYPES.ERROR_MAX_LENGTH;
    }
    this.formErrors[field.contextFieldId] = thisEntryError;
    return thisEntryError;
  }

  /**
   *  Is there an error associated with this entry?
   * @param {string} id
   * @returns {boolean}
   */
  protected isLineError(id: string): boolean {
    return this.formErrors[id] &&
      this.formErrors[id] !== this.ERROR_TYPES.ERROR_NONE;
  }

  /**
   *  Obtaint the error code associated with this entry.
   * @param {string} id
   * @returns {string} error code
   */
  protected getLineError(id: string): string {
    return this.formErrors[id];
  }

  /**
   *  Is form enabled for selection?
   * @returns {boolean}
   */
  protected isEnableFieldSelection(): boolean {
    return !this.noMoreFields() && !this.isLoadFailure() && !this.isMaxFields();
  }

  /**
   *  Has load succeeded, but no fields available?
   * @returns {boolean}
   */
  protected noMoreFields(): boolean {
    return this.allSelectableFields.length === 0 && !this.fetchFailed;
  }

  /**
   *  Is there a match on selectable fields?
   * @returns {boolean}
   */
  protected noMatches(): boolean {
    if (!this.noMoreFields() && this.selectedField && this.selectedField.length > 0) {
      return _.findIndex(this.allSelectableFields, ((field) => field.id.toLowerCase().indexOf(this.selectedField.toLowerCase()) >= 0)) < 0;
    }
    return false;
  }

  protected isMaxFields(): boolean {
    return this.selectedFields.length > this.MAX_SELECTION_SET;
  }

  /**
   *  Has load of data to form failed?
   * @returns {boolean}
   */
  protected isLoadFailure(): boolean {
    return this.allSelectableFields.length === 0 && this.fetchFailed;
  }

  /**
   * Returns true if string contains valid characters
   * Valid characters are numbers 0 to 9, alphabets a to z or A to Z, dash, underscore and period.
   * @param viewValue is the new value for fieldset id
   * @returns {boolean}
   */
  private charactersValidation(viewValue: string) {
    const value = viewValue || '';
    const regex = new RegExp(/^[0-9a-zA-Z-_.]*$/g);
    return regex.test(value);
  }

  /**
   * Processes Fields by setting the fieldInfo on the field object
   * fieldInfo consists of a comma separated list of the field classification and the dataType
   * @param unprocessedFields
   */
  private processedFields(unprocessedFields: IFieldData[]) {

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
  private getSelectableFields(fieldset: IFieldsetData, fullFieldList: IFieldData[]) {
    const notSelected = _.difference(fullFieldList, this.selectedFields);
    this.sortFields(notSelected);

    const fieldsFromFieldset = fieldset.fields;
    fieldsFromFieldset.sort();

    return _.intersectionWith(notSelected, fieldsFromFieldset, (field1, field2) => field1.id === field2);
  }

  /**
   * Populates the list of selected fields based on data from activeFields (from CVA, in this case)
   * @param fullFieldList
   * @returns {Object[]}
   */
  private getSelectedFields(fullFieldList: IFieldData[], activeFields: IContextAssociationData[]) {
    return _.intersectionWith(fullFieldList, activeFields, (field1, field2) => field1.id === field2.contextFieldId);
  }

  /**
   * Removes a field for the selected fields list and adds it to the list of fields available for selection.
   * @param field
   */
  protected removeFieldFromList(field: IContextAssociationData, form: ng.IFormController) {

    _.pull(this.associatedFields, field);

    // Take from selected list to selectable list
    const fieldData = this.removeFromSelectedFields(field);
    if (fieldData) {
      this.allSelectableFields.push(fieldData);
    }

    // Remove any errors associated with this field
    delete this.formErrors[field.contextFieldId];

    // Sort selectable for presentation
    this.sortFields(this.allSelectableFields);
    form.$setDirty();
  }

   /**
    * Selecting a field adds it to the list of selectedFields and removes from list of selectable fields.
    * @param field
    */
  protected selectField(field: IFieldData) {
    this.selectedField = '';

    this.selectedFields.push(field);
    _.pull(this.allSelectableFields, field);

    const associated: IContextAssociationData = {
      contextFieldId: field.id,
      contextAssociation: field.id,
    };
    this.associatedFields.push(associated);
  }

  /**
   * Remove, by ID, from selectedFields list and return the removed value
   * @param {IContextAssociationData} entry
   * @returns {any}
   */
  private removeFromSelectedFields(entry: IContextAssociationData) {
    let removed;
    for (let i = 0; i < this.selectedFields.length && !removed; i++) {
      if (this.selectedFields[i].id === entry.contextFieldId) {
        const spliced = this.selectedFields.splice(i, 1);
        removed = spliced[0];
      }
    }
    return removed;
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
