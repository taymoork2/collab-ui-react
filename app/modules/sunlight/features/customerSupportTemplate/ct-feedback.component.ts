import { CtBaseController } from './ctBase.controller';
import { TemplateWizardService } from './services/TemplateWizard.service';
import { CTService } from 'modules/sunlight/features/customerSupportTemplate/services/CTService';
class CtFeedbackController extends CtBaseController {

  /* @ngInject*/
  constructor(
    public $stateParams: ng.ui.IStateParamsService,
    public CTService: CTService,
    public $translate: ng.translate.ITranslateService,
    public TemplateWizardService: TemplateWizardService,
  ) {

    super($stateParams, TemplateWizardService, CTService, $translate);
  }

  public $onInit(): void {
    super.$onInit();
    this.isFeedbackPageValid();
  }

  public getFeedbackDesc(): string {
    if (this.currentState === 'feedbackCallback') {
      return this.$translate.instant('careChatTpl.callFeedbackDesc');
    } else {
      return this.$translate.instant('careChatTpl.feedbackDesc');
    }
  }

  public getLocalisedFeedbackText(): string {
    return this.getLocalisedText('careChatTpl.' + this.currentState);
  }

  public isFeedbackPageValid(): boolean {
    this.TemplateWizardService.pageValidationResult.isFeedbackValid = ((this.TemplateWizardService.isValidField(this.getFeedbackModel().fields.feedbackQuery.displayText, this.lengthValidationConstants.multiLineMaxCharLimit)
    && this.TemplateWizardService.isValidField(this.getFeedbackModel().fields.comment.displayText, this.lengthValidationConstants.singleLineMaxCharLimit50)
    && this.TemplateWizardService.isInputValid(this.getFeedbackModel().fields.feedbackQuery.displayText)
    && this.TemplateWizardService.isInputValid(this.getFeedbackModel().fields.comment.displayText)));
    return this.TemplateWizardService.pageValidationResult.isFeedbackValid;
  }

  private getFeedbackModel() {
    if (this.currentState === 'feedback') {
      return this.template.configuration.pages.feedback;
    } else {
      return this.template.configuration.pages.feedbackCallback;
    }
  }

}

export class CtFeedbackComponent implements ng.IComponentOptions {
  public controller = CtFeedbackController;
  public template = require('modules/sunlight/features/customerSupportTemplate/wizardPagesComponent/ct-feedback.tpl.html');

}

export default angular
  .module('Sunlight')
  .component('ctFeedbackComponent', new CtFeedbackComponent())
  .name;
