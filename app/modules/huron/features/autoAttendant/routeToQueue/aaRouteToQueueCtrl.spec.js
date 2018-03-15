'use strict';

describe('Controller: AARouteToQueueCtrl', function () {
  var $controller, $modal;
  var AAUiModelService, AutoAttendantCeInfoModelService, AutoAttendantCeMenuModelService, AAModelService;
  var $rootScope, $scope;
  var $q;

  var aaModel = {

  };

  var aaUiModel = {
    openHours: {},
    ceInfo: {
      name: 'AA2',
    },
  };
  var modal;
  var queueName = 'Chandan Test Queue';
  var queues = [{
    id: 'c16a6027-caef-4429-b3af-9d61ddc7964b',
    queueName: queueName,
    queueUrl: '/c16a6027-caef-4429-b3af-9d61ddc7964b',
  }];

  var schedule = 'openHours';
  var index = 0;
  var keyIndex = 0;

  var rawCeInfos = getJSONFixture('huron/json/autoAttendant/callExperiencesWithNumber.json');

  function raw2CeInfos(rawCeInfos) {
    var _ceInfos = [];
    for (var i = 0; i < rawCeInfos.length; i++) {
      var _ceInfo = AutoAttendantCeInfoModelService.newCeInfo();
      for (var j = 0; j < rawCeInfos[i].assignedResources.length; j++) {
        var _resource = AutoAttendantCeInfoModelService.newResource();
        _resource.setId(rawCeInfos[i].assignedResources[j].id);
        _resource.setTrigger(rawCeInfos[i].assignedResources[j].trigger);
        _resource.setType(rawCeInfos[i].assignedResources[j].type);
        _resource.setNumber(rawCeInfos[i].assignedResources[j].number);
        _ceInfo.addResource(_resource);
      }
      _ceInfo.setName(rawCeInfos[i].callExperienceName);
      _ceInfo.setCeUrl(rawCeInfos[i].callExperienceURL);
      _ceInfos[i] = _ceInfo;
    }
    return _ceInfos;
  }

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (CustomVariableService, $q) {
    spyOn(CustomVariableService, 'listCustomVariables').and.returnValue($q.resolve([]));
  }));

  beforeEach(inject(function (_$controller_, _$rootScope_, _$modal_, _$q_, _AAUiModelService_, _AutoAttendantCeInfoModelService_, _AutoAttendantCeMenuModelService_, _AAModelService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    $modal = _$modal_;
    $q = _$q_;

    $controller = _$controller_;
    AAModelService = _AAModelService_;
    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    modal = $q.defer();
    $scope.schedule = schedule;
    $scope.index = index;
    $scope.keyIndex = keyIndex;
    $scope.menuId = 'menu1';
    $scope.queues = JSON.stringify(queues);

    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
    aaModel.ceInfos = raw2CeInfos(rawCeInfos);

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    AutoAttendantCeMenuModelService.clearCeMenuMap();
    aaUiModel[schedule] = AutoAttendantCeMenuModelService.newCeMenu();
    aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenu());
  }));

  describe('fromDecision', function () {
    beforeEach(function () {
      AutoAttendantCeMenuModelService.clearCeMenuMap();
      aaUiModel[schedule] = AutoAttendantCeMenuModelService.newCeMenu();
      aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());
      var action = AutoAttendantCeMenuModelService.newCeActionEntry('conditional', '');
      action.queueSettings = {};
      aaUiModel[schedule].entries[index].actions[0] = action;
      $scope.fromDecision = true;
    });

    it('should create a condition then action', function () {
      var controller = $controller('AARouteToQueueCtrl', {
        $scope: $scope,
      });

      expect(controller.menuEntry.actions[0].description).toEqual('');
      expect(controller.menuEntry.actions[0].then).toBeDefined();
      expect(controller.menuEntry.actions[0].then.name).toEqual('routeToQueue');
    });
    it('should create a condition action with then clause', function () {
      aaUiModel[schedule].entries[0].actions[0] = undefined;

      var controller = $controller('AARouteToQueueCtrl', {
        $scope: $scope,
      });

      expect(controller.menuEntry.actions[0].name).toEqual('conditional');
      expect(controller.menuEntry.actions[0].then).toBeDefined();
      expect(controller.menuEntry.actions[0].then.name).toEqual('routeToQueue');
    });
    it('should change an action from route to routeToQueue ', function () {
      aaUiModel[schedule].entries[index].actions[0].then = AutoAttendantCeMenuModelService.newCeActionEntry('route', '');

      var controller = $controller('AARouteToQueueCtrl', {
        $scope: $scope,
      });

      expect(controller.menuEntry.actions[0].name).toEqual('conditional');
      expect(controller.menuEntry.actions[0].then).toBeDefined();
      expect(controller.menuEntry.actions[0].then.name).toEqual('routeToQueue');
    });
  });

  describe('openQueueTreatmentModal', function () {
    var saved = {};
    var controller;
    beforeEach(function () {
      saved.musicOnHold = AutoAttendantCeMenuModelService.newCeMenuEntry();
      var moh = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
      saved.musicOnHold.addAction(moh);
      spyOn($modal, 'open').and.returnValue({
        result: modal.promise,
      });
      controller = $controller('AARouteToQueueCtrl', {
        $scope: $scope,
      });
    });

    it('should open the Modal on Validation success', function () {
      controller.openQueueTreatmentModal();
      $scope.$apply();
      expect($modal.open).toHaveBeenCalled();
      modal.resolve();
      $scope.$apply();
    });

    it('should open the Modal on Validation success when from Route Call', function () {
      var action = AutoAttendantCeMenuModelService.newCeActionEntry('routeToQueue', '');
      controller.menuEntry.actions = [];
      controller.menuEntry.actions[0] = action;
      $scope.fromRouteCall = true;
      controller = $controller('AARouteToQueueCtrl', {
        $scope: $scope,
      });
      $scope.$apply();
      controller.openQueueTreatmentModal();
      $scope.$apply();
      expect($modal.open).toHaveBeenCalled();
      modal.resolve();
      $scope.$apply();
    });

    describe('fromRouteCall', function () {
      beforeEach(function () {
        AutoAttendantCeMenuModelService.clearCeMenuMap();
        aaUiModel[schedule] = AutoAttendantCeMenuModelService.newCeMenu();
        aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('dummy', '');
        action.queueSettings = {};
        aaUiModel[schedule].entries[index].actions[0] = action;
        $scope.fromRouteCall = true;
        controller = $controller('AARouteToQueueCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
      });

      it('should maintain a master copy of the model if not "saved"', function () {
        spyOn($scope, '$broadcast').and.callThrough();

        controller.openQueueTreatmentModal();
        $scope.$apply();
        expect(controller.menuEntry.actions[0].description).toEqual('');
        controller.menuEntry.actions[0].description = 'Added text';
        modal.reject();
        $scope.$apply();
        expect(controller.menuEntry.actions[0].description).toEqual('');
        expect($scope.$broadcast).toHaveBeenCalledWith('Queue_Cancelled');
      });
    });

    describe('from phone menu', function () {
      beforeEach(function () {
        $scope.menuKeyIndex = keyIndex;
        $scope.menuId = 'menu0';
        AutoAttendantCeMenuModelService.clearCeMenuMap();
        aaUiModel[schedule] = AutoAttendantCeMenuModelService.newCeMenu();
        aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('routeToQueue', '');
        action.queueSettings = {};
        aaUiModel[schedule].entries[keyIndex].actions[0] = action;
        controller = $controller('AARouteToQueueCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
        controller.menuKeyEntry.actions = [];
        controller.menuKeyEntry.actions[0] = action;
        controller.hideQueues = false;
        $scope.$apply();
      });

      it('should maintain a master copy of the model if not "saved"', function () {
        controller.openQueueTreatmentModal();
        $scope.$apply();
        expect(controller.menuKeyEntry.actions[0].description).toEqual('');
        controller.menuKeyEntry.actions[0].description = 'Added text';
        modal.reject();
        $scope.$apply();
        expect(controller.menuKeyEntry.actions[0].description).toEqual('');
      });
    });
  });

  describe('fromRouteCall overwrite', function () {
    beforeEach(function () {
      aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());
      var action = AutoAttendantCeMenuModelService.newCeActionEntry('dummy', '');

      aaUiModel[schedule].entries[0].addAction(action);
    });

    it('should be able to create new Queue entry from Route Call', function () {
      $scope.fromRouteCall = true;

      var controller = $controller('AARouteToQueueCtrl', {
        $scope: $scope,
      });

      expect(controller).toBeDefined();
      var action = AutoAttendantCeMenuModelService.newCeActionEntry('routeToQueue', '');
      controller.menuEntry.actions = [];
      controller.menuEntry.actions[0] = action;
      controller.hideQueues = false;
      controller.populateUiModel();
      $scope.$apply();
      expect(controller.queueSelected.id).toEqual('');
      expect(controller.menuEntry.actions[0].name).toEqual('routeToQueue');
      expect(controller.menuEntry.actions[0].value).toEqual('');
    });
  });

  describe('fromRouteCall', function () {
    beforeEach(function () {
      $scope.fromRouteCall = true;

      aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());

      aaUiModel[schedule].entries[0].actions = [];
    });
    it('should populate the ui from the menuEntry', function () {
      var controller = $controller('AARouteToQueueCtrl', {
        $scope: $scope,
      });
      controller.hideQueues = false;
      var action = AutoAttendantCeMenuModelService.newCeActionEntry('routeToQueue', 'myId');
      controller.menuEntry.actions = [];
      controller.menuEntry.actions[0] = action;

      controller.populateUiModel();

      $scope.$apply();

      expect(controller.queueSelected.id).toEqual('myId');
    });
    it('should be able to show the already selected queue', function () {
      var controller = $controller('AARouteToQueueCtrl', {
        $scope: $scope,
      });
      controller.hideQueues = true;
      controller.populateUiModel();

      $scope.$apply();
      expect(controller.queueSelected.id).toEqual('c16a6027-caef-4429-b3af-9d61ddc7964b');

      expect(controller.menuEntry.actions[0].name).toEqual('routeToQueue');
      expect(controller.menuEntry.actions[0].value).toEqual('c16a6027-caef-4429-b3af-9d61ddc7964b');
    });

    it('should be able to create new AA entry from Route Call', function () {
      var controller = $controller('AARouteToQueueCtrl', {
        $scope: $scope,
      });

      expect(controller).toBeDefined();
      var action = AutoAttendantCeMenuModelService.newCeActionEntry('routeToQueue', '');
      controller.menuEntry.actions = [];
      controller.menuEntry.actions[0] = action;
      controller.hideQueues = false;
      controller.populateUiModel();
      $scope.$apply();
      expect(controller.queueSelected.id).toEqual('');
      expect(controller.menuEntry.actions[0].name).toEqual('routeToQueue');
      expect(controller.menuEntry.actions[0].value).toEqual('');
    });

    it('should be able to create new AA entry from Route Call', function () {
      var controller = $controller('AARouteToQueueCtrl', {
        $scope: $scope,
      });
      expect(controller).toBeDefined();
      var action = AutoAttendantCeMenuModelService.newCeActionEntry('routeToQueue', '');
      controller.menuEntry.actions = [];
      controller.menuEntry.actions[0] = action;
      controller.hideQueues = true;
      controller.populateUiModel();
      $scope.$apply();
      expect(controller.queueSelected.id).toEqual('c16a6027-caef-4429-b3af-9d61ddc7964b');
      expect(controller.menuEntry.actions[0].name).toEqual('routeToQueue');
      expect(controller.menuEntry.actions[0].value).toEqual('c16a6027-caef-4429-b3af-9d61ddc7964b');
    });

    it('should be able to change update via saveUIModel', function () {
      var controller = $controller('AARouteToQueueCtrl', {
        $scope: $scope,
      });
      controller.queueSelected = {
        name: 'Test Queue',
        id: 'c16a6027-caef-4429-b3af-9d61ddc7964b',
      };

      var action = AutoAttendantCeMenuModelService.newCeActionEntry('routeToQueue', '');
      controller.menuEntry.actions = [];
      controller.menuEntry.actions[0] = action;

      controller.saveUiModel();

      $scope.$apply();

      expect(controller.menuEntry.actions[0].value).toEqual('c16a6027-caef-4429-b3af-9d61ddc7964b');
    });
  });

  describe('AARouteToQueue', function () {
    it('should be able to create new AA entry', function () {
      var controller = $controller('AARouteToQueueCtrl', {
        $scope: $scope,
      });

      expect(controller).toBeDefined();
      var action = AutoAttendantCeMenuModelService.newCeActionEntry('routeToQueue', '');
      controller.menuKeyEntry.actions = [];
      controller.menuKeyEntry.actions[0] = action;
      controller.hideQueues = false;
      controller.populateUiModel();
      $scope.$apply();
      expect(controller.queueSelected.id).toEqual('');
      expect(controller.menuKeyEntry.actions[0].name).toEqual('routeToQueue');
      expect(controller.menuKeyEntry.actions[0].value).toEqual('');
    });

    it('should initialize the options list', function () {
      var controller = $controller('AARouteToQueueCtrl', {
        $scope: $scope,
      });

      $scope.$apply();
      expect(controller.queues.length).toEqual(1);
    });

    describe('activate', function () {
      it('should read and display an existing entry', function () {
        var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('Chandan Test Queue', 'c16a6027-caef-4429-b3af-9d61ddc7964b');

        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        menuEntry.addAction(actionEntry);
        aaUiModel[schedule].entries[0].addEntry(menuEntry);
        var controller = $controller('AARouteToQueueCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
        expect(controller.queueSelected.id).toEqual('c16a6027-caef-4429-b3af-9d61ddc7964b');
      });
    });
    describe('fromRouteCall is false', function () {
      beforeEach(function () {
        $scope.fromRouteCall = false;

        aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());

        aaUiModel[schedule].entries[0].actions = [];
      });
      it('should be able to create new AA while hideQueues is false', function () {
        var controller = $controller('AARouteToQueueCtrl', {
          $scope: $scope,
        });
        expect(controller).toBeDefined();
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('routeToQueue', 'c16a6027-caef-4429-b3af-9d61ddc7964b');
        controller.menuEntry.actions = [];
        controller.menuEntry.actions[0] = action;
        controller.hideQueues = false;
        controller.populateUiModel();
        $scope.$apply();
        expect(controller.queueSelected.id).toEqual('c16a6027-caef-4429-b3af-9d61ddc7964b');
        expect(controller.menuEntry.actions[0].name).toEqual('routeToQueue');
        expect(controller.menuEntry.actions[0].value).toEqual('c16a6027-caef-4429-b3af-9d61ddc7964b');
      });

      it('should be able to show the Queues when hideQueues is true', function () {
        var controller = $controller('AARouteToQueueCtrl', {
          $scope: $scope,
        });
        expect(controller).toBeDefined();
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('routeToQueue', 'c16a6027-caef-4429-b3af-9d61ddc7964b');
        controller.menuEntry.actions = [];
        controller.menuEntry.actions[0] = action;
        controller.hideQueues = true;
        controller.populateUiModel();
        $scope.$apply();
        expect(controller.queueSelected.id).toEqual('c16a6027-caef-4429-b3af-9d61ddc7964b');
        expect(controller.menuEntry.actions[0].name).toEqual('routeToQueue');
        expect(controller.menuEntry.actions[0].value).toEqual('c16a6027-caef-4429-b3af-9d61ddc7964b');
      });

      it('should be able to update queue settings voice via saveUIModel', function () {
        var controller = $controller('AARouteToQueueCtrl', {
          $scope: $scope,
        });
        controller.queueSelected = {
          name: 'Test Queue',
          id: 'c16a6027-caef-4429-b3af-9d61ddc7964b',
        };

        var action = AutoAttendantCeMenuModelService.newCeActionEntry('routeToQueue', '');
        action.queueSettings = {
          voice: '',
        };
        controller.menuKeyEntry.actions = [];
        controller.menuKeyEntry.actions[0] = action;

        var headerEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        controller.menuEntry.headers = [];
        headerEntry.setVoice('Anna');
        controller.menuEntry.headers.push(headerEntry);

        controller.saveUiModel();
        $scope.$apply();

        expect(controller.menuKeyEntry.actions[0].value).toEqual('c16a6027-caef-4429-b3af-9d61ddc7964b');

        var queueSettings = _.get(controller.menuKeyEntry, 'actions[0].queueSettings');
        expect(queueSettings.voice).toEqual('Anna');
      });
    });
    describe('varible warning', function () {
      it('fullWarningMsg', function () {
        var controller = $controller('AARouteToQueueCtrl', {
          $scope: $scope,
        });
        controller.togglefullWarningMsg();
        expect(controller.fullWarningMsgValue).toBe(true);
      });
      it('getWarning returning true', function () {
        var controller = $controller('AARouteToQueueCtrl', {
          $scope: $scope,
        });
        controller.deletedSessionVariablesList = ['test', ''];
        controller.getWarning();
        expect(controller.getWarning()).toBe(true);
      });
      it('getWarning returning true', function () {
        var controller = $controller('AARouteToQueueCtrl', {
          $scope: $scope,
        });
        controller.deletedSessionVariablesList = {};
        controller.getWarning();
        expect(controller.getWarning()).toBe(false);
      });
      it('calling closeFullWarningMsg', function () {
        var controller = $controller('AARouteToQueueCtrl', {
          $scope: $scope,
        });
        controller.closeFullWarningMsg();
        expect(controller.fullWarningMsgValue).toBe(false);
      });
      it('broadcast of CE Updated', function () {
        var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('Test Queue', 'c16a6027-caef-4429-b3af-9d61ddc7964b');
        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        var ele = '<aa-insertion-element element-text="testValue" read-as="testReadValue" element-id="1011"></aa-insertion-element>';
        $scope.fromDecision = true;
        menuEntry.dynamicList = [{
          say: {
            value: 'test',
            voice: '',
            as: 'test',
          },
          isDynamic: true,
          htmlModel: encodeURIComponent(ele),
        }];
        AutoAttendantCeMenuModelService.clearCeMenuMap();
        aaUiModel[schedule] = AutoAttendantCeMenuModelService.newCeMenu();
        aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenuEntry());
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('conditional', '');
        action.queueSettings = {};
        aaUiModel[schedule].entries[index].actions[0] = action;
        menuEntry.addAction(actionEntry);
        aaUiModel[schedule].addEntryAt(index, menuEntry);
        var controller = $controller('AARouteToQueueCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
        controller.deletedSessionVariablesList = ['test', ''];
        $rootScope.$broadcast('CE Updated');
        expect(controller.fullWarningMsgValue).toBe(false);
      });
      it('broadcast of CIVarNameChanged for initialAnnouncement ', function () {
        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        var ele = '<aa-insertion-element element-text="testValue" read-as="testReadValue" element-id="1011"></aa-insertion-element>';
        var initialAnnouncement = 'initialAnnouncement';
        var queueSettings = {};
        AutoAttendantCeMenuModelService.clearCeMenuMap();
        $scope.fromRouteCall = true;
        var routeToQueue = AutoAttendantCeMenuModelService.newCeActionEntry('routeToQueue', '');
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('dynamic', '');
        action.dynamicList = [{
          say: {
            value: 'test',
            voice: '',
            as: 'test',
          },
          isDynamic: true,
          htmlModel: encodeURIComponent(ele),
        }];
        initialAnnouncement = AutoAttendantCeMenuModelService.newCeMenuEntry();
        initialAnnouncement.addAction(action);
        queueSettings.initialAnnouncement = initialAnnouncement;
        routeToQueue.queueSettings = queueSettings;
        menuEntry.addAction(routeToQueue);
        aaUiModel[schedule].addEntryAt(index, menuEntry);
        var controller = $controller('AARouteToQueueCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
        controller.deletedSessionVariablesList = ['test', ''];
        $rootScope.$broadcast('CIVarNameChanged');
        expect(controller.fullWarningMsgValue).toBe(false);
      });
      it('broadcast of CIVarNameChanged for initialAnnouncement ', function () {
        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        var ele = '<aa-insertion-element element-text="testValue" read-as="testReadValue" element-id="1011"></aa-insertion-element>';
        var periodicAnnouncement = 'periodicAnnouncement';
        var queueSettings = {};
        AutoAttendantCeMenuModelService.clearCeMenuMap();
        $scope.fromRouteCall = true;
        var routeToQueue = AutoAttendantCeMenuModelService.newCeActionEntry('routeToQueue', '');
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('dynamic', '');
        action.dynamicList = [{
          say: {
            value: 'test',
            voice: '',
            as: 'test',
          },
          isDynamic: true,
          htmlModel: encodeURIComponent(ele),
        }];
        periodicAnnouncement = AutoAttendantCeMenuModelService.newCeMenuEntry();
        periodicAnnouncement.addAction(action);
        queueSettings.periodicAnnouncement = periodicAnnouncement;
        routeToQueue.queueSettings = queueSettings;
        menuEntry.addAction(routeToQueue);
        aaUiModel[schedule].addEntryAt(index, menuEntry);
        var controller = $controller('AARouteToQueueCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
        controller.deletedSessionVariablesList = ['test', ''];
        $rootScope.$broadcast('CIVarNameChanged');
        expect(controller.fullWarningMsgValue).toBe(false);
      });
      it('broadcast of Cancel Clicked for initialAnnouncement ', function () {
        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        var ele = '<aa-insertion-element element-text="testValue" read-as="testReadValue" element-id="1011"></aa-insertion-element>';
        var initialAnnouncement = 'initialAnnouncement';
        var queueSettings = {};
        AutoAttendantCeMenuModelService.clearCeMenuMap();
        $scope.fromRouteCall = true;
        var routeToQueue = AutoAttendantCeMenuModelService.newCeActionEntry('routeToQueue', '');
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('dynamic', '');
        action.dynamicList = [{
          say: {
            value: 'test',
            voice: '',
            as: 'test',
          },
          isDynamic: true,
          htmlModel: encodeURIComponent(ele),
        }];
        initialAnnouncement = AutoAttendantCeMenuModelService.newCeMenuEntry();
        initialAnnouncement.addAction(action);
        queueSettings.initialAnnouncement = initialAnnouncement;
        routeToQueue.queueSettings = queueSettings;
        menuEntry.addAction(routeToQueue);
        aaUiModel[schedule].addEntryAt(index, menuEntry);
        var controller = $controller('AARouteToQueueCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
        controller.deletedSessionVariablesList = ['test', ''];
        $rootScope.$broadcast('AACancelQueueSettings');
        expect(controller.fullWarningMsgValue).toBe(false);
      });
      it('broadcast of Cancel Clicked for periodicAnnouncement ', function () {
        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        var ele = '<aa-insertion-element element-text="testValue" read-as="testReadValue" element-id="1011"></aa-insertion-element>';
        var periodicAnnouncement = 'periodicAnnouncement';
        var queueSettings = {};
        AutoAttendantCeMenuModelService.clearCeMenuMap();
        $scope.fromRouteCall = true;
        var routeToQueue = AutoAttendantCeMenuModelService.newCeActionEntry('routeToQueue', '');
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('dynamic', '');
        action.dynamicList = [{
          say: {
            value: 'test',
            voice: '',
            as: 'test',
          },
          isDynamic: true,
          htmlModel: encodeURIComponent(ele),
        }];
        periodicAnnouncement = AutoAttendantCeMenuModelService.newCeMenuEntry();
        periodicAnnouncement.addAction(action);
        queueSettings.periodicAnnouncement = periodicAnnouncement;
        routeToQueue.queueSettings = queueSettings;
        menuEntry.addAction(routeToQueue);
        aaUiModel[schedule].addEntryAt(index, menuEntry);
        var controller = $controller('AARouteToQueueCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
        controller.deletedSessionVariablesList = ['test', ''];
        $rootScope.$broadcast('AACancelQueueSettings');
        expect(controller.fullWarningMsgValue).toBe(false);
      });
      it('broadcast of Ok Clicked for initialAnnouncement ', function () {
        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        var ele = '<aa-insertion-element element-text="testValue" read-as="testReadValue" element-id="1011"></aa-insertion-element>';
        var initialAnnouncement = 'initialAnnouncement';
        var queueSettings = {};
        AutoAttendantCeMenuModelService.clearCeMenuMap();
        $scope.fromRouteCall = true;
        var routeToQueue = AutoAttendantCeMenuModelService.newCeActionEntry('routeToQueue', '');
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('dynamic', '');
        action.dynamicList = [{
          say: {
            value: 'test',
            voice: '',
            as: 'test',
          },
          isDynamic: true,
          htmlModel: encodeURIComponent(ele),
        }];
        initialAnnouncement = AutoAttendantCeMenuModelService.newCeMenuEntry();
        initialAnnouncement.addAction(action);
        queueSettings.initialAnnouncement = initialAnnouncement;
        routeToQueue.queueSettings = queueSettings;
        menuEntry.addAction(routeToQueue);
        aaUiModel[schedule].addEntryAt(index, menuEntry);
        var controller = $controller('AARouteToQueueCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
        controller.deletedSessionVariablesList = ['test', ''];
        $rootScope.$broadcast('AASaveQueueSettings');
        expect(controller.fullWarningMsgValue).toBe(false);
      });
      it('broadcast of Ok Clicked for periodicAnnouncement ', function () {
        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        var ele = '<aa-insertion-element element-text="testValue" read-as="testReadValue" element-id="1011"></aa-insertion-element>';
        var periodicAnnouncement = 'periodicAnnouncement';
        var queueSettings = {};
        AutoAttendantCeMenuModelService.clearCeMenuMap();
        $scope.fromRouteCall = true;
        var routeToQueue = AutoAttendantCeMenuModelService.newCeActionEntry('routeToQueue', '');
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('dynamic', '');
        action.dynamicList = [{
          say: {
            value: 'test',
            voice: '',
            as: 'test',
          },
          isDynamic: true,
          htmlModel: encodeURIComponent(ele),
        }];
        periodicAnnouncement = AutoAttendantCeMenuModelService.newCeMenuEntry();
        periodicAnnouncement.addAction(action);
        queueSettings.periodicAnnouncement = periodicAnnouncement;
        routeToQueue.queueSettings = queueSettings;
        menuEntry.addAction(routeToQueue);
        aaUiModel[schedule].addEntryAt(index, menuEntry);
        var controller = $controller('AARouteToQueueCtrl', {
          $scope: $scope,
        });
        $scope.$apply();
        controller.deletedSessionVariablesList = ['test', ''];
        $rootScope.$broadcast('AASaveQueueSettings');
        expect(controller.fullWarningMsgValue).toBe(false);
      });
    });
  });
});
