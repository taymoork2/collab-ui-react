(function () {
  'use strict';

  angular.module('Huron')
    .factory('DragDropService', DragDropService)
    .directive('dragDrop', dragDrop)
    .directive('dropList', dropList);

  /* @ngInject */
  function DragDropService() {
    var data;
    var element;
    return {
      getData: getData,
      setData: setData,
      getElement: getElement,
      setElement: setElement
    };

    function getData() {
      return data;
    }

    function setData(d) {
      data = d;
    }

    function getElement() {
      return element;
    }

    function setElement(e) {
      element = e;
    }

  }
  /* @ngInject */
  function dragDrop($timeout, DragDropService) {
    return {
      restrict: 'A',
      scope: {
        draggable: '=',
        onEnterKey: '&'
      },
      link: function (scope, elem) {
        elem.attr('draggable', true);
        elem.attr('tabindex', '0');
        elem.on('focus', function () {
          DragDropService.setData(scope.draggable);
          DragDropService.setElement(elem);
        });

        elem.on('dragstart', function (event) {
          event = event.originalEvent || event;
          event.dataTransfer.setData('Text', angular.toJson(scope.draggable));
          event.dataTransfer.effectAllowed = 'move';
          elem.addClass('dragging');
          $timeout(function () {
            elem.addClass("dragging-source");
          }, 0);
          event.stopPropagation();
        });

        elem.on('dragend', function (event) {
          event = event.originalEvent || event;
          elem.removeClass('dragging');
          $timeout(function () {
            elem.removeClass("dragging-source");
          }, 0);
          event.stopPropagation();
        });

        elem.on('keydown', function (event) {
          scope.$apply(function () {
            if (event.keyCode === 13 && event.target === event.currentTarget) {
              scope.onEnterKey();
            } else if (event.keyCode === 38 && event.target !== event.currentTarget) {
              event.stopPropagation();
            } else if (event.keyCode === 40 && event.target !== event.currentTarget) {
              event.stopPropagation();
            }
          });
        });
      }
    };
  }

  /* @ngInject */
  function dropList($timeout, DragDropService) {
    return {
      restrict: 'A',
      scope: {
        dropList: '=',
        callback: '&',
        unique: '@'
      },
      link: function (scope, elem) {
        var placeholder = getPlaceholderElement(),
          placeholderNode = placeholder[0],
          listNode = elem[0];

        placeholder.remove();

        elem.on('keydown', function (event) {
          scope.$apply(function () {
            var objIndex = scope.dropList.indexOf(DragDropService.getData());
            var obj;
            if (event.keyCode === 38) {
              if (objIndex !== 0) {
                obj = scope.dropList[objIndex - 1];
                scope.dropList[objIndex - 1] = scope.dropList[objIndex];
                scope.dropList[objIndex] = obj;
                scope.callback();
                $timeout(function () {
                  DragDropService.getElement().focus();
                }, 0);
              }
            }
            if (event.keyCode === 40) {
              if (objIndex !== scope.dropList.length - 1) {
                obj = scope.dropList[objIndex + 1];
                scope.dropList[objIndex + 1] = scope.dropList[objIndex];
                scope.dropList[objIndex] = obj;
                scope.callback();
              }
            }
          });
          return true;
        });

        function getPlaceholderElement() {
          return angular.element('<div class="drop-placeholder "></div>');
        }

        function getPlaceholderIndex() {
          var draggingSource = angular.element('.dragging-source')[0];
          if (Array.prototype.indexOf.call(listNode.children, draggingSource) < Array.prototype.indexOf.call(listNode.children, placeholderNode)) {
            return Array.prototype.indexOf.call(listNode.children, placeholderNode) - 1;
          }
          return Array.prototype.indexOf.call(listNode.children, placeholderNode);
        }

        function isMouseInFirstHalf(event, targetNode, relativeToParent) {
          var mousePointer = (event.offsetY || event.layerY);
          var targetSize = targetNode.offsetHeight;
          var targetPosition = targetNode.offsetTop;
          targetPosition = relativeToParent ? targetPosition : 0;
          return mousePointer < targetPosition + targetSize / 2;
        }

        function stopDragover() {
          placeholder.remove();
          elem.removeClass('dragover');
          return true;
        }

        elem.on('dragover', function (event) {
          event = event.originalEvent || event;

          var listItemNode = event.target;

          while (listItemNode.parentNode !== listNode && listItemNode.parentNode) {
            listItemNode = listItemNode.parentNode;
          }

          if (listItemNode.parentNode === listNode) {
            if (isMouseInFirstHalf(event, listItemNode)) {
              listNode.insertBefore(placeholderNode, listItemNode);
            } else {
              listNode.insertBefore(placeholderNode, listItemNode.nextSibling);
            }
          }
          elem.addClass('dragover');
          event.preventDefault();
          event.stopPropagation();
          return false;
        });

        elem.on('dragleave', function () {
          elem.removeClass('dragover');
          $timeout(function () {
            if (!elem.hasClass('dragover')) {
              placeholder.remove();
              elem.removeClass('dragover');
            }
          }, 100);
        });

        elem.on('drop', function (event) {
          event = event.originalEvent || event;
          event.preventDefault();

          var data = event.dataTransfer.getData('Text') || event.dataTransfer.getData('text/plain');
          var transferredObject;
          try {
            transferredObject = JSON.parse(data);
          } catch (e) {
            return stopDragover();
          }
          var index = getPlaceholderIndex();
          var targetArray = scope.dropList;
          var objIndex;
          angular.forEach(targetArray, function (value, key) {
            if (value[scope.unique] === transferredObject[scope.unique]) {
              objIndex = key;
            }
          });
          scope.$apply(function () {
            targetArray.splice(objIndex, 1);
            targetArray.splice(index, 0, transferredObject);
          });
          if (objIndex !== index) {
            scope.callback();
          }

          stopDragover();
          event.stopPropagation();
          return false;
        });
      }
    };
  }
})();
