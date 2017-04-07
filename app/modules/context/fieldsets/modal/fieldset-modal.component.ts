import { Notification } from 'modules/core/notifications';
import { ContextFieldsetsService } from 'modules/context/services/context-fieldset-service';

interface IFieldsetData {
  id: string;
  description: string;
  fields: string[];
  translations: Object;
}

class FieldsetModalCtrl implements ng.IComponentController {

  public existingFieldsetIds: string[];
  public fieldsetData: IFieldsetData;
  public validators: Object;
  public validationMessages: Object;
  public createCallback: Function;
  public dismiss: Function;

  public actionInProgress: Boolean = false;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private Analytics,
    protected ContextFieldsetsService: ContextFieldsetsService,
    protected Notification: Notification,
  ) {}

  public $onInit() {
    this.fieldsetData = {
      id: '',
      description: '',
      // TO DO - Use real fields instead of hard coded field id in the next user-story
      fields: ['Context_First_Name'],
      translations: {},
    };

    this.validationMessages = {
      pattern: this.$translate.instant('context.dictionary.fieldsetPage.fieldsetIdInvalidCharactersError'),
      unique: this.$translate.instant('context.dictionary.fieldsetPage.fieldsetIdUniqueError'),
    };

    this.validators = {
      pattern: this.invalidCharactersValidation,
      unique: (value: string) => this.uniqueIdValidation(value),
    };
  }

  public create() {
    this.actionInProgress = true;
    return this.ContextFieldsetsService.createAndGetFieldset(this.fieldsetData)
      .then(data => {
        // must call callback method to add newly created fieldset to fieldset list
        this.createCallback(data);
        this.dismiss();
        this.Notification.success('context.dictionary.fieldsetPage.fieldsetCreateSuccess');
        this.Analytics.trackEvent(this.Analytics.sections.CONTEXT.eventNames.CONTEXT_CREATE_FIELDSET_SUCCESS);
      }).catch(function () {
        this.Notification.error('context.dictionary.fieldsetPage.fieldsetCreateFailure');
        this.Analytics.trackEvent(this.Analytics.sections.CONTEXT.eventNames.CONTEXT_CREATE_FIELDSET_FAILURE);
      }).then(() => {
        this.actionInProgress = false;
      });
  }

  public buttonEnabled() {
    return Boolean(!this.actionInProgress &&
      this.fieldsetData.id &&
      this.invalidCharactersValidation(this.fieldsetData.id) &&
      this.uniqueIdValidation(this.fieldsetData.id));
  }

  public invalidCharactersValidation(viewValue: string) {
    let value = viewValue || '';
    let regex = new RegExp(/^[0-9a-zA-Z-_.]*$/g);
    return regex.test(value);
  }

  public uniqueIdValidation(viewValue: string) {
    let value = viewValue || '';
    return this.existingFieldsetIds.indexOf(value) === -1;
  }

}

export class FieldsetModalComponent implements ng.IComponentOptions {
  public controller = FieldsetModalCtrl;
  public templateUrl = 'modules/context/fieldsets/modal/fieldset-modal.html';
  public bindings = {
    existingFieldsetIds: '<',
    createCallback: '<',
    dismiss: '&',
  };
}

export default angular
  .module('Context')
  .component('contextFieldsetModal', new FieldsetModalComponent());
