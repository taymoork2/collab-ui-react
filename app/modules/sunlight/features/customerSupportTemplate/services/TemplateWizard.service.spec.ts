import { TemplateWizardService } from './TemplateWizard.service';

describe('TemplateWizardService ', () => {

  let templateWizardService: TemplateWizardService;

  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(inject(function(_TemplateWizardService_) {
    templateWizardService = _TemplateWizardService_;

  }));

  afterEach( function() {
    //templateWizardService = none;
  });

  it('getDefaultTemplate get the right template for mediaTye = chat', () => {
    expect(templateWizardService.getDefaultTemplate('chat').mediaType === 'chat').toBe(true);
  });

  it('getDefaultTemplate get the right template for mediaTye = callback', () => {
    expect(templateWizardService.getDefaultTemplate('chat').mediaType === 'callback').toBe(true);
  });

  it('getDefaultTemplate get the right template for mediaTye = chatpluscallback', () => {
    expect(templateWizardService.getDefaultTemplate('chat').mediaType === 'chatpluscallback').toBe(true);
  });

  it('setSelectedMediaType to set the mediaType in the service and get the default template', () => {
    templateWizardService.setSelectedMediaType('chat');
    expect(templateWizardService.selectedMediaType() === 'chat').toBe(true);
    expect(templateWizardService.template.mediaType === 'chat').toBe(true);
  });

  it('setInitialState should set the starting state', () => {
    templateWizardService.setInitialState();
    expect(templateWizardService.currentState === templateWizardService.getStates()[0]).toBe(true);
  });

  it('isInputValid should validate the input content against the invalid char list', () => {
    expect(templateWizardService.isInputValid('sdsd > sds')).toBe(false);
    expect(templateWizardService.isInputValid('sdsd sds')).toBe(true);
  });

  it ('isValidField should validate the length of the input', () => {
    expect(templateWizardService.isValidField('sss', 50)).toBe(true);
    expect(templateWizardService.isValidField('sss', 2)).toBe(false);
    expect(templateWizardService.isValidField('sss', 3)).toBe(true);
  });
});
