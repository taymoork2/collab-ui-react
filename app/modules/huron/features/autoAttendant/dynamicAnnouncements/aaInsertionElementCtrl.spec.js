'use strict';

describe('Controller: AAInsertionElementCtrl', function () {
  var AutoAttendantCeMenuModelService, AAUiModelService;
  var controller, $controller;
  var $rootScope, $scope, $window;
  var $q;
  var $modal, modal;
  var action;
  var schedule = 'openHours';
  var ui = {
    openHours: {},
  };
  var uiMenu = {};
  var menuEntry = {};
  var index = '0';
  var ele = '<aa-insertion-element element-text="testValue" read-as="testReadValue" element-id="1011"></aa-insertion-element>';

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$rootScope_, _$controller_, _$modal_, _AutoAttendantCeMenuModelService_, _AAUiModelService_, _$q_, _$window_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $controller = _$controller_;
    $modal = _$modal_;
    $scope.schedule = schedule;
    $q = _$q_;
    $scope.index = index;
    $scope.elementId = '1011';
    $window = _$window_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService.clearCeMenuMap();
    uiMenu = AutoAttendantCeMenuModelService.newCeMenu();
    ui[schedule] = uiMenu;
    menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
    uiMenu.addEntryAt(index, menuEntry);

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(ui);
    modal = $q.defer();

    controller = $controller('AAInsertionElementCtrl', {
      $scope: $scope,
    });
    $scope.$apply();
  }));

  afterEach((function () {
    $rootScope = null;
    $scope = null;
    $controller = null;
    $modal = null;
    $q = null;
    $window = null;
    AutoAttendantCeMenuModelService = null;
    AAUiModelService = null;
    uiMenu = null;
    menuEntry = null;
  }));

  describe('activate', function () {
    it('should validate controller creation', function () {
      expect(controller).toBeDefined();
      expect(controller.mainClickFn).toBeDefined();
      expect(controller.closeClickFn).toBeDefined();
    });

    describe('setUp', function () {
      beforeEach(function () {
        controller = null;
      });

      it('should validate setUp', function () {
        $scope.textValue = 'test';
        controller = $controller('AAInsertionElementCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
        expect(controller.elementText).toBe('test');
      });
    });
  });

  describe('mainClickFn', function () {
    beforeEach(function () {
      spyOn($modal, 'open').and.returnValue({
        result: modal.promise,
      });
    });

    it('elementText and readAs values should be updated upon calling mainClickFn', function () {
      action = AutoAttendantCeMenuModelService.newCeActionEntry('dynamic', '');
      action.dynamicList = [{
        say: {
          value: 'testValue',
          voice: '',
          as: 'testValue',
        },
        isDynamic: true,
        htmlModel: encodeURIComponent(ele),
      }];
      menuEntry.addAction(action);
      spyOn($rootScope, '$broadcast');
      var variableSelection = {
        label: 'testVar',
        value: 'testVal',
      };
      var readAsSelection = {
        label: 'testRead',
        value: 'testValRead',
      };
      var result = {
        variable: variableSelection,
        readAs: readAsSelection,
      };
      controller.mainClickFn();
      expect($modal.open).toHaveBeenCalled();
      modal.resolve(result);
      $scope.$apply();
      expect(controller.elementText).toBe('testVar');
      expect(controller.readAs).toBe('testValRead');
      expect($rootScope.$broadcast).toHaveBeenCalledWith('CE Updated');
    });

    it('elementText and readAs values should be updated upon calling mainClickFn from REST block', function () {
      $scope.aaElementType = 'REST';
      controller = $controller('AAInsertionElementCtrl', {
        $scope: $scope,
      });
      $scope.$apply();
      var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('dynamic', '');
      actionEntry.dynamicList = [{
        action: {
          eval: {
            value: 'testVar',
          },
        },
        isDynamic: true,
        htmlModel: encodeURIComponent(ele),
      }];
      menuEntry.addAction(actionEntry);
      var variableSelection = {
        label: 'testVar',
        value: 'testVal',
      };
      var result = {
        variable: variableSelection,
      };
      controller.mainClickFn();
      expect($modal.open).toHaveBeenCalled();
      modal.resolve(result);
      $scope.$apply();
      expect(controller.elementText).toBe('testVar');
    });
  });

  describe('closeClickFn', function () {
    var musicOnHold;
    var initialAnnouncement;
    var periodicAnnouncement;
    var fallback;
    var playAction;
    var paAction;
    var iaAction;
    var queueSettings = {};
    var routeToQueue;
    var fbAction;

    beforeEach(function () {
      var scopeElement = {
        insertElement: function (string) {
          return string;
        },
      };
      var dynamicElement = {
        scope: function () {
          return true;
        },
        focus: function () {},
        remove: function () {},
      };
      var rangeGetter = function () {
        var range = {
          collapsed: true,
          endContainer: {
            parentElement: {
              parentElement: {
                parentElement: {
                  remove: function () {
                    return '';
                  },
                },
                className: 'dynamic-prompt aa-message-height',
              },
            },
          },
        };
        return range;
      };
      spyOn(angular, 'element').and.returnValue(dynamicElement);
      spyOn(dynamicElement, 'focus');
      spyOn(dynamicElement, 'remove');
      spyOn(dynamicElement, 'scope').and.returnValue(scopeElement);
      spyOn(scopeElement, 'insertElement');
      spyOn($window, 'getSelection').and.returnValue({
        getRangeAt: rangeGetter,
        rangeCount: true,
        removeAllRanges: function () {
          return true;
        },
        addRange: function () {
          return true;
        },
      });
      $scope.dynamicElement = 'test';
      $scope.elementId = '1011';
    });
    it('should clear out elementText and readAs upon calling of closeClickFn from say Message', function () {
      action = AutoAttendantCeMenuModelService.newCeActionEntry('dynamic', '');
      action.dynamicList = [{
        say: {
          value: 'testValue',
          voice: '',
          as: 'testValue',
        },
        isDynamic: true,
        htmlModel: encodeURIComponent(ele),
      }];
      menuEntry.addAction(action);
      spyOn($rootScope, '$broadcast');
      controller.closeClickFn();
      expect(controller.elementText).toBe('');
      expect(controller.readAs).toBe('');
      expect($rootScope.$broadcast).toHaveBeenCalledWith('dynamicListUpdated');
    });

    it('should clear out elementText and readAs upon calling of closeClickFn from REST CTRL', function () {
      $scope.aaElementType = 'REST';
      controller = $controller('AAInsertionElementCtrl', {
        $scope: $scope,
      });
      $scope.$apply();
      action = AutoAttendantCeMenuModelService.newCeActionEntry('dynamic', '');
      action.dynamicList = [{
        action: {
          eval: {
            value: 'testValue',
          },
        },
        isDynamic: true,
        htmlModel: encodeURIComponent(ele),
      }];
      menuEntry.addAction(action);
      controller.closeClickFn();
      expect(controller.elementText).toBe('');
      expect(controller.readAs).toBe('');
    });

    it('should clear out elementText and readAs upon calling of closeClickFn from phoneMenu', function () {
      action = AutoAttendantCeMenuModelService.newCeActionEntry('dynamic', '');
      action.dynamicList = [{
        say: {
          value: 'testValue',
          voice: '',
          as: 'testValue',
        },
        isDynamic: true,
        htmlModel: encodeURIComponent(ele),
      }];
      menuEntry.headers = [{
        actions: [],
      }];
      menuEntry.headers[0].actions.push(action);
      controller.closeClickFn();
      expect(controller.elementText).toBe('');
      expect(controller.readAs).toBe('');
    });

    it('should clear out elementText and readAs upon calling of closeClickFn from subMenu', function () {
      action = AutoAttendantCeMenuModelService.newCeActionEntry('dynamic', '');
      action.dynamicList = [{
        say: {
          value: 'testValue',
          voice: '',
          as: 'testValue',
        },
        isDynamic: true,
        htmlModel: encodeURIComponent(ele),
      }];
      menuEntry.headers = [{
        actions: [],
      }];
      menuEntry.entries = [{
        actions: [],
      }];
      menuEntry.entries[0].actions.push(action);
      controller.closeClickFn();
      expect(controller.elementText).toBe('');
      expect(controller.readAs).toBe('');
    });

    it('should clear out elementText and readAs upon calling of closeClickFn from initial announcement queueSettings', function () {
      var ele1 = '<aa-insertion-element element-text="testValue" read-as="testReadValue" element-id="initialAnnouncementTest"></aa-insertion-element>';
      musicOnHold = AutoAttendantCeMenuModelService.newCeMenuEntry();
      initialAnnouncement = AutoAttendantCeMenuModelService.newCeMenuEntry();
      periodicAnnouncement = AutoAttendantCeMenuModelService.newCeMenuEntry();
      fallback = AutoAttendantCeMenuModelService.newCeMenuEntry();
      playAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
      iaAction = AutoAttendantCeMenuModelService.newCeActionEntry('dynamic', '');
      iaAction.dynamicList = [{
        say: {
          value: 'testValue',
          voice: '',
          as: 'testValue',
        },
        isDynamic: true,
        htmlModel: encodeURIComponent(ele1),
      }];
      paAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
      fbAction = AutoAttendantCeMenuModelService.newCeActionEntry('disconnect', '');
      routeToQueue = AutoAttendantCeMenuModelService.newCeActionEntry('routeToQueue', '');
      musicOnHold.addAction(playAction);
      initialAnnouncement.addAction(iaAction);
      periodicAnnouncement.addAction(paAction);
      fallback.addAction(fbAction);
      queueSettings.musicOnHold = musicOnHold;
      queueSettings.initialAnnouncement = initialAnnouncement;
      queueSettings.periodicAnnouncement = periodicAnnouncement;
      queueSettings.fallback = fallback;
      routeToQueue.queueSettings = queueSettings;
      menuEntry.addAction(routeToQueue);
      $scope.elementId = 'initialAnnouncementTest';
      $scope.type = 'initialAnnouncement';

      controller.closeClickFn();
      expect(controller.elementText).toBe('');
      expect(controller.readAs).toBe('');
    });

    it('should clear out elementText and readAs upon calling of closeClickFn from periodic announcement queueSettings', function () {
      var ele1 = '<aa-insertion-element element-text="testValue" read-as="testReadValue" element-id="periodicAnnouncementTest"></aa-insertion-element>';
      musicOnHold = AutoAttendantCeMenuModelService.newCeMenuEntry();
      initialAnnouncement = AutoAttendantCeMenuModelService.newCeMenuEntry();
      periodicAnnouncement = AutoAttendantCeMenuModelService.newCeMenuEntry();
      fallback = AutoAttendantCeMenuModelService.newCeMenuEntry();
      playAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
      iaAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
      paAction = AutoAttendantCeMenuModelService.newCeActionEntry('dynamic', '');
      paAction.dynamicList = [{
        say: {
          value: 'testValue',
          voice: '',
          as: 'testValue',
        },
        isDynamic: true,
        htmlModel: encodeURIComponent(ele1),
      }];
      fbAction = AutoAttendantCeMenuModelService.newCeActionEntry('disconnect', '');
      routeToQueue = AutoAttendantCeMenuModelService.newCeActionEntry('routeToQueue', '');
      musicOnHold.addAction(playAction);
      initialAnnouncement.addAction(iaAction);
      periodicAnnouncement.addAction(paAction);
      fallback.addAction(fbAction);
      queueSettings.musicOnHold = musicOnHold;
      queueSettings.initialAnnouncement = initialAnnouncement;
      queueSettings.periodicAnnouncement = periodicAnnouncement;
      queueSettings.fallback = fallback;
      routeToQueue.queueSettings = queueSettings;
      menuEntry.addAction(routeToQueue);
      $scope.elementId = 'periodicAnnouncementTest';
      $scope.type = 'periodicAnnouncement';
      controller.closeClickFn();
      expect(controller.elementText).toBe('');
      expect(controller.readAs).toBe('');
    });
  });
});
