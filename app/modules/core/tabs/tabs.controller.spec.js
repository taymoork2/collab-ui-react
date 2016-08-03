(function () {
  'use strict';

  describe('Controller: TabsCtrl', function () {
    var tabsController, $q, $controller, $rootScope, injectedRootScope, $scope, $location, Authinfo, Auth, UrlConfig, $httpBackend, $provide, $injector;
    var userService = {};
    // var AuthinfoService;
    var featureToggleService = {
      supports: function () {}
    };
    var tabConfig;

    var defaultConfig = {
      restrictedStates: {
        customer: [],
        partner: []
      },
      publicStates: [],
      ciscoOnly: [],
      ciscoOrgId: '',
      ciscoMockOrgId: '',
      roleStates: {},
      serviceStates: {}
    };
    var defaultUser = {
      name: 'Test',
      orgId: 'abc',
      orgName: 'DEADBEEF',
      addUserEnabled: false,
      entitleUserEnabled: false,
      services: [],
      roles: [],
      managedOrgs: [],
      setupDone: true
    };

    var states;

    beforeEach(angular.mock.module('Core'));
    beforeEach(angular.mock.module(function (_$provide_) {
      $provide = _$provide_;
      $provide.value("FeatureToggleService", featureToggleService);
    }));

    beforeEach(inject(function (_$controller_, _$rootScope_, _$location_, _$q_, _Authinfo_, _Auth_, _UrlConfig_, _$httpBackend_, _$injector_) {
      $q = _$q_;
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      injectedRootScope = _$rootScope_;
      $location = _$location_;
      Authinfo = _Authinfo_;
      Auth = _Auth_;
      UrlConfig = _UrlConfig_;
      $httpBackend = _$httpBackend_;
      $injector = _$injector_;

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
      $provide.value('tabConfig', tabConfig);
      states = ['tab1', 'subTab1', 'subTab2', 'devTab', 'subDevTab'];
    }));

    function initTabsController(args, dontApply) {
      $scope.ttt = 'test1';
      injectedRootScope.tykk = 'test2';
      var v = _.merge({
        $scope: $scope,
        $rootScope: injectedRootScope
      }, args ? args : {});
      tabsController = $controller('TabsCtrl',
        v
      );

      if (!dontApply) {
        $scope.$apply();
        injectedRootScope.$apply();
      }
    }

    //from authinfo
    describe('autorize', function () {
      beforeEach(function () {
        UrlConfig.getAdminServiceUrl = sinon.stub().returns('path/');
      });

      describe('given user is not admin', function () {

        beforeEach(function () {
          UrlConfig.getMessengerServiceUrl = sinon.stub().returns('msn');
          $httpBackend
            .expectGET('path/userauthinfo')
            .respond(200, {
              orgId: 1337,
              services: [{
                ciService: 'foo',
                sqService: 'bar',
              }],
              roles: ['User', 'WX2_User']
            });
          $httpBackend
            .expectGET('msn/orgs/1337/cisync/')
            .respond(200, {});
        });
        it('will initialize tabs if not admin', function (done) {
          tabConfig.push({
            tab: 'tabbover',
            state: 'overview'
          });
          Auth.authorize().then(function () {

            initTabsController({}, true);
            expect(tabsController.tabs).toBeDefined();
            expect(tabsController.tabs.length).toBeGreaterThan(0);
            _.defer(done);
          });

          $httpBackend.flush();
        });
      });

      describe('given admin has read only role', function () {

        beforeEach(function () {
          UrlConfig.getMessengerServiceUrl = sinon.stub().returns('msn');
          $httpBackend
            .expectGET('path/userauthinfo')
            .respond(200, {
              orgId: 1337,
              services: [{
                ciService: 'foo',
                sqService: 'bar'
              }]
            });
          $httpBackend
            .expectGET('msn/orgs/1337/cisync/')
            .respond(200, {});
        });

        it('will update account info and initialize tabs', function (done) {
          Authinfo.isReadOnlyAdmin = sinon.stub().returns(true);
          Authinfo.getOrgId = sinon.stub().returns(42);
          Authinfo.updateAccountInfo = sinon.stub();

          $httpBackend
            .expectGET('path/customers?orgId=42')
            .respond(200, {});

          Auth.authorize().then(function () {
            initTabsController({}, true);
            _.defer(done);
          });

          $httpBackend.flush();

          // expect(Authinfo.initializeTabs.callCount).toBe(1);
          expect(Authinfo.updateAccountInfo.callCount).toBe(1);
        });

      });

      it('should remove all tabs not allowed', function () {
        var Authinfo = setupUser();

        initTabsController({
          Authinfo: Authinfo
        });
        expect(tabsController.tabs).toEqual([]);
      });

      it('should remove a single tab that is not allowed', function () {
        setupConfig({
          publicStates: _.difference(states, ['tab1'])
        });
        var Authinfo = setupUser();

        _.remove(tabConfig, {
          state: 'tab1'
        });

        initTabsController({
          Authinfo: Authinfo
        });
        expect(tabsController.tabs).toEqual(setAllTabsActive(tabConfig, false));
      });

      it('should remove a single subPage that is not allowed', function () {
        setupConfig({
          publicStates: _.difference(states, ['subTab1'])
        });
        var Authinfo = setupUser();

        _.remove(tabConfig[1].subPages, {
          state: 'subTab1'
        });
        initTabsController({
          Authinfo: Authinfo
        });
        expect(tabsController.tabs).toEqual(setAllTabsActive(tabConfig, false));
      });

      it('should remove a subPage parent if all subPages are not allowed', function () {
        setupConfig({
          publicStates: _.difference(states, ['subTab1', 'subTab2'])
        });
        var Authinfo = setupUser();

        _.remove(tabConfig, {
          tab: 'tabMenu'
        });
        initTabsController({
          Authinfo: Authinfo
        });
        expect(tabsController.tabs).toEqual(setAllTabsActive(tabConfig, false));
      });

      it('should keep tab structure if all pages are allowed', function () {
        setupConfig({
          publicStates: states
        });
        var Authinfo = setupUser();

        initTabsController({
          Authinfo: Authinfo
        });
        expect(tabsController.tabs).toEqual(setAllTabsActive(tabConfig, false));
      });

      it('should remove hideProd tabs and subPages of hideProd tabs if in production', function () {
        setupConfig({
          publicStates: states,
          isProd: function () {
            return true;
          }
        });
        var Authinfo = setupUser();
        _.remove(tabConfig, {
          tab: 'devTab'
        });
        _.remove(tabConfig, {
          tab: 'devMenu'
        });

        initTabsController({
          Authinfo: Authinfo
        });
        expect(tabsController.tabs).toEqual(setAllTabsActive(tabConfig, false));
      });
    });

    //end from authinfo
    it('should initialize with tabs', function () {
      spyOn(Authinfo, 'isAllowedState').and.returnValue(true);
      initTabsController();
      expect(tabsController.tabs).toEqual(setAllTabsActive(tabConfig, false));
    });

    it('should not have active tabs without a location', function () {
      spyOn(Authinfo, 'isAllowedState').and.returnValue(true);
      initTabsController();
      expect(hasActiveTab()).toBeFalsy();
    });

    it('should update active tab on state change location match', function () {
      spyOn(Authinfo, 'isAllowedState').and.returnValue(true);
      $location.path.and.returnValue('tab1Path');
      initTabsController();
      broadcastEvent('$stateChangeSuccess');

      expect(hasActiveTab('tab1')).toBeTruthy();
      expect(hasActiveTab('tabMenu')).toBeFalsy();
    });

    it('should clear active tab on state change ', function () {
      spyOn(Authinfo, 'isAllowedState').and.returnValue(true);
      $location.path.and.returnValue('tab1Path');
      initTabsController();
      broadcastEvent('$stateChangeSuccess');

      expect(hasActiveTab('tab1')).toBeTruthy();
      expect(hasActiveTab('tabMenu')).toBeFalsy();

      $location.path.and.returnValue('unknown-tab-path');
      broadcastEvent('$stateChangeSuccess');
      expect(hasActiveTab('tab1')).toBeFalsy();
      expect(hasActiveTab('tabMenu')).toBeFalsy();
    });

    it('should update active subPage tab on state change location match', function () {
      spyOn(Authinfo, 'isAllowedState').and.returnValue(true);
      $location.path.and.returnValue('dummy-path');
      initTabsController();

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
        $provide.value('tabConfig', tabConfig);
        spyOn(Authinfo, 'isAllowedState').and.returnValue(true);
        // Authinfo.getTabs.and.returnValue(tabConfig);
        initTabsController();
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
        spyOn(Authinfo, 'isAllowedState').and.returnValue(true);
        spyOn(featureToggleService, 'supports').and.returnValue($q.when(featureIsEnabled));
        // featureToggleService.supports = jasmine.stub().and.returnValue($q.when(featureIsEnabled));
        initTabsController();
        broadcastEvent('TABS_UPDATED');
        $scope.$apply();
        expect(_.some(tabsController.tabs, {
          tab: tab
        })).toBe(expectedResult);
      };
      it('a tab with a feature toggle should be gone when feature is not available', function () {
        performFeatureToggleTest('featureDependent', 'tab-feature-test', false, false);
      });

      it('a tab with a feature toggle should be visible when feature is available', function () {
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
      injectedRootScope.$broadcast(event);
      injectedRootScope.$apply();
    }

    function hasActiveTab(name) {
      if (name) {
        return _.some(tabsController.tabs, {
          tab: name,
          isActive: true
        });
      } else {
        return _.some(tabsController.tabs, 'isActive');
      }
    }

    function setupUser(override) {
      override = override || {};
      // var Authinfo = AuthinfoService();
      var userData = angular.extend({}, defaultUser, override);
      Authinfo.initialize(userData);
      return Authinfo;
    }

    function setupConfig(override) {
      override = override || {};
      var Config = $injector.get('Config');
      angular.extend(Config, defaultConfig, override);
    }

    function setAllTabsActive(tabs, activeState) {
      return _.map(tabs, function (tab) {
        tab.isActive = activeState;
        return tab;
      });
    }
  });
})();
