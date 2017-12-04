'use strict';

describe('Controller: AAAddVariableCtrl', function () {
  var controller, $controller;
  var AutoAttendantCeMenuModelService, AAUiModelService;
  var $rootScope, $scope, $window;
  var $q;
  var $modal, modal;
  var schedule = 'openHours';

  var ui = {
    openHours: {},
  };

  var uiMenu = {};
  var menuEntry = {};
  var index = '0';

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _$modal_, _AutoAttendantCeMenuModelService_, _AAUiModelService_, _$window_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $controller = _$controller_;
    $q = _$q_;
    $modal = _$modal_;
    $window = _$window_;
    $scope.schedule = schedule;
    $scope.index = index;
    $scope.aaElementType = 'SayMessage';
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;
    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService.clearCeMenuMap();
    uiMenu = AutoAttendantCeMenuModelService.newCeMenu();
    ui[schedule] = uiMenu;
    menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
    uiMenu.addEntryAt(index, menuEntry);

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(ui);
    modal = $q.defer();
  }));

  describe('activate', function () {
    describe('basic', function () {
      beforeEach(function () {
        controller = $controller('AAAddVariableCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
      });

      it('should validate controller creation', function () {
        expect(controller).toBeDefined();
        expect(controller.dynamicAdd).toBeUndefined();
      });
    });

    describe('with values', function () {
      beforeEach(function () {
        $scope.dynamicElement = 'test';
        $scope.elementId = 'test';
        controller = $controller('AAAddVariableCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
      });

      it('should validate setUp', function () {
        expect(controller.dynamicAdd).toBeDefined();
      });
    });
  });

  describe('dynamicAdd', function () {
    var queueSettings = {};
    var routeToQueue;
    var fbAction;
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
    var dynamicElement;
    var scopeElement;
    var musicOnHold;
    var initialAnnouncement;
    var periodicAnnouncement;
    var fallback;
    var playAction;
    var paAction;
    var iaAction;

    beforeEach(function () {
      spyOn($modal, 'open').and.returnValue({
        result: modal.promise,
      });
    });

    describe('with values ', function () {
      beforeEach(function () {
        scopeElement = {
          insertElement: function (string) {
            return string;
          },
        };
        dynamicElement = {
          scope: function () {
            return true;
          },
          focus: function () {},
        };
        var rangeGetter = function () {
          var range = {
            collapsed: true,
            endContainer: {
              ownerDocument: {
                activeElement: {
                  childNodes: [{
                    nodeName: '#text',
                    nodeValue: 'this is test say message',
                  }, {
                    nodeName: 'SPAN',
                    parentElement: {
                      attributes: [{
                        value: 'Test Attribute',
                      }, {
                        value: 'NUMBER',
                      }, {
                        value: 'dummyId',
                      }],
                    },
                  }],
                  className: 'dynamic-prompt aa-message-height',
                },
              },
            },
          };
          return range;
        };
        spyOn(angular, 'element').and.returnValue(dynamicElement);
        spyOn(dynamicElement, 'focus');
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
        $scope.elementId = 'test';
        $scope.aaElementType = 'SayMessage';
        controller = $controller('AAAddVariableCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
      });

      it('should create/update dynamicList in actions under menuEntry', function () {
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('runActionsOnInput', '');
        action.dynamicList = [];
        menuEntry.addAction(action);
        spyOn($rootScope, '$broadcast');
        controller.dynamicAdd($scope.dynamicElement, $scope.elementId);
        expect($modal.open).toHaveBeenCalled();
        modal.resolve(result);
        $scope.$apply();
        expect(controller.menuEntry.actions[0].dynamicList.length).toEqual(2);
        expect(controller.menuEntry.actions[0].dynamicList[0].say.value).toEqual('this is test say message');
        expect(controller.menuEntry.actions[0].dynamicList[1].isDynamic).toEqual(true);
        expect($rootScope.$broadcast).toHaveBeenCalledWith('dynamicListUpdated');
      });

      it('should create/update dynamicList in actions under menuEntry when called from REST block', function () {
        $scope.aaElementType = 'REST';
        controller = $controller('AAAddVariableCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('dynamic', '');
        action.dynamicList = [];
        menuEntry.addAction(action);
        controller.dynamicAdd($scope.dynamicElement, $scope.elementId);
        expect($modal.open).toHaveBeenCalled();
        modal.resolve(result);
        $scope.$apply();
        expect(_.get(controller.menuEntry, 'actions[0].dynamicList.length', 0)).toBe(2);
        expect(_.get(controller.menuEntry, 'actions[0].dynamicList[0].action.eval.value', '')).toBe('this is test say message');
        expect(_.get(controller.menuEntry, 'actions[0].dynamicList[1].isDynamic', '')).toBe(true);
      });

      it('should be able to update/create dynamicList inside action for Menu Header', function () {
        var action;
        $scope.isMenuHeader = 'true';
        action = (AutoAttendantCeMenuModelService.newCeActionEntry('dynamic', ''));
        action.dynamicList = [];
        menuEntry.headers = [{
          actions: [],
        }];
        menuEntry.headers[0].actions.push(action);
        controller.dynamicAdd($scope.dynamicElement, $scope.elementId);
        expect($modal.open).toHaveBeenCalled();
        modal.resolve(result);
        $scope.$apply();
        expect(controller.menuEntry.headers[0].actions[0].dynamicList.length).toEqual(2);
        expect(controller.menuEntry.headers[0].actions[0].dynamicList[0].say.value).toEqual('this is test say message');
        expect(controller.menuEntry.headers[0].actions[0].dynamicList[1].isDynamic).toEqual(true);
      });

      it('should be able to update/create dynamicList inside initialAnnouncemnt action for QueueSettings from New Step', function () {
        musicOnHold = AutoAttendantCeMenuModelService.newCeMenuEntry();
        initialAnnouncement = AutoAttendantCeMenuModelService.newCeMenuEntry();
        periodicAnnouncement = AutoAttendantCeMenuModelService.newCeMenuEntry();
        fallback = AutoAttendantCeMenuModelService.newCeMenuEntry();
        playAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
        iaAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
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
        $scope.type = 'initialAnnouncement';

        controller.dynamicAdd($scope.dynamicElement, $scope.elementId);
        expect($modal.open).toHaveBeenCalled();
        modal.resolve(result);
        $scope.$apply();
        expect(controller.menuEntry.actions[0].queueSettings.initialAnnouncement.actions[0].dynamicList.length).toEqual(2);
        expect(controller.menuEntry.actions[0].queueSettings.initialAnnouncement.actions[0].dynamicList[0].say.value).toEqual('this is test say message');
        expect(controller.menuEntry.actions[0].queueSettings.initialAnnouncement.actions[0].dynamicList[1].isDynamic).toEqual(true);
      });

      it('should be able to update/create dynamicList inside periodicAnnouncement action for QueueSettings from New Step', function () {
        musicOnHold = AutoAttendantCeMenuModelService.newCeMenuEntry();
        initialAnnouncement = AutoAttendantCeMenuModelService.newCeMenuEntry();
        periodicAnnouncement = AutoAttendantCeMenuModelService.newCeMenuEntry();
        fallback = AutoAttendantCeMenuModelService.newCeMenuEntry();
        playAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
        iaAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
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
        $scope.type = 'periodicAnnouncement';
        controller.dynamicAdd($scope.dynamicElement, $scope.elementId);
        expect($modal.open).toHaveBeenCalled();
        modal.resolve(result);
        $scope.$apply();
        expect(controller.menuEntry.actions[0].queueSettings.periodicAnnouncement.actions[0].dynamicList.length).toEqual(2);
        expect(controller.menuEntry.actions[0].queueSettings.periodicAnnouncement.actions[0].dynamicList[0].say.value).toEqual('this is test say message');
        expect(controller.menuEntry.actions[0].queueSettings.periodicAnnouncement.actions[0].dynamicList[1].isDynamic).toEqual(true);
      });

      it('should be able to update/create dynamicList in action for Phone Menu type', function () {
        var action;
        $scope.menuId = '001';
        $scope.menuKeyIndex = '0';
        action = (AutoAttendantCeMenuModelService.newCeActionEntry('dynamic', ''));
        action.dynamicList = [];
        menuEntry.entries = [{
          actions: [],
        }];
        menuEntry.entries[0].actions.push(action);
        spyOn(AutoAttendantCeMenuModelService, 'getCeMenu').and.returnValue(menuEntry);
        controller.dynamicAdd($scope.dynamicElement, $scope.elementId);
        expect($modal.open).toHaveBeenCalled();
        modal.resolve(result);
        $scope.$apply();
        expect(controller.menuEntry.entries[0].actions[0].dynamicList.length).toEqual(2);
        expect(controller.menuEntry.entries[0].actions[0].dynamicList[0].say.value).toEqual('this is test say message');
        expect(controller.menuEntry.entries[0].actions[0].dynamicList[1].isDynamic).toEqual(true);
      });

      it('should be able to create/update dynamicList in action for Phone Menu type: sub menu', function () {
        var action;
        $scope.menuId = '1';
        action = (AutoAttendantCeMenuModelService.newCeActionEntry('dynamic', ''));
        action.dynamicList = [];
        menuEntry.headers = [{
          actions: [],
        }];
        menuEntry.headers[0].actions.push(action);
        spyOn(AutoAttendantCeMenuModelService, 'getCeMenu').and.returnValue(menuEntry);
        controller.dynamicAdd($scope.dynamicElement, $scope.elementId);
        expect($modal.open).toHaveBeenCalled();
        modal.resolve(result);
        $scope.$apply();
        expect(controller.menuEntry.headers[0].actions[0].dynamicList.length).toEqual(2);
        expect(controller.menuEntry.headers[0].actions[0].dynamicList[0].say.value).toEqual('this is test say message');
        expect(controller.menuEntry.headers[0].actions[0].dynamicList[1].isDynamic).toEqual(true);
      });

      it('should test the dynamicAdd', function () {
        controller.dynamicAdd($scope.dynamicElement, $scope.elementId);
        expect($modal.open).toHaveBeenCalled();
        modal.resolve(result);
        $scope.$apply();
        expect(dynamicElement.scope).toHaveBeenCalled();
        expect(dynamicElement.focus).toHaveBeenCalled();
        expect(scopeElement.insertElement).toHaveBeenCalled();
      });

      it('should not test the dynamicAdd', function () {
        controller.dynamicAdd($scope.dynamicElement, $scope.elementId);
        expect($modal.open).toHaveBeenCalled();
        modal.reject();
        $scope.$apply();
        expect(dynamicElement.scope).not.toHaveBeenCalled();
        expect(dynamicElement.focus).toHaveBeenCalled();
        expect(scopeElement.insertElement).not.toHaveBeenCalled();
      });
    });
  });
});
