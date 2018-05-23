import ctEmbedCodeModalComponent from './ct-embed-code-modal.component';

describe('ctSummaryComponent, ', () => {
  let controller;
  let deferred;
  const chatConfig = (allowedOrigins) => {
    return {
      data: {
        allowedOrigins,
      },
    };
  };

  beforeEach(function() {
    this.initModules ('Sunlight', ctEmbedCodeModalComponent);
    this.injectDependencies (
      '$scope',
      'CTService',
      'TemplateWizardService',
      'SunlightConfigService',
    );

    this.TemplateWizardService.setSelectedMediaType('chat');
    this.TemplateWizardService.setInitialState();

    deferred =  this.$q.defer();
    spyOn(this.CTService, 'generateCodeSnippet').and.returnValue(jasmine.any(String));
    spyOn(this.SunlightConfigService, 'getChatConfig').and.returnValue(deferred.promise);

    this.compileComponent('ct-embed-code-modal-component', {
      dismiss: 'dismiss()',
      templateId: 'cb06f840-3f08-11e8-bdb6-0fce79e26ee6',
      templateName: 'test',
      templateHeader: 'Embed Code for test',
    });

    controller = this.controller;
  });

  it('should set the defaults values when promise is resolved and all origins are allowed', function () {
    deferred.resolve(chatConfig(['.*']));
    expect(controller.isLoading).toBeTruthy();
    expect(controller.CTService.generateCodeSnippet).toHaveBeenCalled();
    expect(controller.SunlightConfigService.getChatConfig).toHaveBeenCalled();
    this.$scope.$apply();
    expect(controller.domainInfo).toEqual({ data: null, error: false, warn: true });
    expect(controller.isLoading).toBeFalsy();
  });

  it('should set the defaults values when promise is resolved and origin is undefined ', function () {
    deferred.resolve(chatConfig(['']));
    this.$scope.$apply();
    expect(controller.domainInfo).toEqual({ data: [''], error: false, warn: false });
  });

  it('should set the defaults values when promise is rejected', function () {
    deferred.reject('error');
    expect(controller.CTService.generateCodeSnippet).toHaveBeenCalled();
    expect(controller.SunlightConfigService.getChatConfig).toHaveBeenCalled();
    this.$scope.$apply();
    expect(controller.domainInfo).toEqual({ data: null, error: true, warn: false });
    expect(controller.isLoading).toBeFalsy();
  });
});
