(function () {
  'use strict';

  angular
    .module('Sunlight')
    .controller('CareChatSetupAssistantCtrl', CareChatSetupAssistantCtrl);

  /* @ngInject */
  function CareChatSetupAssistantCtrl($modal, $timeout, $translate) {
    var vm = this;

    vm.cancelModal = cancelModal;
    vm.evalKeyPress = evalKeyPress;

    // Setup assistant controller functions
    vm.nextPage = nextPage;
    vm.previousPage = previousPage;
    vm.nextButton = nextButton;
    vm.previousButton = previousButton;
    vm.getPageIndex = getPageIndex;
    vm.animation = 'slide-left';

    // Setup Assistant pages with index
    vm.states = ['name',
      'profile',
      'overview',
      'customer',
      'feedback',
      'agentUnavailable',
      'offHours',
      'chatStrings',
      'embedCode'
    ];

    vm.currentState = vm.states[0];

    vm.animationTimeout = 10;

    vm.escapeKey = 27;
    vm.leftArrow = 37;
    vm.rightArrow = 39;

    vm.template = {
      name: '',
      mediaType: 'chat',
      configuration: {
        pages: {
          customerInformation: {
            enabled: true
          },
          agentUnavailable: {
            enabled: true
          },
          offHours: {
            enabled: true
          },
          feedback: {
            enabled: true
          }
        }
      }
    };

    vm.overview = {
      customerInformation: 'circle-user',
      agentUnavailable: 'circle-comp-negative',
      offHours: 'circle-clock-hands',
      feedback: 'circle-star'
    };

    //Model for ctSetupAssistance data
    vm.selectFieldOptions = [];
    vm.selectFieldSelected = '';
    vm.selectFieldPlaceholder = 'Select from the list or type';

    function cancelModal() {
      $modal.open({
        templateUrl: 'modules/sunlight/features/chat/ctCancelModal.tpl.html'
      });
    }

    function evalKeyPress(keyCode) {
      switch (keyCode) {
      case vm.escapeKey:
        cancelModal();
        break;
      case vm.rightArrow:
        if (nextButton(vm.currentState) === true) {
          nextPage();
        }
        break;
      case vm.leftArrow:
        if (previousButton(vm.currentState) === true) {
          previousPage();
        }
        break;
      default:
        break;
      }
    }

    function getPageIndex() {
      return vm.states.indexOf(vm.currentState);
    }

    function validatePageName() {
      if (vm.template.name === '') {
        return false;
      }
      return true;
    }

    function nextButton() {
      var retVal = true;

      switch (vm.currentState) {
      case 'name':
        retVal = validatePageName();
        break;
      case 'embedCode':
        retVal = 'hidden';
        break;
      default:
        break;
      }
      return retVal;
    }

    function previousButton() {
      if (vm.currentState === vm.states[0]) {
        return 'hidden';
      }
      return true;
    }

    function nextPage() {
      vm.animation = 'slide-left';
      $timeout(function () {
        vm.currentState = vm.states[getPageIndex() + 1];
      }, vm.animationTimeout);
    }

    function previousPage() {
      vm.animation = 'slide-right';
      $timeout(function () {
        vm.currentState = vm.states[getPageIndex() - 1];
      }, vm.animationTimeout);
    }

    /**
     * Type enumerations
     */

    vm.STATIC_FIELD_TYPES = {
      "welcome": {
        text: "welcome",
        htmlType: "label"
      }
    };

    var TYPE_OPTIONS = [{
      text: "email",
      htmlType: "email",
      dictionaryType: {
        fieldSet: "ccc_core",
        fieldName: "ccc_email"
      }
    }, {
      text: "name",
      htmlType: "text",
      dictionaryType: {
        fieldSet: "ccc_core",
        fieldName: "ccc_name"
      }
    }, {
      text: "category",
      htmlType: "select",
      dictionaryType: {
        fieldSet: "ccc_core",
        fieldName: "ccc_category"
      }
    }, {
      text: "phone",
      htmlType: "tel",
      dictionaryType: {
        fieldSet: "ccc_core",
        fieldName: "ccc_phone"
      }
    }, {
      text: "id",
      htmlType: "id",
      dictionaryType: {
        fieldSet: "ccc_core",
        fieldName: "ccc_email"
      }
    }];

    var CATEGORY_TYPE_OPTIONS = [{
      text: $translate.instant('careChatTpl.categoryTextCustomer'),
      id: 'customerInfo',
      helpText: $translate.instant('careChatTpl.ciHelpText')
    }, {
      text: $translate.instant('careChatTpl.categoryTextRequest'),
      id: 'requestInfo',
      helpText: $translate.instant('careChatTpl.riHelpText')
    }];

    var REQUIRED_OPTIONS = [{
      text: $translate.instant('careChatTpl.requiredField'),
      id: 'required'
    }, {
      text: $translate.instant('careChatTpl.optionalField'),
      id: 'optional'
    }];

    vm.getCategoryTypeObject = function (typeId) {
      for (var key in CATEGORY_TYPE_OPTIONS) {
        if (CATEGORY_TYPE_OPTIONS.hasOwnProperty(key) && CATEGORY_TYPE_OPTIONS[key].id === typeId.toString()) {
          return CATEGORY_TYPE_OPTIONS[key];
        }
      }
    };

    vm.getTypeObject = function (typeText) {
      for (var key in TYPE_OPTIONS) {
        if (TYPE_OPTIONS.hasOwnProperty(key) && TYPE_OPTIONS[key].text === typeText.toString()) {
          return TYPE_OPTIONS[key];
        }
      }
    };

    /**
     * Default model should be replaced with service
     */

    vm.model = {
      customerInfo: {
        fields: {
          'welcomeHeader': {
            attributes: [{
              name: 'header',
              type: 'text',
              value: $translate.instant('careChatTpl.defaultWelcomeText'),
              label: $translate.instant('careChatTpl.windowTitleLabel')
            }, {
              name: 'organization',
              type: 'text',
              value: $translate.instant('careChatTpl.defaultOrgText'),
              label: $translate.instant('careChatTpl.defaultOrgLabel')
            }]
          },
          'field1': {
            attributes: [{
              name: 'required',
              type: 'radio',
              value: 'required',
              options: REQUIRED_OPTIONS
            }, {
              name: 'categoryText',
              type: 'select',
              label: $translate.instant('careChatTpl.categoryLabel'),
              defaultValue: '',
              value: vm.getCategoryTypeObject('customerInfo'),
              options: CATEGORY_TYPE_OPTIONS
            }, {
              name: 'label',
              type: 'text',
              label: $translate.instant('careChatTpl.label'),
              defaultValue: '',
              value: $translate.instant('careChatTpl.defaultNameText')
            }, {
              name: 'hintText',
              type: 'text',
              label: $translate.instant('careChatTpl.hintText'),
              defaultValue: '',
              value: $translate.instant('careChatTpl.defaultNameHint')
            }, {
              name: 'type',
              type: 'select',
              label: $translate.instant('careChatTpl.type'),
              value: vm.getTypeObject('name'),
              defaultValue: '',
              options: TYPE_OPTIONS
            }]
          },

          'field2': {
            attributes: [{
              name: 'required',
              type: 'radio',
              value: 'required',
              options: REQUIRED_OPTIONS
            }, {
              name: 'categoryText',
              type: 'select',
              label: $translate.instant('careChatTpl.categoryLabel'),
              defaultValue: '',
              value: vm.getCategoryTypeObject('customerInfo'),
              options: CATEGORY_TYPE_OPTIONS
            }, {
              name: 'label',
              type: 'text',
              label: $translate.instant('careChatTpl.label'),
              defaultValue: $translate.instant('careChatTpl.defaultEmailText'),
              value: $translate.instant('careChatTpl.defaultEmailText')
            }, {
              name: 'hintText',
              type: 'text',
              label: $translate.instant('careChatTpl.hintText'),
              defaultValue: '',
              value: $translate.instant('careChatTpl.defaultEmail')
            }, {
              name: 'type',
              type: 'select',
              label: $translate.instant('careChatTpl.type'),
              value: vm.getTypeObject('email'),
              defaultValue: '',
              options: TYPE_OPTIONS
            }]
          },

          'field3': {
            attributes: [{
              name: 'required',
              type: 'radio',
              value: 'optional',
              options: REQUIRED_OPTIONS
            }, {
              name: 'categoryText',
              type: 'select',
              label: 'Category',
              defaultValue: '',
              value: vm.getCategoryTypeObject('customerInfo'),
              options: CATEGORY_TYPE_OPTIONS
            }, {
              name: 'label',
              type: 'text',
              label: $translate.instant('careChatTpl.label'),
              defaultValue: $translate.instant('careChatTpl.defaultQuestionText'),
              value: $translate.instant('careChatTpl.defaultQuestionText')
            }, {
              name: 'hintText',
              type: 'text',
              label: $translate.instant('careChatTpl.hintText'),
              defaultValue: '',
              value: $translate.instant('careChatTpl.field3HintText')
            }, {
              name: 'type',
              type: 'select',
              label: $translate.instant('careChatTpl.type'),
              value: vm.getTypeObject('category'),
              defaultValue: '',
              options: TYPE_OPTIONS
            }]
          }
        }
      }
    };

    vm.activeItem = undefined;

    /**
     * Utility Methods Section
     */

    vm.getFieldByName = function (fieldName) {
      return vm.model.customerInfo.fields[fieldName];
    };

    vm.getAttributeByName = function (attributeName, fieldName) {
      var fields = vm.model.customerInfo.fields;
      var foundAttribute;
      if (typeof fieldName !== 'undefined' && fields.hasOwnProperty(fieldName.toString())) {
        for (var key in fields[fieldName].attributes) {
          if (fields[fieldName].attributes.hasOwnProperty(key)) {
            var attribute = fields[fieldName].attributes[key];
            if (attribute.name == attributeName) {
              foundAttribute = attribute;
            }
          }
        }
      }
      return foundAttribute;
    };

    vm.getAttributeParam = function (paramName, attributeName, fieldName) {
      var attribute = vm.getAttributeByName(attributeName, fieldName);
      if (typeof attribute !== 'undefined' && attribute.hasOwnProperty(paramName.toString())) {
        return attribute[paramName.toString()];
      }
    };

    vm.setActiveItem = function (val) {
      vm.activeItem = vm.getFieldByName(val.toString());
    };

    vm.isDynamicFieldType = function (val) {
      return typeof val !== 'undefined' && vm.model.customerInfo.fields.hasOwnProperty(val.toString());
    };

    vm.isStaticFieldType = function (val) {
      return typeof val !== 'undefined' && vm.STATIC_FIELD_TYPES.hasOwnProperty(val.toString());
    };

    vm.isDefined = function (object, field) {
      var value = object[field];
      return typeof value !== 'undefined' && value.trim() !== '';
    };

    vm.translate = $translate.instant;
  }
})();
