  'use strict';

  describe('Service:AAScrollBar', function () {
    var $timeout, $compile, $rootScope, $scope;
    var AAScrollBar, container, target0, target1;

    beforeEach(angular.mock.module('uc.autoattendant'));
    beforeEach(angular.mock.module('Huron'));
    beforeEach(inject(function (_$timeout_, _$compile_, _$rootScope_, _AAScrollBar_) {
      $timeout = _$timeout_;
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();

      AAScrollBar = _AAScrollBar_;

      container = angular.element("<><div style='height:100px;' id='builderScrollContainer' ></div></body>");
      target0 = angular.element("<div style='height:20px;' id='testTarget0'></div>");
      target1 = angular.element("<div style='height:200px;' id='testTarget1'></div>");
      container.appendTo(target0);
      container.appendTo(target1);

      $compile(container)($scope);
      $scope.$apply();

      // spies on jquery functions
      spyOn($.fn, 'animate');
    }));

    afterEach(function () {});

    describe('scrollBuilderToTarget:', function () {

      it('just return if there is no target', function () {
        AAScrollBar.scrollBuilderToTarget();
        expect(container.animate).not.toHaveBeenCalled();

        $timeout.flush();
        expect(container.animate).not.toHaveBeenCalled();
      });

      it('handle a valid target that does not need scrolling, return after given delay', function () {
        AAScrollBar.scrollBuilderToTarget("#testTarget0");
        expect(container.animate).not.toHaveBeenCalled();

        $timeout.flush();
        expect(container.animate).not.toHaveBeenCalled();
      });

      it('handle valid target that needs scrolling', function () {
        spyOn($.fn, 'outerHeight').and.returnValue(400);
        AAScrollBar.scrollBuilderToTarget("#testTarget1");
        expect(container.animate).not.toHaveBeenCalled();

        $timeout.flush();
        expect(container.animate).toHaveBeenCalled();
      });

    });

  });
