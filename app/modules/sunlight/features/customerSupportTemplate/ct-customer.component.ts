import { CtBaseController } from './ctBase.controller';
import { MediaTypes } from './factory/ctCustomerSupportClasses';
import { KeyCodes } from 'modules/core/accessibility/accessibility.service';
import { CTService } from './services/CTService';
import { TemplateWizardService } from './services/TemplateWizard.service';
class CtCustomerController extends CtBaseController {

  /* @ngInject*/
  constructor(
    public $stateParams: ng.ui.IStateParamsService,
    public CTService: CTService,
    public $translate: ng.translate.ITranslateService,
    public TemplateWizardService: TemplateWizardService,
  ) {

    super($stateParams, TemplateWizardService, CTService, $translate);
    this.TemplateWizardService.setCardMode(this.cardMode);
  }

  public cardMode: string;
  public MediaTypes;
  public activeItem: string;
  public isTypeDuplicate = false;
  public categoryOptionTag: string = '';
  public categoryField: string = 'category';
  public FieldValue = 'value';
  public idField = 'id';
  public optionalValue = 'optional';
  public requiredValue = 'required';
  public categoryOptions = 'categoryOptions';
  public nonHeaderFieldNames: string[];
  public typeIndexInField: number = 4;
  public categoryTokensId = 'categoryTokensElement';
  public evaLearnMoreLink: string = 'https://www.cisco.com/go/create-template';
  public isPopoverActive = false;
  public popoverClicked(): void {
    this.isPopoverActive = !this.isPopoverActive;
  }

  public $onInit(): void {
    super.$onInit();
    this.MediaTypes = MediaTypes;
    this.nonHeaderFieldNames = _.filter(_.keys(this.getCustomerInformationFormFields()),
      (name) => { return (name !== 'welcomeHeader'); });
    this.isCustomerInformationPageValid();
  }

  public getLocalisedTextWithEscalation(name): string {
    if (this.TemplateWizardService.isExpertEscalationSelected()) {
      return this.$translate.instant(name + '_' + this.getType() + '_' + 'expert');
    } else {
      return this.$translate.instant(name + '_' + this.getType());
    }
  }

  public setActiveItem(val): void {
    this.activeItem = this.getFieldByName(val.toString());
  }

  public getFieldByName(fieldName): string {
    return this.getCustomerInformationFormFields()[fieldName];
  }

  private getType(): string {
    return (this.cardMode) ? this.cardMode : this.selectedMediaType();
  }

  public getCustomerInformationFormFields(): string {
    if (this.selectedMediaType() !== this.MediaTypes.CHAT_PLUS_CALLBACK) {
      return this.template.configuration.pages.customerInformation.fields;
    }
    switch (this.getType()) {
      case 'callback': return this.template.configuration.pages.customerInformationCallback.fields;
      default: return this.template.configuration.pages.customerInformationChat.fields;
    }
  }

  public getCustomerInformationBtnClass(): any {
    switch (this.getType()) {
      case 'chat': return 'start-chat';
      case 'callback': return 'actionBtn';
    }
  }

  private activeItemName;
  public isSecondFieldForCallBack (): boolean {
    return (this.selectedMediaType() === this.MediaTypes.CALLBACK ||
      this.TemplateWizardService.cardMode === this.MediaTypes.CALLBACK) && this.activeItemName === 'field2';
  }

  public checkIfTypeCategory(attributes): boolean {
    const isCategoryType = _.find(attributes, (attribute: any) => {
      return (attribute.name === 'type' && attribute.value.id === 'category');
    });
    return isCategoryType;
  }

  public validateType(selectedType): boolean {
    this.TemplateWizardService.pageValidationResult.isCustomerInfoPageValid =
      !(selectedType && this.isSelectedTypeDuplicate(selectedType)) && this.isCustomerInformationPageValid();
    return this.TemplateWizardService.pageValidationResult.isCustomerInfoPageValid;
  }

  public validateCategoryTextBoxType(selectedType): boolean {
    return !(selectedType && this.isSelectedTypeDuplicate(selectedType));
  }

  private isSelectedTypeDuplicate(selectedType) {
    this.isTypeDuplicate = false;

    const typesConfigured = this.getConfiguredTypes();
    if (_.filter(typesConfigured,  (type) => { return type === selectedType.id; }).length > 1) {
      this.isTypeDuplicate = true;
      return this.isTypeDuplicate;
    } else {
      return false;
    }
  }

  private getConfiguredTypes() {
    const typesConfigured = _.map(this.nonHeaderFieldNames, (fieldName: string) => {
      return (this.TemplateWizardService.getAttributeParam('value', 'type', fieldName)).id;
    });
    return typesConfigured;
  }

  public isCustomerInformationPageValid(): boolean {
    this.TemplateWizardService.pageValidationResult.isCustomerInfoPageValid =
      this.areAllTypesUnique() && this.areAllFixedFieldsValid() && this.areAllDynamicFieldsValid() && this.isCategoryValid()
      && this.isDynamicFieldInputValid() && this.TemplateWizardService.isInputValid(this.categoryOptionTag);
    return this.TemplateWizardService.pageValidationResult.isCustomerInfoPageValid;

  }

  private areAllTypesUnique(): boolean {
    const configuredTypes = this.getConfiguredTypes();
    const uniqueConfiguredTypes = _.uniq(configuredTypes);

    return (configuredTypes.length === uniqueConfiguredTypes.length);
  }

  private areAllFixedFieldsValid(): boolean {
    return this.TemplateWizardService.isValidField(this.TemplateWizardService.getAttributeParam('value', 'header', 'welcomeHeader'), this.lengthValidationConstants.singleLineMaxCharLimit50)
      && this.TemplateWizardService.isValidField(this.TemplateWizardService.getAttributeParam('value', 'organization', 'welcomeHeader'), this.lengthValidationConstants.singleLineMaxCharLimit50)
      && this.isFixedFieldInputValid();
  }

  private isFixedFieldInputValid(): boolean {
    return this.TemplateWizardService.isInputValid(this.TemplateWizardService.getAttributeParam('value', 'header', 'welcomeHeader'))
      && this.TemplateWizardService.isInputValid(this.TemplateWizardService.getAttributeParam('value', 'organization', 'welcomeHeader'));
  }

  private isDynamicFieldInputValid(): boolean {
    return _.reduce(_.map(this.nonHeaderFieldNames, (fieldName) => {
      return this.TemplateWizardService.isInputValid(this.TemplateWizardService.getAttributeParam('value', 'label', fieldName))
        && this.TemplateWizardService.isInputValid(this.TemplateWizardService.getAttributeParam('value', 'hintText', fieldName));
    }), (x, y) => { return x && y; }, true);
  }

  private areAllDynamicFieldsValid(): boolean {
    return _.reduce(_.map(this.nonHeaderFieldNames, (fieldName) => {
      return this.TemplateWizardService.isValidField(this.TemplateWizardService.getAttributeParam('value', 'label', fieldName), this.lengthValidationConstants.singleLineMaxCharLimit50)
        && this.TemplateWizardService.isValidField(this.TemplateWizardService.getAttributeParam('value', 'hintText', fieldName), this.lengthValidationConstants.singleLineMaxCharLimit50);
    }), (x, y) => { return x && y; }, true);
  }

  private isCategoryValid(): boolean {
    const fieldName = this.getFieldWithType(this.categoryField);
    //No category in list of fields when category is not added in the template
    if (fieldName === undefined) {
      return true;
    }
    const customerInfoPage = this.getCustomerInformationText();
    if ((this.TemplateWizardService.getAttributeValue(this.FieldValue, fieldName, customerInfoPage, 4))[this.idField] !== this.categoryField) {
      return true;
    }

    //Checking  whether category is required or optional
    const requiredField = this.TemplateWizardService.getAttributeValue(this.FieldValue, fieldName, customerInfoPage, 0);

    if (requiredField === this.optionalValue) {
      const categoryTxtContent = this.categoryOptionTag;
      if (categoryTxtContent === undefined ||
        (categoryTxtContent.length <= this.lengthValidationConstants.singleLineMaxCharLimit50)) {
        return true;
      } else {
        return false;
      }
    }
    if (this.getCategoryOptions()) {
      return true;
    }
    return false;
  }

  private getFieldWithType(type): any {
    const models = this.template.configuration.pages;
    const model: any = _.get(models, this.getCustomerInformationText());
    const fields = model.fields;
    if (fields != null) {
      // Iterating from field1-4 to figure out the field with type ( eg category  type)
      for (const fieldName in fields) {
        if (fieldName !== undefined && (fieldName.indexOf('field') === 0)) {
          const field: any = _.get(fields, fieldName);
          if (field !== undefined && field.attributes !== undefined && field.attributes instanceof Array) {
            if (field.attributes[this.typeIndexInField] !== undefined && (field.attributes[this.typeIndexInField].value)[this.idField] === type) {
              return fieldName;
            }
          }
        }
      }
    }
  }

  private getCustomerInformationText(): string {
    if (this.selectedMediaType() !== this.MediaTypes.CHAT_PLUS_CALLBACK) {
      return 'customerInformation';
    }
    const type = this.cardMode || this.selectedMediaType();
    switch (type) {
      case 'callback': return 'customerInformationCallback';
      default: return 'customerInformationChat';
    }
  }

  private getCategoryOptions(): string {
    const fieldName = this.getFieldWithType(this.categoryField);
    //Categories fetched from field with 'type' as category
    return this.TemplateWizardService.getAttributeValue(this.categoryOptions, fieldName, this.getCustomerInformationText(), 4);
  }

  public requiredOptions = [{
    text: this.$translate.instant('careChatTpl.requiredField'),
    id: 'required',
  }, {
    text: this.$translate.instant('careChatTpl.optionalField'),
    id: 'optional',
  }];

  public getLabel(attributeName): any {
    switch (attributeName) {
      case 'header':
        return 'careChatTpl.windowTitleLabel';
      case 'label':
        return 'careChatTpl.label';
      case 'hintText':
        return 'careChatTpl.hintText';
      case 'type':
        return 'careChatTpl.type';
    }
  }

  public typeOptions = [{
    id: 'email',
    text: this.$translate.instant('careChatTpl.typeEmail'),
    dictionaryType: {
      fieldSet: 'cisco.base.customer',
      fieldName: 'Context_Work_Email',
    },
  }, {
    id: 'name',
    text: this.$translate.instant('careChatTpl.typeName'),
    dictionaryType: {
      fieldSet: 'cisco.base.customer',
      fieldName: 'Context_First_Name',
    },
  }, {
    id: 'category',
    text: this.$translate.instant('careChatTpl.typeCategory'),
    dictionaryType: {
      fieldSet: 'cisco.base.ccc.pod',
      fieldName: 'category',
    },
  }, {
    id: 'phone',
    text: this.$translate.instant('careChatTpl.typePhone'),
    dictionaryType: {
      fieldSet: 'cisco.base.customer',
      fieldName: 'Context_Mobile_Phone',
    },
  }, {
    id: 'id',
    text: this.$translate.instant('careChatTpl.typeId'),
    dictionaryType: {
      fieldSet: 'cisco.base.customer',
      fieldName: 'Context_Customer_External_ID',
    },
  }, {
    id: 'custom',
    text: this.$translate.instant('careChatTpl.typeCustom'),
    dictionaryType: {
      fieldSet: 'cisco.base.ccc.pod',
      fieldName: 'cccCustom',
    },
  }, {
    id: 'reason',
    text: this.$translate.instant('careChatTpl.typeReason'),
    dictionaryType: {
      fieldSet: 'cisco.base.ccc.pod',
      fieldName: 'cccChatReason',
    },
  }];

  public isDefined(object, field): boolean {
    const value = object[field];
    return typeof value !== 'undefined' && value.trim() !== '';
  }

  public addCategoryOption(): void {
    if (this.categoryOptionTag && this.isCategoryOptionTagValid()) {
      (angular.element('#categoryTokensElement') as any).tokenfield('createToken', this.categoryOptionTag);
      this.categoryOptionTag = '';
    }
  }
  public isCategoryOptionTagValid(): boolean {
    const categoryValue = this.categoryOptionTag;
    return !(this.categoryOptionTag && (this.categoryOptionTag.length > this.lengthValidationConstants.singleLineMaxCharLimit50 ||
        !this.TemplateWizardService.isInputValid(categoryValue)));
  }

  public onEnterKey(keyEvent): void {
    if (keyEvent.which === KeyCodes.ENTER) {
      this.addCategoryOption();
    }
  }

  public isCategoryWarningRequired(): boolean {
    const fieldName = this.getFieldWithType(this.categoryField);
    //Checking whether category is required or optional
    if (fieldName !== undefined) {
      const requiredField = this.TemplateWizardService.getAttributeValue(this.FieldValue, fieldName, this.getCustomerInformationText(), 0);

      const c = console;
      c.log('getCategoryOptions', this.getCategoryOptions());
      if (requiredField === this.requiredValue && this.getCategoryOptions() === '') {
        return true;
      }
    }
    return false;
  }
}

export class CtCustomerComponent implements ng.IComponentOptions {
  public controller = CtCustomerController;
  public template = require('modules/sunlight/features/customerSupportTemplate/wizardPagesComponent/ctCustomer.tpl.html');
  public bindings = {
    cardMode: '@',
  };
}

export default angular
  .module('Sunlight')
  .component('ctCustomerComponent', new CtCustomerComponent())
  .name;
