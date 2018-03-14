import ctNameComponentModule from './ctName.component';

describe('In ctNameComponent, The controller', () => {

  //let ctNameComponent: CtNameComponent ;
  let controller;

  beforeEach(function () {
    this.initModules ('Sunlight', ctNameComponentModule);
    this.injectDependencies (
      'TemplateWizardService',
    );

    this.TemplateWizardService.setSelectedMediaType('chat');
    this.TemplateWizardService.setInitialState();

    this.compileComponent('ct-name-component', {
      dismiss: 'dismiss()',
    });

    controller = this.controller;
  });

  afterEach(function () {
    controller = undefined;
  });


  it('isValid should validate the name requirement', () => {

    const string_250Char = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const string_251Char = string_250Char + 'a';

    controller.TemplateWizardService.template.name = 'Good_Name';
    expect(controller.isValid()).toBe(true);

    controller.TemplateWizardService.template.name = string_250Char;
    expect(controller.isValid()).toBe(true);

    controller.TemplateWizardService.template.name = '';
    expect(controller.isValid()).toBe(false);

    controller.TemplateWizardService.template.name = 'Bad<>Name';
    expect(controller.isValid()).toBe(false);

    controller.TemplateWizardService.template.name = string_251Char;
    expect(controller.isValid()).toBe(false);


  });

});
