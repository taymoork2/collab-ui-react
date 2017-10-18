(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('dynamicPrompt', DynamicPrompt);

  function DynamicPrompt($compile, $sce, $timeout, $window, AADynaAnnounceService) {
    var CONSTANTS = {};
    CONSTANTS.read = 'blur keyup change';
    CONSTANTS.defaultElementParentType = 'span';
    CONSTANTS.contentEditable = 'contentEditable';
    CONSTANTS.lastElement = '<br class="ng-scope">';
    CONSTANTS.placeHolderDataDiv = 'data-div-placeholder-content';
    CONSTANTS.textNode = 3;
    var printableCharsNotAllowed = ['<', '>'];

    return {
      restrict: 'E',
      require: '?ngModel',
      transclude: true,
      replace: true,
      scope: {
        ngModel: '=',
        insertElement: '=',
        modelValues: '=',
        dynamicTags: '=',
      },
      link: function (scope, element, attrs, ngModel) {
        if (!validate(ngModel)) {
          return;
        }
        $timeout(function () {
          setup(element, attrs, scope, ngModel);
          render(ngModel, element);
          element.on(CONSTANTS.read, function (event) {
            scope.$evalAsync(function () {
              read(event, element, scope, ngModel);
            });
          });
          read(false, element, scope, ngModel);
        });
        scope.insertElement = function (html, range) {
          scope.$evalAsync(function () {
            doFormatInsertion(html, element, scope, range);
          });
        };
      },
      template: '<div class="dynamic-prompt" contentEditable="true" ng-transclude><br></div>',
    };

    function validate(ngModel) {
      if (ngModel) {
        return true;
      } else {
        return false;
      }
    }

    function setup(element, attrs, scope, ngModel) {
      setElementAttrs(element, attrs);
      setElementScopeVals(element, scope, ngModel);
    }

    function setElementAttrs(element, attrs) {
      if (!attrs.contentEditable) {
        element.attr(CONSTANTS.contentEditable, 'true');
      }
    }

    function setElementScopeVals(element, scope, ngModel) {
      if (!scope.modelValues) {
        scope.modelValues = [];
      } else {
        recreateElementFromScope(element, scope, ngModel);
      }
    }

    function render(ngModel, element) {
      ngModel.$render = function () {
        if (ngModel.$viewValue !== element.html()) {
          element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
        }
      };
    }

    function populatePlaceholderRule(element, html) {
      if (html === CONSTANTS.lastElement) {
        element.attr(CONSTANTS.placeHolderDataDiv, 'true');
      } else if (html === '') {
        element.attr(CONSTANTS.placeHolderDataDiv, 'true');
      } else if (html === '<br>') {
        element.attr(CONSTANTS.placeHolderDataDiv, 'true');
      } else {
        element.removeAttr(CONSTANTS.placeHolderDataDiv);
      }
    }

    function read(event, element, scope, ngModel) {
      if (validateForNotAllowedChars(event)) {
        var html = element.html();
        populatePlaceholderRule(element, html);
        updateModel(element, scope);
        ngModel.$setViewValue(html);
      }
    }

    function doFormatInsertion(html, element, scope, range) {
      if (html) {
        addHtmlAtCaret(element, scope, getParentHtml(), html, range);
        placeCaretAtEnd(element);
        ensureEndingBr(element, scope, getParentHtml());
      }
      updateModel(element, scope);
    }

    function ensureEndingBr(element, scope) {
      var elementContext = element[0];
      if (elementContext.childNodes.length === 0) {
        addHtmlAtCaret(element, scope, getParentHtml(), CONSTANTS.lastElement);
      } else if (elementContext.childNodes.length === 1) {
        if (!(elementContext.childNodes[0].outerHTML === CONSTANTS.lastElement)) {
          addHtmlAtCaret(element, scope, getParentHtml(), CONSTANTS.lastElement);
        }
      } else if (elementContext.childNodes[0].outerHTML === CONSTANTS.lastElement) {
        elementContext.removeChild(elementContext.childNodes[0]);
      } else if (elementContext.childNodes[elementContext.childNodes.length - 1].outerHTML !== CONSTANTS.lastElement) {
        addHtmlAtCaret(element, scope, getParentHtml(), CONSTANTS.lastElement);
      }
    }

    function updateModel(element, scope) {
      var elementContext = element[0];
      if (elementContext) {
        scope.modelValues = [];
        if (elementContext.childNodes.length === 1) {
          var firstChild = elementContext.firstChild;
          if (firstChild && firstChild.outerHTML !== CONSTANTS.lastElement) {
            updateModelValues(elementContext, scope, firstChild, scope.modelValues);
          }
          return;
        }
        for (var i = 0; i < elementContext.childNodes.length - 1; i++) { //skip the last br
          updateModelValues(elementContext, scope, elementContext.childNodes[i], scope.modelValues);
        }
      }
    }

    function updateModelValues(parentElement, scope, node, modelValues) {
      var modelValue = getModelValueBasedOnType(scope.dynamicTags, angular.element(node)[0], node.nodeType);
      if (modelValue) {
        modelValues.push(modelValue);
      }
    }

    function getModelValueBasedOnType(checkTags, innerElement, nodeType) {
      var modelValue = {};
      if (_.indexOf(checkTags, innerElement.tagName) >= 0) {
        setDynamicModel(modelValue, innerElement);
      } else if (nodeType === CONSTANTS.textNode) {
        setPlainModel(modelValue, innerElement);
      }
      return _.isEmpty(modelValue) ? false : modelValue;
    }

    function setDynamicModel(modelValue, element) {
      var modelVal = element.attributes.modelValue;
      var model = modelVal ? modelVal.value : false || element.textContent;
      var html = element.outerHTML;
      if (model) {
        modelValue.model = model;
      }
      if (html) {
        modelValue.html = html;
      }
    }

    function setPlainModel(modelValue, element) {
      var model = element.textContent || element.innerText;
      if (model) {
        modelValue.model = model;
      }
    }

    function getParentHtml() {
      var parentValue = CONSTANTS.defaultElementParentType;
      //possible checks needed on parent type down the line
      return parentValue;
    }

    function validateForNotAllowedChars(event) {
      if (event) {
        var disallowedCharInArrayIndex = _.indexOf(printableCharsNotAllowed, event.key);
        if (_.gte(disallowedCharInArrayIndex, 0)) {
          event.preventDefault();
          //add validation components for element (no ux pattern defined yet)
          return false;
        }
      }
      return true;
    }

    function recreateElementFromScope(element, scope, ngModel) {
      var elementContext = element[0];
      if (_.gt(elementContext.childNodes.length, 0)) {
        elementContext.removeChild(elementContext.childNodes[0]);
      }
      _.each(scope.modelValues, function (model) {
        if (model.html) {
          addHtmlAtCaret(element, scope, getParentHtml(), model.html);
        } else {
          addHtmlAtCaret(element, scope, getParentHtml(), model.model);
        }
        placeCaretAtEnd(element);
      });
      ensureEndingBr(element, scope, getParentHtml());
      read(false, element, scope, ngModel);
    }

    function addHtmlAtCaret(element, scope, parentElementType, html, range) {
      element.focus();
      if (_.isUndefined(range)) {
        range = AADynaAnnounceService.getRange();
      }
      if (range) {
        range.deleteContents();
        var el = $window.document.createElement(parentElementType);
        el.setAttribute(CONSTANTS.contentEditable, 'false');
        el.innerHTML = html;
        $compile(el)(scope);
        var frag = $window.document.createDocumentFragment();
        if (!_.isNull(el.firstChild)) {
          frag.appendChild(el.firstChild);
        }
        range.insertNode(frag);
      }
    }

    function placeCaretAtEnd(element) {
      element.focus();
      if (typeof $window.getSelection != 'undefined' && typeof $window.document.createRange != 'undefined') {
        var range = $window.document.createRange();
        range.selectNodeContents(element[0]);
        range.collapse(false);
        var sel = $window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }
})();
