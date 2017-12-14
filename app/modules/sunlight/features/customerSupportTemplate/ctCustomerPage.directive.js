/**
 * Custom directives to support form rendering
 */
(function () {
  'use strict';

  angular
    .module('Sunlight')
    .directive('selectable', Selectable)
    .directive('ctCustomerForm', CustomerForm);

  var KeyCodes = require('modules/core/accessibility').KeyCodes;

  /**
   * Handles special rendering for selected element. It supports highlighting elements as well as container
   * with the ct-selectable-element and ct-selectable-container css classes resp
   */
  function Selectable() {
    return {
      restrict: 'A',
      link: function (scope, element) {
        element.bind('click focus', function () {
          //Remove active class from previous selection
          $('.active').each(function () {
            $(this).removeClass('active');
          });

          //Make all children which are selectable and mark them active
          element
            .find('.ct-selectable-element')
            .addClass('active');

          //If the current element is container, mark it active
          if (element.hasClass('ct-selectable-container')) {
            element.addClass('active');
          }
        });
      },
    };
  }

  /**
   * Renders a form given the fields of the form.
   * Can handle label, fieldType(category: rendered as an option and others: rendered as text box), placeHolder, isRequired
   *
   * Allowed attributes
   *
   * ctModel = ct-model* : Can pass the encapsulating scope or any container which can be used to interact with model of selected fields
   * fields = fields* : List of field which needs to be rendered in the form
   * ignoreFields = @ignore-fields : Fields to be ignored from the collection passed as fields, this can be passed as string
   *  representation of json array
   * typeAttr = @type-attr : Param name for type of the field (email, id, name, phone, category)
   * labelAttr = @label-attr : Param name for field label
   * placeholderAttr = @placeholder-attr : Param name for Placeholder text
   * requiredAttr = @required-attr : Param name for isRequired field
   * categoryAttr = @category-attr : Param name for category field
   *
   * ex -
   * <code>
   * var fields = {
   *        field1": {
   *          attributes: [
   *            {name: 'clabel', value: 'LABEL'},
   *            {name: 'chintText',value: 'HINT_TEXT'},
   *            {name: 'ccategory',value: 'CATEGORY'},
   *            {name: 'ctype',value: 'name'},
   *            {name: 'crequired',value: 'optional'}
   *          ]
   *        }
   *       }
   * element -
   * <ct-customer-form ct-model="selected" fields="fields" label-attr="clabel" category-attr="ccategory" type-attr="ctype" required-attr="crequired" placeholder-attr="chintText"></ct-customer-form>
   * </code>
   */
  function CustomerForm() {
    return {
      restrict: 'AE',
      template: require('modules/sunlight/features/customerSupportTemplate/wizardPages/ctCustomerForm.tpl.html'),
      controller: ['$element', '$scope', CustomerFormController],
      scope: {
        fields: '=',
        ignoreFields: '@',
        ctModel: '=',
        typeAttr: '@',
        labelAttr: '@',
        placeholderAttr: '@',
        requiredAttr: '@',
        categoryAttr: '@',
        mediaTypeAttr: '=',
      },
    };
  }

  function CustomerFormController($element, $scope) {
    $scope.getLabel = function (field) {
      return getAttribute(field, $scope.labelAttr || 'label');
    };

    $scope.isRequired = function (field) {
      return getAttribute(field, $scope.requiredAttr || 'required');
    };

    $scope.getPlaceholder = function (field) {
      return getAttribute(field, $scope.placeholderAttr || 'hintText');
    };

    $scope.getCategory = function (field) {
      return getAttribute(field, $scope.categoryAttr || 'category');
    };

    $scope.getType = function (field) {
      return getAttribute(field, $scope.typeAttr || 'type');
    };

    $scope.setActiveItem = function (field, fieldName) {
      $scope.ctModel.activeItemName = fieldName;
      $scope.ctModel.activeItem = field;
    };

    $scope.goToActiveItems = function ($event) {
      switch ($event.which) {
        case KeyCodes.ENTER:
        case KeyCodes.SPACE:
          angular.element('[name="requiredOptions"]').focus();
          break;
      }
    };

    $scope.getMediaTypeAttr = function () {
      return $scope.mediaTypeAttr;
    };

    $scope.getFilteredFields = function (fields) {
      var ignoreFields = [];
      try {
        ignoreFields = JSON.parse($scope.ignoreFields);
      } catch (e) {
        //ignore
      }
      var data = _.pickBy(fields, function (val, key) {
        return !_.includes(ignoreFields, key);
      });
      return sortObjectByKeyName(data);
    };

    $scope.phone = '+12345556789';

    $scope.getPhoneNumber = function () {
      // var defaultPhoneNumber = $scope.getPlaceholder(field);
      // $scope.phone = defaultPhoneNumber || '+12345556789';
      return $scope.phone;
    };

    var getAttribute = function (field, attributeName) {
      var attr = _.find(field.attributes, {
        name: attributeName,
      });
      if (attr) {
        return attr.value;
      }
    };

    function sortObjectByKeyName(o) {
      var sorted = {};
      var key, a = [];

      for (key in o) {
        if (o.hasOwnProperty(key)) {
          a.push(key);
        }
      }

      a.sort();

      for (key = 0; key < a.length; key++) {
        sorted[a[key]] = o[a[key]];
      }
      return sorted;
    }
  }
})();
