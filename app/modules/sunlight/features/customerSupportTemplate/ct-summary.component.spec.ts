import ctSummaryComponent from './ct-summary.component';

describe('ctSummaryComponent, ', () => {
  let controller;
  let deferred;
  let deferredCtService;

  const chatTemplateResolved = function (operation) {
    this.SunlightConfigService[operation].and.returnValue(deferred.promise);
    this.LogMetricsService.logMetrics.and.returnValue('');
    this.Notification.success.and.returnValue('');
    this.CTService.openEmbedCodeModalNew.and.returnValue(deferredCtService.promise);
    deferred.resolve({
      success: true,
      headers: function () {
        return 'something/abc123';
      },
      status: 200,
    });
    controller.submitChatTemplate();
    expect(controller.DomainManagementService.syncDomainsWithCare).toHaveBeenCalled();
    expect(controller.creatingChatTemplate).toBeTruthy();
    expect(controller.SunlightConfigService[operation]).toHaveBeenCalled();
    this.$scope.$apply();
    expect(controller.creatingChatTemplate).toBeFalsy();
    expect(this.Notification.success).toHaveBeenCalledWith(jasmine.any(String), {
      featureName: jasmine.any(String),
    });
    expect(controller.saveCTErrorOccurred).toBeFalsy();
    expect(this.$state.go).toHaveBeenCalled();
    expect(this.LogMetricsService.logMetrics.calls.argsFor(0)[1]).toEqual('CARETEMPLATEFINISH');
    expect(this.CTService.openEmbedCodeModalNew).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(String));
  };

  const chatTemplateRejected = function (operation) {
    this.SunlightConfigService[operation].and.returnValue(deferred.promise);
    deferred.reject(failedData);
    controller.submitChatTemplate();
    expect(controller.creatingChatTemplate).toBeTruthy();
    expect(controller.DomainManagementService.syncDomainsWithCare).toHaveBeenCalled();
    expect(controller.SunlightConfigService[operation]).toHaveBeenCalled();
    this.$scope.$apply();
    expect(controller.creatingChatTemplate).toBeFalsy();
    expect(controller.saveCTErrorOccurred).toBeTruthy();
    expect(controller.ChatTemplateButtonText).toBe(controller.$translate.instant('common.retry'));
    expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith(failedData, jasmine.any(String));
  };

  const failedData: any = {
    success: true,
    headers: function () {
      return 'something/abc123';
    },
    status: 200,
  };
  beforeEach(function() {
    this.initModules ('Sunlight', ctSummaryComponent);
    this.injectDependencies (
      '$modal',
      '$scope',
      '$state',
      'CTService',
      'DomainManagementService',
      'LogMetricsService',
      'Notification',
      'SunlightConfigService',
      'TemplateWizardService',
    );

    this.TemplateWizardService.setSelectedMediaType('chat');
    this.TemplateWizardService.setInitialState();

    this.compileComponent('ct-summary-component', {
      dismiss: 'dismiss()',
    });
    deferred = this.$q.defer();
    deferredCtService = this.$q.defer();

    spyOn(this.DomainManagementService, 'syncDomainsWithCare');
    spyOn(this.SunlightConfigService, 'createChatTemplate');
    spyOn(this.SunlightConfigService, 'editChatTemplate');
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'errorWithTrackingId');
    spyOn(this.LogMetricsService, 'logMetrics');
    spyOn(this.CTService, 'openEmbedCodeModalNew');
    spyOn(this.$state, 'go');
    spyOn(this.$modal, 'open');

    controller = this.controller;
  });

  it('should set the defaults values', function () {
    expect(controller.ChatTemplateButtonText).toBe('common.finish');
    expect(controller.creatingChatTemplate).toBeFalsy();
    expect(controller.saveCTErrorOccurred).toBeFalsy();
  });

  it('should submit the chat template when isEditFeature is false and createChatTemplate resolves the promise', function () {
    controller.$stateParams.isEditFeature = false;
    chatTemplateResolved.call(this, 'createChatTemplate');
  });

  it('should submit the chat template when isEditFeature is false and createChatTemplate rejects the promise ', function () {
    controller.$stateParams.isEditFeature = false;
    chatTemplateRejected.call(this, 'createChatTemplate');
  });

  it('should submit the chat template when isEditFeature is true and editChatTemplate resolves the promise', function () {
    controller.$stateParams.isEditFeature = true;
    controller.template.templateId = '123';
    chatTemplateResolved.call(this, 'editChatTemplate');
  });

  it('should submit the chat template when isEditFeature is true and editChatTemplate rejects the promise ', function () {
    controller.$stateParams.isEditFeature = true;
    chatTemplateRejected.call(this, 'editChatTemplate');
  });
});
