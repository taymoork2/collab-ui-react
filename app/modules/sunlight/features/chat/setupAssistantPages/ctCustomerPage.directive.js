(function () {
  'use strict';

  angular
    .module('Sunlight')
    .directive('selectable', Selectable)
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
     * typeParam = @type-param* : Param name for type of the field (email, id, name, phone, category)
     * labelParam = @label-param* : Param name for field label
     * placeholderParam = @placeholder-param* : Param name for Placeholder text
     * requiredParam = @required-param* : Param name for isRequired field
     * categoryParam = @category-param* : Param name for category field
     */
    .directive('ctCustomerForm', CustomerForm);

  function Selectable() {
    return {
      restrict: 'A',
      link: function (scope, element) {
        element.bind('click', function () {
          //Remove active class from previous selection
          $(".active").each(function () {
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

          //Hack to effect 'active' changes for tags inside a directive
          element
            .find('.ct-selectable-cs-select')
            .addClass('active');
        });
      }
    };
  }

  function CustomerForm() {
    return {
      restrict: 'AE',
      templateUrl: 'modules/sunlight/features/chat/setupAssistantPages/ctCustomerForm.tpl.html',
      controller: ['$scope', CustomerFormController],
      scope: {
        fields: '=',
        ignoreFields: '@',
        ctModel: '=',
        typeParam: '@',
        labelParam: '@',
        placeholderParam: '@',
        requiredParam: '@',
        categoryParam: '@'
      }
    };
  }

  function CustomerFormController($scope) {
    $scope.getLabel = function (field) {
      return getAttribute(field, $scope.labelParam || 'label');
    };

    $scope.isRequired = function (field) {
      return getAttribute(field, $scope.requiredParam || 'required');
    };

    $scope.getPlaceholder = function (field) {
      return getAttribute(field, $scope.placeholderParam || 'hintText');
    };

    $scope.getCategory = function (field) {
      return getAttribute(field, $scope.categoryParam || 'category');
    };

    $scope.getType = function (field) {
      return getAttribute(field, $scope.typeParam || 'type');
    };

    $scope.setActiveItem = function (field) {
      $scope.ctModel.activeItem = field;
    };

    $scope.getFilteredFields = function (fields) {
      var ignoreFields = [];
      try {
        ignoreFields = JSON.parse($scope.ignoreFields);
      } catch (e) {
        //ignore
      }
      return _.pick(fields, function (val, key) {
        return !_.contains(ignoreFields, key);
      });
    };

    var getAttribute = function (field, attributeName) {
      var attr = _.find(field.attributes, {
        name: attributeName
      });
      if (attr) {
        return attr.value;
      }
    };
  }
})();
