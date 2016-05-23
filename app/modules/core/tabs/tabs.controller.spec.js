(function () {
  'use strict';

  describe('Controller: TabsCtrl', function () {
    var controller, $q, $controller, $rootScope, $scope, $location, Authinfo;
    var userService = {};
    var featureToggleService = {
      supports: sinon.stub()
    };
    var tabConfig;

    beforeEach(module('Core'));

    beforeEach(module(function ($provide) {
      $provide.value("FeatureToggleService", featureToggleService);
      //$provide.value("HuronCustomerFeatureToggleService", huronFeature);
    }));

    beforeEach(inject(function (_$controller_, _$rootScope_, _$location_, _$q_, _Authinfo_) {
      $q = _$q_;
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

    describe('feature toggle', function () {
      var performFeatureToggleTest = function (tab, feature, featureIsEnabled, expectedResult) {
        tabConfig.push({
          tab: tab,
          feature: feature
        });
        spyOn(featureToggleService, 'supports').and.returnValue($q.when(featureIsEnabled));
        broadcastEvent('TABS_UPDATED');
        $scope.$apply();
        expect(_.some($scope.tabs, {
          tab: tab
        })).toBe(expectedResult);
      };
      it('a tab with a feature toggle should be gone when feature is not available', function () {
        performFeatureToggleTest('featureDependent', 'tab-feature-test', false, false);
      });

      it('a tab with a feature toggle should be gone when feature is not available', function () {
        performFeatureToggleTest('featureDependent', 'tab-feature-test', true, true);
      });

      it('a tab with a negated feature toggle should be visible when feature is not available', function () {
        performFeatureToggleTest('featureDependent', '!tab-feature-test', false, true);
      });

      it('a tab with a negated feature toggle should be gone when feature is available', function () {
        performFeatureToggleTest('featureDependent', '!tab-feature-test', true, false);
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
