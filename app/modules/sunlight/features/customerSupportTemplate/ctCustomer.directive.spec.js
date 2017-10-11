'use strict';

describe('Directive: ct-customer Customer Information Page', function () {
  var $compile, $rootScope;
  var element;
  var mockActiveItem = {
    attributes: [{
      name: 'required',
      value: 'optional',
    }, {
      name: 'category',
      value: '',
    }, {
      name: 'label',
      value: '',
    }, {
      name: 'hintText',
      value: '',
    }, {
      name: 'type',
      value: {
        id: 'category',
        text: 'category',
        dictionaryType: {
          fieldSet: 'ccc_core',
          fieldName: 'ccc_category',
        },
      },
      categoryOptions: ['option1', 'option2', 'option3'],
    }],
  };

  afterEach(function () {
    if (element) {
      element.remove();
    }
    element = undefined;
  });

  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $rootScope.careSetupAssistant = {};
    $rootScope.careSetupAssistant.activeItem = mockActiveItem;
  }));

  function renderCtCustomerDirective() {
    element = $compile('<ct-customer/>')($rootScope);
    $rootScope.$digest();
    return element;
  }

  it('Renders 2 Cards: 1. Chat Screen Preview 2. Chat Form Attributes', function () {
    var ctCustomer = renderCtCustomerDirective();
    expect(ctCustomer.html()).toContainElement('.cs-card > article.customer-preview-article');
    expect(ctCustomer.html()).toContainElement('.cs-card > article.customer-attributes-article');
  });

  it('Renders the Category Dropdown editor UI Elements if the activeItems field type is CATEGORY', function () {
    var ctCustomer = renderCtCustomerDirective();
    expect(ctCustomer.html()).toContainElement('.ct-customer-info-category-input > i.icon-add-contain');
    expect(ctCustomer.find('.icon-add-contain').attr('ng-click')).toBe('careSetupAssistant.addCategoryOption()');
    expect(ctCustomer.html()).toContainElement('.ct-customer-info-category-input input.ct-attribute-field-textbox');
    expect(ctCustomer.find('.ct-customer-info-category-input input.ct-attribute-field-textbox').attr('ng-keypress')).toBe('careSetupAssistant.onEnterKey($event)');
    expect(ctCustomer.find('.ct-customer-info-category-input input.ct-attribute-field-textbox').attr('ng-model')).toBe('careSetupAssistant.categoryOptionTag');
    expect(ctCustomer.html()).toContainElement('.ct-customer-info-category-input > div.category-tokens > input.token-input');
    expect(ctCustomer.find('.ct-customer-info-category-input > div.category-tokens > input.token-input').attr('tokenfieldid')).toBe('careSetupAssistant.categoryTokensId');
    expect(ctCustomer.find('.ct-customer-info-category-input > div.category-tokens > input.token-input').attr('tokens')).toBe('attribute.categoryOptions');
  });
});
