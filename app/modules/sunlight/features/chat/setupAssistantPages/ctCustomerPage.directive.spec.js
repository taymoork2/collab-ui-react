'use strict';

describe('Customer Screen Directive', function () {
  var $compile, $scope;
  var view;

  beforeEach(module('Sunlight'));
  beforeEach(inject(dependencies));
  beforeEach(compileView);

  function dependencies(_$compile_, $rootScope) {
    $compile = _$compile_;
    $scope = $rootScope.$new();
  }

  function compileView() {
    var template = '<div id="dummyRootDiv"><div id="dummyPrevSel" class="active"></div>' 
                    + '<div id="dummyContainerDiv" selectable class="ct-selectable-container"></div>'
                    + '<div id="dummyElementDiv" selectable><div id="dummySelectableChild" ' 
                    + 'class="ct-selectable-element"></div>'
                    + '<div id="dummyChild"></div></div></div>';
    view = $compile(angular.element(template))($scope);
    $scope.$apply();
  }

  describe('selectable directive', function () {
    
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

});
