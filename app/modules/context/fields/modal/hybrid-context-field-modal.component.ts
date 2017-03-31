require('./_field-modal.scss');
import { Notification } from 'modules/core/notifications';
import { ContextFieldsService } from 'modules/context/services/context-fields-service';

interface IFieldData {
  id: string;
  description: string;
  classification: string;
  dataType: string;
  translations: any;
  searchable: Boolean;
}

class FieldModalCtrl implements ng.IComponentController {
  private unencrypted: string;
  private encrypted: string;
  private pii: string;

  private defaultClassification: string;

  private dataTypeApiMap: Object;
  private classificationApiMap: Object;
  private classificationHelpTextMap: Object;

  public dataTypeOptions: string[];
  public dataTypePlaceholder: string;
  public classificationOptions: string[];
  public classificationHelpText: string;

  public actionInProgress: Boolean = false;

  public existingFieldIds: string[];
  public validators: Object;
  public validationMessages: Object;
  public callback: Function;
  public dismiss: Function;
  public fieldData: IFieldData;

  /* @ngInject */
  constructor(
    private Analytics,
    private $translate: ng.translate.ITranslateService,
    protected Notification: Notification,
    protected ContextFieldsService: ContextFieldsService,
  ) {}

  public $onInit() {
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

    // set up the options and placeholder for dataType
    this.dataTypeOptions = _.keys(this.dataTypeApiMap);
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

    this.fieldData = {
      id: '',
      description: '',
      classification: this.defaultClassification,
      dataType: '',
      translations: {
        en_US: '',
      },
      searchable: false,
    };
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

  public buttonEnabled() {
    return Boolean(!this.actionInProgress &&
      this.fieldData.id &&
      this.invalidCharactersValidation(this.fieldData.id) &&
      this.uniqueIdValidation(this.fieldData.id) &&
      this.fieldData.translations.en_US &&
      this.fieldData.dataType);
  }

  public fixDataForApi() {
    const fieldCopy = _.cloneDeep(this.fieldData);
    fieldCopy.dataType = this.dataTypeApiMap[fieldCopy.dataType];
    fieldCopy.classification = this.classificationApiMap[fieldCopy.classification];
    return fieldCopy;
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

  public classificationOnChange() {
    this.classificationHelpText = this.classificationHelpTextMap[this.fieldData.classification];
  }
}

export class FieldModalComponent implements ng.IComponentOptions {
  public controller = FieldModalCtrl;
  public templateUrl = 'modules/context/fields/modal/hybrid-context-field-modal.component.html';
  public bindings = {
    existingFieldIds: '<',
    callback: '<',
    dismiss: '&',
  };
}

export default angular
  .module('Context')
  .component('contextFieldModal', new FieldModalComponent());
