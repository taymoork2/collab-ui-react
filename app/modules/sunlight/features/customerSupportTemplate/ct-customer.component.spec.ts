import ctCustomerInformationComponentModule from './ct-customer.component';

describe('In ctCustomerInformationComponent, The controller', () => {

  let controller;
  beforeEach(function () {
    this.initModules ('Sunlight', ctCustomerInformationComponentModule);
    this.injectDependencies (
      'TemplateWizardService',
      'CTService',
      '$translate',
    );

    this.TemplateWizardService.setSelectedMediaType('chat');
    this.TemplateWizardService.setInitialState();

    this.compileComponent('ct-customer-component', {
      dismiss: 'dismiss()',
    });
    controller = this.controller;
  });

  afterEach(function () {
    controller = undefined;
  });

  const getStringOfLength = function (length) {
    return Array(length + 1).join('a');
  };

  const duplicateFieldTypeData = {
    welcomeHeader: {
      attributes: [
        { name: 'header', value: 'Welcome' },
        { name: 'organization', value: 'Sunlight Org' },
      ],
    },
    field1: {
      attributes: [
        { name: 'label', value: 'Name' },
        { name: 'hintText', value: 'Something' },
        { name: 'type', value: { id: 'name' } },
      ],
    },
    field2: {
      attributes: [
        { name: 'label', value: 'Email' },
        { name: 'hintText', value: 'Something' },
        { name: 'type', value: { id: 'email' } },
      ],
    },
    field3: {
      attributes: [
        { name: 'label', value: 'SomethingElse' },
        { name: 'hintText', value: 'SomethingElse' },
        { name: 'type', value: { id: 'name' } },
      ],
    },
    field4: {
      attributes: [
        { name: 'label', value: '1234567890' },
        { name: 'hintText', value: '1234567765' },
        { name: 'type', value: { id: 'phone' } },
      ],
    },
  };

  const customerInfoWithInvalidAttributeValue = {
    welcomeHeader: {
      attributes: [
        { name: 'header', value: 'Welcome to >' },
        { name: 'organization', value: 'Sunlight Org' },
      ],
    },
    field1: {
      attributes: [
        { name: 'label', value: 'Name <' },
        { name: 'hintText', value: 'Something' },
        { name: 'type', value: { id: 'name' } },
      ],
    },
    field2: {
      attributes: [
        { name: 'label', value: 'Email' },
        { name: 'hintText', value: 'Something' },
        { name: 'type', value: { id: 'email' } },
      ],
    },
    field3: {
      attributes: [
        { name: 'label', value: 'SomethingElse' },
        { name: 'hintText', value: 'SomethingElse' },
        { name: 'type', value: { id: 'custom' } },
      ],
    },
  };

  const customerInfoWithValidAttributeValue = {
    welcomeHeader: {
      attributes: [
        { name: 'header', value: 'Welcome' },
        { name: 'organization', value: 'Sunlight Org' },
      ],
    },
    field1: {
      attributes: [
        { name: 'required', value: 'required' },
        { name: 'category', value: { id: 'customerInfo' } },
        { name: 'label', value: 'Name' },
        { name: 'hintText', value: '' },
        { name: 'type', value: { id: 'name' }, categoryOptions: '' },
      ],
    },
    field2: {
      attributes: [
        { name: 'required', value: 'required' },
        { name: 'category', value: { id: 'customerInfo' } },
        { name: 'label', value: 'Email' },
        { name: 'hintText', value: 'abc@gmail.com' },
        { name: 'type', value: { id: 'email' }, categoryOptions: '' },
      ],
    },
    field3: {
      attributes: [
        { name: 'required', value: 'optional' },
        { name: 'category', value: { id: 'requestInfo' } },
        { name: 'label', value: 'How may i assist you' },
        { name: 'hintText', value: 'select from the list' },
        { name: 'type', value: { id: 'category' }, categoryOptions: '' },
      ],
    },
    field4: {
      attributes: [
        { name: 'required', value: 'optional' },
        { name: 'category', value: { id: 'requestInfo' } },
        { name: 'label', value: 'Additional details' },
        { name: 'hintText', value: 'describe the issue' },
        { name: 'type', value: { id: 'reason' }, categoryOptions: '' },
      ],
    },
  };

  const customerInfoWithLongAttributeValue = {
    welcomeHeader: {
      attributes: [
        { name: 'header', value: 'Welcome to' },
        { name: 'organization', value: getStringOfLength(51) },
      ],
    },
    field1: {
      attributes: [
        { name: 'label', value: 'Name' },
        { name: 'hintText', value: 'Something' },
        { name: 'type', value: { id: 'name' } },
      ],
    },
    field2: {
      attributes: [
        { name: 'label', value: 'Email' },
        { name: 'hintText', value: getStringOfLength(51) },
        { name: 'type', value: { id: 'email' } },
      ],
    },
    field3: {
      attributes: [
        { name: 'label', value: 'SomethingElse' },
        { name: 'hintText', value: 'SomethingElse' },
        { name: 'type', value: { id: 'custom' } },
      ],
    },
  };


  it('should set the active item', function () {
    const returnObj = {
      attributes: [{
        name: 'header',
        value: 'Welcome',
      }, {
        name: 'organization',
        value: 'Sunlight Org',
      }],
    };

    controller.TemplateWizardService.template.configuration.pages.customerInformation.fields  = customerInfoWithValidAttributeValue;
    controller.setActiveItem('welcomeHeader');
    expect(controller.activeItem).toEqual(returnObj);
  });

  it('should not get the attribute param for incorrect param', function () {
    const attrParam = controller.TemplateWizardService.getAttributeParam('displaytext', 'organization', 'welcomeHeader');
    expect(attrParam).toBe(undefined);
  });

  it('should not get the attribute param for incorrect attribute', function () {
    const attrParam = controller.TemplateWizardService.getAttributeParam('label', 'displaytext', 'welcomeHeader');
    expect(attrParam).toBe(undefined);
  });

  it('should not get the attribute param for incorrect field', function () {
    const attrParam = controller.TemplateWizardService.getAttributeParam('label', 'organization', 'field');
    expect(attrParam).toBe(undefined);
  });

  it('should not get the attribute param for undefined field', function () {
    const attrParam = controller.TemplateWizardService.getAttributeParam('label', 'organization', undefined);
    expect(attrParam).toBe(undefined);
  });

  it('should be true for defined object field', function () {
    const testObj = {
      'trees-14': 'x-10000',
      'trees-15': 'x-20000',
      'trees-16': 'x-30000',
    };
    const isDefinedRes = controller.isDefined(testObj, 'trees-15');
    expect(isDefinedRes).toBe(true);
  });

  it('should be false for undefined object or field', function () {
    const testObj = {
      'trees-14': 'x-10000',
      'trees-15': 'x-20000',
      'trees-16': '',
    };
    let isDefinedRes = controller.isDefined(testObj, 'trees-17');
    expect(isDefinedRes).toBe(false);
    isDefinedRes = controller.isDefined(testObj, 'trees-16');
    expect(isDefinedRes).toBe(false);
  });

  it('should add a new category token and clear the input field when a new token is added', function () {
    const ENTER_KEYPRESS_EVENT = {
      which: 13,
    };
    controller.categoryOptionTag = 'Mock Category Token';
    const mockElementObject = jasmine.createSpyObj('element', ['tokenfield']);
    spyOn(angular, 'element').and.returnValue(mockElementObject);
    spyOn(controller, 'addCategoryOption').and.callThrough();

    controller.onEnterKey(ENTER_KEYPRESS_EVENT);

    expect(controller.addCategoryOption).toHaveBeenCalled();
    expect(mockElementObject.tokenfield).toHaveBeenCalledWith('createToken', 'Mock Category Token');
    expect(controller.categoryOptionTag).toEqual('');
  });

  it('should not add invalid category', function () {
    const ENTER_KEYPRESS_EVENT = {
      which: 13,
    };
    const errorString = 'Agent has left the chat room Waiting for an Agent to join You are chatting with our agent Agent has left the chat room Waiting for an Agent to join You are chatting with our agent Agent has left the chat room Waiting for an Agent to join You are chatting with our agent ';
    controller.categoryOptionTag = errorString;
    spyOn(controller, 'addCategoryOption').and.callThrough();

    controller.onEnterKey(ENTER_KEYPRESS_EVENT);

    expect(controller.addCategoryOption).toHaveBeenCalled();
    expect(controller.categoryOptionTag).toEqual(errorString);
  });

  it('should validate type for a unique field', function () {
    controller.TemplateWizardService.template.configuration.pages.customerInformation.fields  = customerInfoWithValidAttributeValue;
    expect(controller.validateType({ id: 'name' })).toEqual(true);
  });

  it('should identify a duplicate type configured', function () {
    controller.template.configuration.pages.customerInformation.fields = duplicateFieldTypeData;
    expect(controller.validateType({ id: 'name' })).toEqual(false);
  });

  it('next button should be enabled when required option is selected for category and category is not empty', function () {
    controller.currentState = 'customerInformation';
    controller.TemplateWizardService.template.configuration.pages.customerInformation.fields  = customerInfoWithValidAttributeValue;
    (controller.template.configuration.pages.customerInformation.fields['field3']).attributes[0].value = 'required';
    (controller.template.configuration.pages.customerInformation.fields['field3']).attributes[4].categoryOptions = 'testcategory';
    expect(controller.isCustomerInformationPageValid()).toBe(true);
  });

  it('next button should be enabled when optional is selected for category and category is not empty', function () {
    controller.currentState = 'customerInformation';
    controller.TemplateWizardService.template.configuration.pages.customerInformation.fields  = customerInfoWithValidAttributeValue;
    (controller.template.configuration.pages.customerInformation.fields['field3']).attributes[0].value = 'optional';
    (controller.template.configuration.pages.customerInformation.fields['field3']).attributes[4].categoryOptions = 'testcategory';
    expect(controller.isCustomerInformationPageValid()).toEqual(true);
  });

  it('next button should be disabled when required option is selected for category and category is empty', function () {
    controller.currentState = 'customerInformation';
    controller.TemplateWizardService.template.configuration.pages.customerInformation.fields  = customerInfoWithValidAttributeValue;
    (controller.template.configuration.pages.customerInformation.fields['field3']).attributes[0].value = 'required';
    (controller.template.configuration.pages.customerInformation.fields['field3']).attributes[4].categoryOptions = '';
    controller.$onInit();
    expect(controller.isCustomerInformationPageValid()).toEqual(false);
  });


  it('next button should be enabled when optional is selected for category and category is empty', function () {
    controller.currentState = 'customerInformation';
    controller.TemplateWizardService.template.configuration.pages.customerInformation.fields  = customerInfoWithValidAttributeValue;
    (controller.TemplateWizardService.template.configuration.pages.customerInformation.fields['field3']).attributes[0].value = 'optional';
    (controller.TemplateWizardService.template.configuration.pages.customerInformation.fields['field3']).attributes[4].categoryOptions = '';
    controller.$onInit();
    expect(controller.isCustomerInformationPageValid()).toEqual(true);
  });


  it('next button should get disabled when duplicate types are configured in customerInfo page', function () {
    controller.template.configuration.pages.customerInformation.fields = duplicateFieldTypeData;
    controller.$onInit();
    expect(controller.isCustomerInformationPageValid()).toEqual(false);
  });

  it('next button should get disabled when attributes of customerInfo: Static and Dynamic fields have value > 50 chars', function () {
    controller.template.configuration.pages.customerInformation.fields = customerInfoWithLongAttributeValue;
    controller.$onInit();
    expect(controller.isCustomerInformationPageValid()).toEqual(false);
  });

  it('next button should get disabled when attributes of customerInfo: Static and Dynamic fields have invalid characters', function () {
    controller.template.configuration.pages.customerInformation.fields = customerInfoWithInvalidAttributeValue;
    controller.$onInit();
    expect(controller.isCustomerInformationPageValid()).toEqual(false);
  });
});
