  'use strict';

  describe('Service:AAScrollBar', function () {
    var $timeout, $compile, $rootScope, $scope, $q;
    var AAScrollBar, container, target0, target1;

    beforeEach(angular.mock.module('uc.autoattendant'));
    beforeEach(angular.mock.module('Huron'));
    beforeEach(inject(function (_$timeout_, _$compile_, _$rootScope_, _AAScrollBar_) {
      $timeout = _$timeout_;
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();

      AAScrollBar = _AAScrollBar_;

      container = angular.element("<><div style='height:100px;' id='builderScrollContainer' cs-scroll></div></body>");
      target0 = angular.element("<div style='height:20px;' id='testTarget0'></div>");
      target1 = angular.element("<div style='height:200px;' id='testTarget1'></div>");
      container.appendTo(target0);
      container.appendTo(target1);

      $compile(container)($scope);
      $scope.$apply();

      // spies on jquery functions
      spyOn($.fn, 'getNiceScroll');
      spyOn($.fn, 'animate');
    }));

    afterEach(function () {});

    describe('resizeBuilderScrollBar: ', function () {

      it('resize the scrollbar', function () {
        expect(container.getNiceScroll).not.toHaveBeenCalled();

        AAScrollBar.resizeBuilderScrollBar();
        expect(container.getNiceScroll).not.toHaveBeenCalled();

        $timeout.flush();
        expect(container.getNiceScroll).toHaveBeenCalled();
      });

      it('resize the scrollbar after given delay', function () {
        expect(container.getNiceScroll).not.toHaveBeenCalled();

        AAScrollBar.resizeBuilderScrollBar(500);
        expect(container.getNiceScroll).not.toHaveBeenCalled();
        $timeout.flush(499);
        expect(container.getNiceScroll).not.toHaveBeenCalled();

        $timeout.flush();
        expect(container.getNiceScroll).toHaveBeenCalled();
      });

    });

    describe('scrollBuilderToTarget:', function () {

      it('just return if there is no target', function () {
        AAScrollBar.scrollBuilderToTarget();
        expect(container.getNiceScroll).not.toHaveBeenCalled();
        expect(container.animate).not.toHaveBeenCalled();

        $timeout.flush();
        expect(container.getNiceScroll).not.toHaveBeenCalled();
        expect(container.animate).not.toHaveBeenCalled();
      });

      it('handle a valid target that does not need scrolling, return after given delay', function () {
        AAScrollBar.scrollBuilderToTarget("#testTarget0", AAScrollBar.delay.LONG);
        expect(container.getNiceScroll).not.toHaveBeenCalled();
        expect(container.animate).not.toHaveBeenCalled();

        $timeout.flush(AAScrollBar.delay.LONG - 1);
        expect(container.getNiceScroll).not.toHaveBeenCalled();
        expect(container.animate).not.toHaveBeenCalled();

        $timeout.flush();
        expect(container.getNiceScroll).toHaveBeenCalled();
        expect(container.animate).not.toHaveBeenCalled();
      });

      it('handle valid target that needs scrolling', function () {
        spyOn($.fn, 'outerHeight').and.returnValue(AAScrollBar.delay.SHORT);

        expect(container.getNiceScroll).not.toHaveBeenCalled();
        expect(container.animate).not.toHaveBeenCalled();

        AAScrollBar.scrollBuilderToTarget("#testTarget1");
        expect(container.getNiceScroll).not.toHaveBeenCalled();
        expect(container.animate).not.toHaveBeenCalled();

        $timeout.flush();
        expect(container.getNiceScroll).toHaveBeenCalled();
        expect(container.animate).toHaveBeenCalled();
      });

    });

  });
