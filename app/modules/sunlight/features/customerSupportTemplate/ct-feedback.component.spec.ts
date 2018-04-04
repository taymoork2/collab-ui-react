import ctFeedbackModule from './ct-feedback.component';

describe('In CtFeedbackComponent, The controller', () => {

  let controller;

  beforeEach(function () {
    this.initModules ('Sunlight', ctFeedbackModule);
    this.injectDependencies (
      'TemplateWizardService',
    );

    this.TemplateWizardService.setSelectedMediaType('chat');
    this.TemplateWizardService.setInitialState();
    this.TemplateWizardService.currentState = 'feedback';

    this.compileComponent('ct-feedback-component');

    controller = this.controller;
  });

  afterEach(function () {
    controller = undefined;
  });
  const getStringOfLength = function (length) {
    return Array(length + 1).join('a');
  };

  it('next button should be disabled if feedback comment is longer than 50 characters', function () {
    controller.template.configuration.pages.feedback.fields.comment.displayText = getStringOfLength(51);
    expect(controller.isFeedbackPageValid()).toBe(false);
    expect(controller.TemplateWizardService.pageValidationResult.isFeedbackValid).toBe(false);
  });

  it('next button should be disabled if feedback comment has any invalid character', function () {
    controller.template.configuration.pages.feedback.fields.comment.displayText = '<';
    expect(controller.isFeedbackPageValid()).toBe(false);
    expect(controller.TemplateWizardService.pageValidationResult.isFeedbackValid).toBe(false);
  });

  it('next button should be disabled if feedback query is longer than 250 characters', function () {
    controller.template.configuration.pages.feedback.fields.feedbackQuery.displayText = getStringOfLength(251);
    expect(controller.isFeedbackPageValid()).toBe(false);
    expect(controller.TemplateWizardService.pageValidationResult.isFeedbackValid).toBe(false);
  });

  it('next button should be disabled if feedback query has any invalid character', function () {
    controller.template.configuration.pages.feedback.fields.feedbackQuery.displayText = '<';
    expect(controller.isFeedbackPageValid()).toBe(false);
    expect(controller.TemplateWizardService.pageValidationResult.isFeedbackValid).toBe(false);
  });

  it('next button should be enabled if feedback comment and query are valid', function () {
    controller.template.configuration.pages.feedback.fields.comment.displayText = 'Feedback comment';
    controller.template.configuration.pages.feedback.fields.feedbackQuery.displayText = 'Feedback query';
    expect(controller.isFeedbackPageValid()).toBe(true);
    expect(controller.TemplateWizardService.pageValidationResult.isFeedbackValid).toBe(true);
  });

  it('validate getFeedbackDesc', function () {
    controller.currentState = 'feedback';
    expect(controller.getFeedbackDesc()).toBe('careChatTpl.feedbackDesc');
    controller.currentState = 'feedbackCallback';
    expect(controller.getFeedbackDesc()).toBe('careChatTpl.callFeedbackDesc');
  });

  it('validate getLocalisedFeedbackText', function () {
    controller.currentState = 'feedback';
    expect(controller.getLocalisedFeedbackText()).toBe('careChatTpl.feedback_chat');
    controller.TemplateWizardService.setSelectedMediaType('callback');
    controller.currentState = 'feedbackCallback';
    expect(controller.getLocalisedFeedbackText()).toBe('careChatTpl.feedbackCallback_callback');
  });
});
