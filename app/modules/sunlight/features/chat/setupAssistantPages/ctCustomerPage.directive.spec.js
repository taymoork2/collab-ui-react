'use strict';

describe('Customer Screen Directive', function () {
  var $compile, $scope;
  var view;

  beforeEach(module('Sunlight'));
  beforeEach(inject(dependencies));
  beforeEach(injectScope);

  var selected = {};
  var fields = {
    "field1": {
      attributes: [{
        name: 'label',
        value: 'LABEL'
      }, {
        name: 'hintText',
        value: 'HINT_TEXT'
      }, {
        name: 'category',
        value: 'CATEGORY'
      }, {
        name: 'type',
        value: 'name'
      }, {
        name: 'required',
        value: 'optional'
      }]
    },
    "field2": {
      attributes: [{
        name: 'label',
        value: 'LABEL2'
      }, {
        name: 'hintText',
        value: 'HINT_TEXT2'
      }, {
        name: 'category',
        value: 'CATEGORY2'
      }, {
        name: 'type',
        value: 'name2'
      }, {
        name: 'required',
        value: 'required'
      }]
    },
    "ignoreField": {
      attributes: [{
        name: 'label',
        value: 'I_LABEL'
      }, {
        name: 'hintText',
        value: 'I_HINT_TEXT'
      }, {
        name: 'category',
        value: 'I_CATEGORY'
      }, {
        name: 'type',
        value: 'name'
      }, {
        name: 'required',
        value: 'optional'
      }]
    }
  };

  var fieldsWithCustomLabels = {
    "field1": {
      attributes: [{
        name: 'clabel',
        value: 'LABEL'
      }, {
        name: 'chintText',
        value: 'HINT_TEXT'
      }, {
        name: 'ccategory',
        value: 'CATEGORY'
      }, {
        name: 'ctype',
        value: 'name'
      }, {
        name: 'crequired',
        value: 'optional'
      }]
    }
  };

  function injectScope() {
    $scope.selected = {};
    $scope.fields = fields;
    $scope.fieldsWithCustomLabels = fieldsWithCustomLabels;
  }

  function dependencies(_$compile_, $rootScope) {
    $compile = _$compile_;
    $scope = $rootScope.$new();
  }

  function compileView() {
    var template = '<div id="dummyRootDiv">' +
      '<div id="dummyPrevSel" class="active"></div>' +
      '<div id="dummyContainerDiv" selectable class="ct-selectable-container"></div>' +
      '<div id="dummyElementDiv" selectable>' +
      '<div id="dummySelectableChild" class="ct-selectable-element"></div>' +
      '<div id="dummyChild"></div>' +
      '</div>' +
      '<div id="multiField">' +
      '<ct-customer-form ct-model="selected" fields="fields"></ct-customer-form>' +
      '</div>' +
      '<div id="multiFieldWithIgnore">' +
      '<ct-customer-form ct-model="selected" fields="fields" ignore-fields=\'["ignoreField"]\'></ct-customer-form>' +
      '</div>' +
      '<div id="multiFieldWithCustomParams">' +
      '<ct-customer-form ct-model="selected" fields="fieldsWithCustomLabels" label-attr="clabel" category-attr="ccategory" type-attr="ctype" required-attr="crequired" placeholder-attr="chintText"></ct-customer-form>' +
      '</div>' +
      '</div>';
    view = $compile(angular.element(template))($scope);
    $scope.$apply();
  }

  describe('selectable directive', function () {
    beforeEach(compileView);

    it('should remove active class from previously selected element, on click of another selectable div', function () {
      $('body').append(view[0]);
      view.find("#dummyContainerDiv").click();
      expect(view.find("#dummyPrevSel").prop("class")).toBe('');
      $('#dummyRootDiv').remove();
    });

    it('should select a selectable container, on click', function () {
      view.find("#dummyContainerDiv").click();
      expect(view.find("#dummyContainerDiv").prop("class")).toBe("ct-selectable-container active");
    });

    it('should select the selectable child of a selectable element div, on click', function () {
      view.find("#dummyElementDiv").click();
      expect(view.find("#dummySelectableChild").prop("class")).toBe("ct-selectable-element active");
      expect(view.find("#dummyChild").prop("class")).toBe("");
    });

  });

  describe("The ct-customer-form directive", function () {
    beforeEach(compileView);
    it("Given the field model, should be able to render label, placeholder, required and type field correctly", function () {
      expect(view.find("#multiField #label-field1").html()).toBe('LABEL');
      expect(view.find("#multiField #text-field1").text()).toBe('');
      expect(view.find("#multiField #text-field1").attr('placeholder')).toBe('HINT_TEXT');
      expect(view.find("#multiField #opt-field1").html()).toBe('careChatTpl.optionalText');
      expect(view.find("#multiField #label-field2").html()).toBe('LABEL2');
    });
    it("Given the field model, it should not paint the ignored field", function () {
      expect(view.find("#multiFieldWithIgnore #label-ignoreField").text()).toBe('');
      expect(view.find("#multiField #label-ignoreField").text()).toBe('I_LABEL');
      expect(view.find("#multiFieldWithIgnore #label-field1").text()).toBe('LABEL');
    });
    it("Given the field model, should be able to render label, placeholder, required and type field correctly with custom params", function () {
      expect(view.find("#multiFieldWithCustomParams #label-field1").html()).toBe('LABEL');
      expect(view.find("#multiFieldWithCustomParams #text-field1").text()).toBe('');
      expect(view.find("#multiFieldWithCustomParams #text-field1").attr('placeholder')).toBe('HINT_TEXT');
      expect(view.find("#multiFieldWithCustomParams #opt-field1").html()).toBe('careChatTpl.optionalText');
    });
  });
});
