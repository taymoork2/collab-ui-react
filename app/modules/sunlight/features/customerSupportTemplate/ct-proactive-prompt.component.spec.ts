import ctProactivePromptComponentModule from './ct-proactive-prompt.component';
import { ProactivePrompt } from './factory/ctCustomerSupportClasses';

const getStringOfLength = (length) => {
  return Array(length + 1).join('a');
};

const defaultPromptTime = {
  label: 'careChatTpl.promptTimeOption1',
  value: 30,
};

const dummyLogoUrl = 'https://www.example.com/logo.png';

const getDummyLogo = (data) => {
  return { data };
};

let controller;
let getLogoDeferred;
let getLogoUrlDeferred;
let sampleProactivePrompt;

describe('Test', () => {

  beforeEach(function () {
    this.initModules ('Sunlight', ctProactivePromptComponentModule);
    this.injectDependencies (
      'TemplateWizardService',
      '$stateParams',
      '$translate',
      'CTService',
      'Authinfo',
      '$q',
    );
    getLogoDeferred = this.$q.defer();
    getLogoUrlDeferred = this.$q.defer();
    spyOn(this.CTService, 'getLogo').and.returnValue(getLogoDeferred.promise);
    spyOn(this.CTService, 'getLogoUrl').and.returnValue(getLogoUrlDeferred.promise);
    spyOn(this.$translate, 'instant').and.returnValue('careChatTpl.promptTimeOption1');
    getLogoDeferred.resolve(getDummyLogo('abcd'));
    getLogoUrlDeferred.resolve(dummyLogoUrl);
  });

  describe('In Proactive Prompt Page, The controller', () => {
    const expectedJSON = (overrideProperties: any = {}) => {
      return  <ProactivePrompt>(_.merge(sampleProactivePrompt, overrideProperties));
    };
    const setPromptTime = (time) => {
      expect(controller.promptTimeObj).toEqual(defaultPromptTime);
      controller.template.configuration.proactivePrompt.fields.promptTime = time.value;
    };
    const orgName = 'Test Org';

    beforeEach(function () {
      spyOn(this.Authinfo, 'getOrgName').and.returnValue(orgName);
      this.TemplateWizardService.setSelectedMediaType('chat');
      this.TemplateWizardService.setInitialState();
      this.compileComponent('ct-proactive-prompt-component', {});
      sampleProactivePrompt = new ProactivePrompt(this.Authinfo, this.CTService, this.$translate);
      controller = this.controller;
    });

    afterEach(function () {
      controller = undefined;
    });
    it('should set default promptTime, promptTitle and promptMessage', function () {
      expect(controller.promptTimeObj.label).toBe('careChatTpl.promptTimeOption1');
      expect(controller.promptTimeObj.value).toBe(30);
      expect(controller.template.configuration.proactivePrompt.fields.promptTitle.displayText)
        .toBe(orgName);
      expect(controller.template.configuration.proactivePrompt.fields.promptMessage.message)
        .toBe('careChatTpl.promptTimeOption1');
    });
    it('should disable the next button if promptTitle is more than 25 characters', function () {
      controller.template.configuration.proactivePrompt.fields.promptTitle.displayText = getStringOfLength(26);
      controller.isProactivePromptPageValid();
      expect(this.TemplateWizardService.pageValidationResult.isProactivePromptPageValid).toBe(false);
    });
    it('should disable the next button if promptMessage is more than 100 characters', function () {
      controller.template.configuration.proactivePrompt.fields.promptMessage.message = getStringOfLength(101);
      controller.isProactivePromptPageValid();
      expect(this.TemplateWizardService.pageValidationResult.isProactivePromptPageValid).toBe(false);
    });
    it('should disable the next button when promptTitle has any invalid character', function () {
      controller.template.configuration.proactivePrompt.fields.promptTitle.displayText = '>';
      controller.isProactivePromptPageValid();
      expect(this.TemplateWizardService.pageValidationResult.isProactivePromptPageValid).toBe(false);
    });
    it('should disable the next button when promptMessage has any invalid character', function () {
      controller.template.configuration.proactivePrompt.fields.promptMessage.message = '>';
      controller.isProactivePromptPageValid();
      expect(this.TemplateWizardService.pageValidationResult.isProactivePromptPageValid).toBe(false);
    });
    it('should enable the previous and next button if all the fields are valid', function () {
      controller.template.configuration.proactivePrompt.fields.promptTime = 30;
      controller.template.configuration.proactivePrompt.fields.promptTitle.displayText = 'Need Help?';
      controller.template.configuration.proactivePrompt.fields.promptMessage.message = 'Chat with specialists.';
      controller.isProactivePromptPageValid();
      expect(this.TemplateWizardService.pageValidationResult.isProactivePromptPageValid).toBe(true);
    });
    it('should update the templateJSON with proactive prompt data', function () {
      const promptTime = {
        label: '3 minute',
        value: 180,
      };
      const expectedProperties = {
        fields: {
          promptTime: 180,
        },
      };
      setPromptTime(promptTime);
      controller.isProactivePromptPageValid();
      expect(controller.template.configuration.proactivePrompt).toEqual(expectedJSON(expectedProperties));
    });
    it('should update the existing template with whatever proactive prompt data is set', function () {
      const existingProperties = {
        fields: {
          promptTime: 30,
        },
      };
      const updatedProperties = {
        fields: {
          promptTime: 300,
        },
        enabled: true,
      };
      const promptTime = {
        label: '5 minutes',
        value: 300,
      };
      expect(controller.template.configuration.proactivePrompt).toEqual(expectedJSON(existingProperties));
      controller.template.configuration.proactivePrompt.enabled = true;
      setPromptTime(promptTime);
      controller.isProactivePromptPageValid();
      expect(controller.template.configuration.proactivePrompt).toEqual(expectedJSON(updatedProperties));
    });

    it('on change should update the existing template with updated prompt time', function () {
      const promptTime = {
        label: '5 minutes',
        value: 300,
      };
      controller.promptTimeObj = promptTime;
      controller.onPromptTimeChange();
      expect(controller.template.configuration.proactivePrompt.fields.promptTime).toBe(promptTime.value);
    });
  });

  describe('In Proactive Prompt Page, The Org Name', () => {
    const orgName = getStringOfLength(51);

    beforeEach(function () {
      spyOn(this.Authinfo, 'getOrgName').and.returnValue(orgName);
      this.TemplateWizardService.setSelectedMediaType('chat');
      this.TemplateWizardService.setInitialState();
      this.compileComponent('ct-proactive-prompt-component', {});
      controller = this.controller;
    });

    afterEach(function () {
      controller = undefined;
    });

    it('should set default promptTitle to Org Name (up-to first 50 characters only)', function () {
      expect(controller.template.configuration.proactivePrompt.fields.promptTitle.displayText)
      .toBe(orgName.slice(0, 50));
    });
  });
});
