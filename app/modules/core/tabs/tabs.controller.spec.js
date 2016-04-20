(function () {
  'use strict';

  describe('Controller: TabsCtrl', function () {
    var controller, $controller, $rootScope, $scope, $location, Authinfo;
    var tabConfig;

    beforeEach(module('Core'));

    beforeEach(inject(function (_$controller_, _$rootScope_, _$location_, _Authinfo_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      $location = _$location_;
      Authinfo = _Authinfo_;

      tabConfig = [{
        tab: 'tab1',
        icon: 'tab1.icon',
        title: 'tab1.title',
        state: 'tab1',
        link: '/tab1Path'
      }, {
        tab: 'tabMenu',
        icon: 'tabMenu.icon',
        title: 'tabMenu.title',
        subPages: [{
          tab: 'subTab1',
          icon: 'subTab1.icon',
          title: 'subTab1.title',
          desc: 'subTab1.desc',
          state: 'subTab1',
          link: '/subTab1Path'
        }, {
          tab: 'subTab2',
          icon: 'subTab2.icon',
          title: 'subTab2.title',
          desc: 'subTab2.desc',
          state: 'subTab2',
          link: '/subTab2Path'
        }]
      }];

      spyOn($location, 'path');
      spyOn(Authinfo, 'getTabs').and.returnValue(tabConfig);

      controller = $controller('TabsCtrl', {
        $scope: $scope
      });
      $scope.$apply();
    }));

    it('should initialize with tabs', function () {
      expect($scope.tabs).toEqual(tabConfig);
    });

    it('should not have active tabs without a location', function () {
      expect(hasActiveTab()).toBeFalsy();
    });

    it('should update active tab on state change location match', function () {
      $location.path.and.returnValue('tab1Path');
      broadcastEvent('$stateChangeSuccess');

      expect(hasActiveTab('tab1')).toBeTruthy();
      expect(hasActiveTab('tabMenu')).toBeFalsy();
    });

    it('should update active subPage tab on state change location match', function () {
      $location.path.and.returnValue('subTab1Path');
      broadcastEvent('$stateChangeSuccess');

      expect(hasActiveTab('tab1')).toBeFalsy();
      expect(hasActiveTab('tabMenu')).toBeTruthy();
    });

    describe('tab structure change', function () {
      beforeEach(function () {
        tabConfig = [{
          tab: 'tab3',
          icon: 'tab3.icon',
          title: 'tab3.title',
          state: 'tab3',
          link: '/tab3Path'
        }];
        Authinfo.getTabs.and.returnValue(tabConfig);
        $location.path.and.returnValue('tab3Path');
      });

      it('should update tab structure on AuthinfoUpdated event', function () {
        broadcastEvent('AuthinfoUpdated');

        expect(hasActiveTab('tab3')).toBeTruthy();
      });

      it('should update tab structure on TABS_UPDATED event', function () {
        broadcastEvent('TABS_UPDATED');

        expect(hasActiveTab('tab3')).toBeTruthy();
      });
    });

    function broadcastEvent(event) {
      $rootScope.$broadcast(event);
      $rootScope.$apply();
    }

    function hasActiveTab(name) {
      if (name) {
        return _.some($scope.tabs, {
          tab: name,
          isActive: true
        });
      } else {
        return _.some($scope.tabs, 'isActive');
      }
    }
  });
})();
