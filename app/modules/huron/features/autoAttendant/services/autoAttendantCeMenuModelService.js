(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AutoAttendantCeMenuModelService', AutoAttendantCeMenuModelService);

  //
  // UI model:
  //
  // CeInfo
  //     name: String
  //     resources: CeInfoResource[]
  //     ceUrl: String
  //
  // CeInfoResource
  //     id: String // uuid
  //     trigger: String // 'inComing', 'outGoing'
  //     type: String // 'directoryNumber'
  //     number: String // '<E164>', '<DN>'
  //
  //
  // CeMenu
  //     type: String
  //     headers: CeMenuEntry[]
  //     entries: CeMenuEntry[]
  //
  // CeMenuEntry
  //     description: String
  //     type: String
  //
  //     key: String
  //     actions: Action[]
  //     timeout: String
  //     language: String
  //     voice: String
  //
  //     username: String
  //     password: String
  //     url: String
  //
  // Action
  //     name: String
  //     value: String
  //     description: String
  //     voice: String
  //
  function Action(name, value) {
    this.name = name;
    this.value = value;
    this.description = '';
    this.voice = '';
  }

  Action.prototype.clone = function () {
    var newObj = new Action(this.name, this.value);
    newObj.setDescription(this.description);
    newObj.setVoice(this.voice);
    return newObj;
  };

  Action.prototype.getName = function () {
    return this.name;
  };

  Action.prototype.setName = function (name) {
    this.name = name;
  };

  Action.prototype.getValue = function () {
    return this.value;
  };

  Action.prototype.setValue = function (value) {
    this.value = value;
  };

  Action.prototype.setDescription = function (description) {
    this.description = description;
  };

  Action.prototype.getDescription = function () {
    return this.description;
  };

  Action.prototype.setVoice = function (voice) {
    this.voice = voice;
  };

  Action.prototype.getVoice = function () {
    return this.voice;
  };

  function CeMenuEntry() {
    //
    // common
    //
    // properties:
    this.description = '';
    this.type = '';

    //
    // welcome menu entry
    // option menu entry
    //
    // properties:
    this.key = '';
    this.actions = [];
    this.timeout = '';
    this.language = '';
    this.voice = '';

    //
    // custom menu entry
    //
    // properties:
    this.username = '';
    this.password = '';
    this.url = '';
  }

  CeMenuEntry.prototype.clone = function () {
    var newObj = new CeMenuEntry();
    newObj.setDescription(this.description);
    newObj.setType(this.type);

    newObj.setKey(this.key);
    for (var i = 0; i < this.actions.length; i++) {
      newObj.actions[i] = this.actions[i].clone();
    }
    newObj.setTimeout(this.timeout);
    newObj.setLanguage(this.language);
    newObj.setVoice(this.voice);

    newObj.setUsername(this.username);
    newObj.setPassword(this.password);
    newObj.setUrl(this.url);

    return newObj;
  };

  CeMenuEntry.prototype.setDescription = function (description) {
    this.description = description;
  };

  CeMenuEntry.prototype.getDescription = function () {
    return this.description;
  };

  CeMenuEntry.prototype.setType = function (type) {
    this.type = type;
  };

  CeMenuEntry.prototype.getType = function () {
    return this.type;
  };

  CeMenuEntry.prototype.setKey = function (key) {
    this.key = key;
  };

  CeMenuEntry.prototype.getKey = function () {
    return this.key;
  };

  CeMenuEntry.prototype.addAction = function (action) {
    this.actions.push(action);
  };

  CeMenuEntry.prototype.setTimeout = function (timeout) {
    this.timeout = timeout;
  };

  CeMenuEntry.prototype.getTimeout = function () {
    return this.timeout;
  };

  CeMenuEntry.prototype.setLanguage = function (language) {
    this.language = language;
  };

  CeMenuEntry.prototype.getLanguage = function () {
    return this.language;
  };

  CeMenuEntry.prototype.setVoice = function (voice) {
    this.voice = voice;
  };

  CeMenuEntry.prototype.getVoice = function () {
    return this.voice;
  };

  CeMenuEntry.prototype.setPassword = function (password) {
    this.password = password;
  };

  CeMenuEntry.prototype.getPassword = function () {
    return this.password;
  };

  CeMenuEntry.prototype.setUsername = function (username) {
    this.username = username;
  };

  CeMenuEntry.prototype.getUsername = function () {
    return this.username;
  };

  CeMenuEntry.prototype.setUrl = function (url) {
    this.url = url;
  };

  CeMenuEntry.prototype.getUrl = function () {
    return this.url;
  };

  var ceMenuMap = {};
  var ceMenuCount = 0;

  function CeMenu() {
    this.type = '';
    this.headers = [];
    this.entries = [];
    this.id = 'menu' + ceMenuCount++;
    ceMenuMap[this.id] = this;
  }

  CeMenu.prototype.getId = function () {
    return this.id;
  };

  CeMenu.prototype.setType = function (menuType) {
    this.type = menuType;
  };

  CeMenu.prototype.getType = function () {
    return this.type;
  };

  CeMenu.prototype.addHeader = function (entry) {
    this.headers.push(entry);
  };

  CeMenu.prototype.addEntry = function (entry) {
    this.entries.push(entry);
  };

  CeMenu.prototype.addEntryAt = function (index, entry) {
    this.entries.splice(index, 0, entry);
  };

  CeMenu.prototype.appendEntry = function (entry) {
    this.entries.push(entry);
  };

  CeMenu.prototype.deleteEntryAt = function (index) {
    this.entries.splice(index, 1);
  };

  CeMenu.prototype.getEntryAt = function (index) {
    return this.entries[index];
  };

  function newRunActionsOnInput() {
    var obj = {};
    obj.description = '';
    obj.prompts = {};
    obj.inputs = [];
    return obj;
  }

  function CustomAction() {
    this.description = '';
    this.username = '';
    this.password = '';
    this.url = '';
  }

  /* @ngInject */
  function AutoAttendantCeMenuModelService() {

    var service = {
      getWelcomeMenu: getWelcomeMenu,
      getCustomMenu: getCustomMenu,
      getOptionMenu: getOptionMenu,
      getCombinedMenu: getCombinedMenu,
      updateScheduleActionSetMap: updateScheduleActionSetMap,
      updateDefaultActionSet: updateDefaultActionSet,
      updateMenu: updateMenu,
      updateCombinedMenu: updateCombinedMenu,
      deleteMenu: deleteMenu,
      deleteCombinedMenu: deleteCombinedMenu,
      deleteScheduleActionSetMap: deleteScheduleActionSetMap,
      getCeMenu: getCeMenu,
      clearCeMenuMap: clearCeMenuMap,
      deleteCeMenuMap: deleteCeMenuMap,
      isCeMenu: isCeMenu,

      newCeMenu: function () {
        return new CeMenu();
      },

      newCeMenuEntry: function () {
        return new CeMenuEntry();
      },

      newCeActionEntry: function (name, value) {
        return new Action(name, value);
      }

    };

    return service;

    /////////////////////

    function encodeUtf8(stringToEncode) {
      if (stringToEncode) {
        try {
          var stringEncoded = encodeURIComponent(stringToEncode);
          var encodedStringUnescaped = unescape(stringEncoded);
          return encodedStringUnescaped;
        } catch (exception) {
          //exception can occur if string is ready encoded
          return stringToEncode;
        }
      }
      return stringToEncode;
    }

    function decodeUtf8(stringToDecode) {
      if (stringToDecode) {
        try {
          var stringEscaped = escape(stringToDecode);
          var escapedStringDecoded = decodeURIComponent(stringEscaped);
          return escapedStringDecoded;

        } catch (exception) {
          // exception can occur if string was previously encoded non-utf-8
          return stringToDecode;
        }
      }
      return stringToDecode;
    }

    function parseSayObject(menuEntry, inObject) {
      var action;
      action = new Action('say', decodeUtf8(inObject.value));
      if (angular.isDefined(inObject.voice)) {
        action.setVoice(inObject.voice);
      }
      menuEntry.addAction(action);
    }

    function parseSayList(menuEntry, objects) {
      for (var i = 0; i < objects.length; i++) {
        parseSayObject(menuEntry, objects[i]);
      }
    }

    function createSayList(actions) {
      var newActionArray = [];
      for (var i = 0; i < actions.length; i++) {
        newActionArray[i] = {};
        newActionArray[i].value = (actions[i].getValue() ? encodeUtf8(actions[i].getValue()) : '');
        if (angular.isDefined(actions[i].voice) && actions[i].voice.length > 0) {
          newActionArray[i].voice = actions[i].voice;
        }
      }
      return newActionArray;
    }

    function setDescription(action, task) {
      if (angular.isDefined(task.description)) {
        action.setDescription(task.description);
      }
    }

    function parseAction(menuEntry, inAction) {
      var action;
      if (angular.isDefined(inAction.play)) {
        // convert file url to unique filename
        // var filename = MediaResourceService.getFileName(inAction.play.url);
        action = new Action('play', inAction.play.url);
        setDescription(action, inAction.play);
        menuEntry.addAction(action);
      } else if (angular.isDefined(inAction.say)) {
        action = new Action('say', decodeUtf8(inAction.say.value));
        setDescription(action, inAction.say);
        if (angular.isDefined(inAction.say.voice)) {
          action.setVoice(inAction.say.voice);
        }
        menuEntry.addAction(action);
      } else if (angular.isDefined(inAction.route)) {
        action = new Action('route', inAction.route.destination);
        setDescription(action, inAction.route);
        menuEntry.addAction(action);
      } else if (angular.isDefined(inAction.routeToExtension)) {

        action = new Action('routeToExtension', inAction.routeToExtension.destination);

        setDescription(action, inAction.routeToExtension);

        menuEntry.addAction(action);

      } else if (angular.isDefined(inAction.routeToHuntGroup)) {
        action = new Action('routeToHuntGroup', inAction.routeToHuntGroup.id);
        setDescription(action, inAction.routeToHuntGroup);
        menuEntry.addAction(action);
      } else if (angular.isDefined(inAction.routeToUser)) {
        action = new Action('routeToUser', inAction.routeToUser.id);
        setDescription(action, inAction.routeToUser);
        menuEntry.addAction(action);
      } else if (angular.isDefined(inAction.routeToVoiceMail)) {
        action = new Action('routeToVoiceMail', inAction.routeToVoiceMail.id);
        setDescription(action, inAction.routeToVoiceMail);
        menuEntry.addAction(action);
      } else if (angular.isDefined(inAction.repeatActionsOnInput)) {
        action = new Action('repeatActionsOnInput', '');
        setDescription(action, inAction.repeatActionsOnInput);
        if (_.has(inAction.repeatActionsOnInput, 'level')) {
          action.level = inAction.repeatActionsOnInput.level;
        } else {
          action.level = 0;
        }
        menuEntry.addAction(action);
      } else if (angular.isDefined(inAction.routeToCollectedNumber)) {
        action = new Action('routeToCollectedNumber', '');
        setDescription(action, inAction.routeToCollectedNumber);
        menuEntry.addAction(action);
      } else if (angular.isDefined(inAction.routeToDialedMailbox)) {
        action = new Action('routeToDialedMailbox', '');
        setDescription(action, inAction.routeToDialedMailbox);
        menuEntry.addAction(action);
      } else if (angular.isDefined(inAction.disconnect)) {
        action = new Action('disconnect', '');
        if (angular.isDefined(inAction.disconnect.treatment)) {
          action.setValue(inAction.disconnect.treatment);
        } else {
          action.setValue('none');
        }
        if (angular.isDefined(inAction.disconnect.description)) {
          action.setDescription(inAction.disconnect.description);
        }
        menuEntry.addAction(action);
      } else if (angular.isDefined(inAction.routeToDialed)) {
        action = new Action('routeToDialed', '');
        setDescription(action, inAction.routeToDialed);
        menuEntry.addAction(action);
      } else if (angular.isDefined(inAction.runActionsOnInput)) {
        action = new Action('runActionsOnInput', '');
        if (angular.isDefined(inAction.runActionsOnInput.inputType)) {
          action.inputType = inAction.runActionsOnInput.inputType;
          // check if this dial-by-extension
          if (action.inputType === 2 &&
            angular.isDefined(inAction.runActionsOnInput.prompts.sayList)) {
            var sayList = inAction.runActionsOnInput.prompts.sayList;
            if (sayList.length > 0 && angular.isDefined(sayList[0].value)) {
              action.value = decodeUtf8(inAction.runActionsOnInput.prompts.sayList[0].value);
              action.voice = inAction.runActionsOnInput.voice;
              action.maxNumberOfCharacters = inAction.runActionsOnInput.maxNumberOfCharacters;
              action.minNumberOfCharacters = inAction.runActionsOnInput.minNumberOfCharacters;
              menuEntry.voice = inAction.runActionsOnInput.voice;
              menuEntry.language = inAction.runActionsOnInput.language;
              menuEntry.attempts = inAction.runActionsOnInput.attempts;
              menuEntry.addAction(action);

            }
          }
        }
      } else if (angular.isDefined(inAction.goto)) {
        action = new Action('goto', inAction.goto.ceid);
        if (angular.isDefined(inAction.goto.description)) {
          setDescription(action, inAction.goto.description);
        }

        menuEntry.addAction(action);
      } else if (angular.isDefined(inAction.routeToQueue)) {
        action = new Action('routeToQueue', inAction.routeToQueue.id);
        setDescription(action, inAction.routeToQueue);
        menuEntry.addAction(action);
      } else {
        // insert an empty action
        action = new Action('', '');
        if (angular.isDefined(inAction.description)) {
          action.setDescription(inAction.description);
        }
        menuEntry.addAction(action);
      }
    }

    function parseActions(menuEntry, actions) {
      for (var i = 0; i < actions.length; i++) {
        parseAction(menuEntry, actions[i]);
      }
    }

    function getWelcomeMenu(ceRecord, actionSetName) {

      if (angular.isUndefined(ceRecord) || angular.isUndefined(actionSetName)) {
        return undefined;
      }

      var actionSet = getActionSet(ceRecord, actionSetName);
      if (angular.isUndefined(actionSet)) {
        return undefined;
      }

      if (angular.isUndefined(actionSet.actions)) {
        return undefined;
      }
      var ceActionArray = actionSet.actions;
      var menuEntry;

      var menu = new CeMenu();
      menu.setType('MENU_WELCOME');

      for (var i = 0; i < ceActionArray.length; i++) {
        // dial by extension(runActionsOnInput) and is now ok in the Welcome menu.
        // if inputType is 2 then dial by extension, else make an option menu.

        if (angular.isUndefined(ceActionArray[i].runActionsOnInput) && angular.isUndefined(ceActionArray[i].runCustomActions)) {

          menuEntry = new CeMenuEntry();
          parseAction(menuEntry, ceActionArray[i]);
          if (menuEntry.actions.length > 0) {
            menu.addEntry(menuEntry);
          }
        } else {
          // check for dial by extension - inputType is only 2 for now.
          if (_.has(ceActionArray[i], 'runActionsOnInput.inputType') &&
            ceActionArray[i].runActionsOnInput.inputType === 2) {
            menuEntry = new CeMenuEntry();
            parseAction(menuEntry, ceActionArray[i]);
            if (menuEntry.actions.length > 0) {
              menu.addEntry(menuEntry);
            }
          } else {
            var optionMenu = getOptionMenuFromAction(ceActionArray[i], actionSetName);
            if (angular.isDefined(optionMenu)) {
              menu.addEntry(optionMenu);
            }
          }
        }
      }

      return menu;
    }

    /*
     */
    function getOptionMenu(ceRecord, actionSetName) {

      if (angular.isUndefined(ceRecord) || angular.isUndefined(actionSetName)) {
        return undefined;
      }

      var actionSet = getActionSet(ceRecord, actionSetName);

      if (angular.isUndefined(actionSet)) {
        return undefined;
      }

      if (angular.isUndefined(actionSet.actions)) {
        return undefined;
      }
      var ceActionArray = actionSet.actions;
      //
      // aaActionArray is actionSet['regularOpenActions'],
      // makes up of welcome menu's action objects, main menu object and custom menu object.
      // mainMenu is refered to as OPTION menu in the UI.
      //

      // returns only the first menu it finds
      var i = getActionIndex(ceActionArray, 'runActionsOnInput');
      if (i >= 0) {
        if (angular.isDefined(ceActionArray[i]['runActionsOnInput'])) {
          return getOptionMenuFromAction(ceActionArray[i], actionSetName);
        }
      }
      return undefined;
    }

    function getOptionMenuFromAction(optionMenuAction, actionSetName) {

      if (angular.isDefined(optionMenuAction) && angular.isDefined(optionMenuAction.runActionsOnInput)) {
        var menu = new CeMenu();
        menu.setType('MENU_OPTION');
        var ceActionsOnInput = optionMenuAction.runActionsOnInput;
        var menuEntry;

        // Collect the accouncement header
        var announcementMenuEntry = new CeMenuEntry();
        announcementMenuEntry.setType('MENU_OPTION_ANNOUNCEMENT');
        menu.addHeader(announcementMenuEntry);
        if (angular.isDefined(ceActionsOnInput) && angular.isDefined(ceActionsOnInput.prompts)) {
          if (angular.isDefined(ceActionsOnInput.prompts.description)) {
            announcementMenuEntry.setDescription(ceActionsOnInput.prompts.description);
          }
          if (angular.isDefined(ceActionsOnInput.prompts.sayList)) {
            parseSayList(announcementMenuEntry, ceActionsOnInput.prompts.sayList);
          }
        }

        if (angular.isDefined(ceActionsOnInput.language)) {
          announcementMenuEntry.setLanguage(ceActionsOnInput.language);
        }
        if (angular.isDefined(ceActionsOnInput.voice)) {
          announcementMenuEntry.setVoice(ceActionsOnInput.voice);
        }

        // Collect default handling actions
        var defaultMenuEntry = new CeMenuEntry();
        defaultMenuEntry.setType('MENU_OPTION_DEFAULT');
        menu.addHeader(defaultMenuEntry);

        // Collect timeout handling actions
        var timeoutMenuEntry = new CeMenuEntry();
        timeoutMenuEntry.setType('MENU_OPTION_TIMEOUT');
        timeoutMenuEntry.setTimeout(ceActionsOnInput.timeoutInSeconds || 5);

        if (angular.isDefined(ceActionsOnInput.attempts)) {
          menu.attempts = ceActionsOnInput.attempts;
        }

        // Collect the main menu's options
        if (angular.isDefined(ceActionsOnInput.inputs)) {
          for (var j = 0; j < ceActionsOnInput.inputs.length; j++) {
            var menuOption = ceActionsOnInput.inputs[j];
            if (angular.isDefined(menuOption.input) && menuOption.input === 'default') {
              defaultMenuEntry.setDescription(menuOption.description || '');
              parseActions(defaultMenuEntry, menuOption.actions);
            } else if (angular.isDefined(menuOption.input) && menuOption.input === 'timeout') {
              timeoutMenuEntry.setDescription(menuOption.description || '');
              parseActions(timeoutMenuEntry, menuOption.actions);
              // do not expose timeout entry by default
              menu.addHeader(timeoutMenuEntry);
            } else {
              if (_.has(menuOption, 'input') && _.has(menuOption, 'actions')) {
                if (_.has(menuOption.actions[0], 'runActionsOnInput') &&
                  (!_.has(menuOption.actions[0], 'runActionsOnInput.inputType') ||
                    menuOption.actions[0].runActionsOnInput.inputType !== 2)) {
                  menuEntry = getOptionMenuFromAction(menuOption.actions[0], actionSetName);
                  menuEntry.key = menuOption.input || '';
                } else {
                  menuEntry = new CeMenuEntry();
                  menuEntry.setType('MENU_OPTION');
                  menuEntry.setDescription(menuOption.description || '');
                  menuEntry.setKey(menuOption.input || '');
                  parseActions(menuEntry, menuOption.actions);
                }
                menu.addEntry(menuEntry);
              }
            }
          }
          return menu;
        }
      }
      return undefined;
    }

    function getCustomMenu(ceRecord, actionSetName) {

      if (angular.isUndefined(ceRecord) || angular.isUndefined(actionSetName)) {
        return undefined;
      }

      var actionSet = getActionSet(ceRecord, actionSetName);
      if (angular.isUndefined(actionSet)) {
        return undefined;
      }

      if (angular.isUndefined(actionSet.actions)) {
        return undefined;
      }

      var ceActionArray = actionSet.actions;

      var i = getActionIndex(ceActionArray, 'runCustomActions');

      if (i >= 0) {
        var menu = new CeMenu();
        menu.setType('MENU_CUSTOM');

        var ceCustomActions = ceActionArray[i];
        var menuEntry = new CeMenuEntry();
        for (var attr in ceCustomActions.runCustomActions) {
          menuEntry[attr] = ceCustomActions.runCustomActions[attr];
        }
        menu.addEntry(menuEntry);
        return menu;
      }

      return undefined;
    }

    function getCombinedMenu(ceRecord, actionSetName) {

      var welcomeMenu = getWelcomeMenu(ceRecord, actionSetName);
      if (angular.isDefined(welcomeMenu)) {
        // remove the disconnect action because we manually add it to the UI
        var entries = welcomeMenu.entries;
        if (entries.length > 0) {
          var lastMenuEntry = entries[entries.length - 1];
          if (angular.isDefined(lastMenuEntry.actions) && lastMenuEntry.actions.length > 0) {
            var action = lastMenuEntry.actions[0];
            if (action.name === 'disconnect') {
              entries = entries.pop();
            }
          }
        }
      }
      return welcomeMenu;
    }

    function addDisconnectAction(actions) {
      actions.push({});
      actions[actions.length - 1]['disconnect'] = {
        "treatment": "none"
      };
    }

    function updateScheduleActionSetMap(ceRecord, actionSetName, actionSetValue) {
      if (!ceRecord.scheduleEventTypeMap) {
        ceRecord['scheduleEventTypeMap'] = {};
      }
      if (actionSetName === 'openHours') {
        ceRecord.scheduleEventTypeMap['open'] = actionSetName;
      } else if (actionSetName === 'closedHours') {
        ceRecord.scheduleEventTypeMap['closed'] = actionSetName;
      } else if (actionSetName === 'holidays') {
        ceRecord.scheduleEventTypeMap['holiday'] = actionSetValue;
      }
    }

    function updateDefaultActionSet(ceRecord, hasClosedHours) {
      if (angular.isUndefined(hasClosedHours) && !_.isEmpty(ceRecord.defaultActionSet)) {
        return;
      }
      if (hasClosedHours) {
        ceRecord.defaultActionSet = 'closedHours';
      } else {
        ceRecord.defaultActionSet = 'openHours';
      }
    }

    function updateCombinedMenu(ceRecord, actionSetName, aaCombinedMenu, actionSetValue) {

      updateScheduleActionSetMap(ceRecord, actionSetName, actionSetValue);

      updateMenu(ceRecord, actionSetName, aaCombinedMenu);
      if (aaCombinedMenu.length > 0) {
        if (aaCombinedMenu[aaCombinedMenu.length - 1].getType() === 'MENU_OPTION') {
          updateMenu(ceRecord, actionSetName, aaCombinedMenu[aaCombinedMenu.length - 1]);
        } else {
          deleteMenu(ceRecord, actionSetName, 'MENU_OPTION');
        }
      }
      // manually add a disconnect action to each defined actionSet
      var actionSet = getActionSet(ceRecord, actionSetName);
      if (actionSet.actions && actionSet.actions.length > 0) {
        if (angular.isUndefined(actionSet.actions[actionSet.actions.length - 1].disconnect)) {
          addDisconnectAction(actionSet.actions);
        }
      }
    }

    /*
     * getActionIndex return the index to the given actionName in actionArray.
     *
     * actionArray: array of actions.
     * actionName: 'play', 'route', etc.
     */
    function getActionIndex(actionArray, actionName) {
      if (angular.isUndefined(actionArray) || actionArray === null) {
        return -1;
      }

      if (angular.isUndefined(actionName) || actionName === null) {
        return -1;
      }

      if (!angular.isArray(actionArray)) {
        return -1;
      }

      for (var i = 0; i < actionArray.length; i++) {
        if (angular.isDefined(actionArray[i][actionName])) {
          return i;
        }
      }
      // No Custom Menu found
      return -1;
    }

    function getActionObject(actionArray, actionName) {
      var i = getActionIndex(actionArray, actionName);
      if (i >= 0) {
        return actionArray[i];
      }
      return undefined;
    }

    /*
     * Walk the ceRecord and return the actionSet actionSetName.
     */
    function getActionSet(ceRecord, actionSetName) {
      if (!angular.isArray(ceRecord.actionSets)) {
        return undefined;
      }
      for (var i = 0; i < ceRecord.actionSets.length; i++) {
        if (angular.isDefined(ceRecord.actionSets[i].name) && ceRecord.actionSets[i].name === actionSetName) {
          return ceRecord.actionSets[i];
        }
      }
      return undefined;
    }

    /*
     * Walk the ceRecord and return the given actionSet actionSetName if found.
     * Construct and return one if not found.
     */
    function getAndCreateActionSet(ceRecord, actionSetName) {
      if (angular.isUndefined(ceRecord.actionSets)) {
        ceRecord.actionSets = [];
      }

      var actionSet = getActionSet(ceRecord, actionSetName);
      if (angular.isUndefined(actionSet)) {
        var i = ceRecord.actionSets.length;
        // add new actionSetName into actions array
        ceRecord.actionSets[i] = {};
        ceRecord.actionSets[i].name = actionSetName;
        ceRecord.actionSets[i].actions = [];
        actionSet = ceRecord.actionSets[i];
      }

      return actionSet;
    }

    function updateCustomMenu(ceRecord, actionSetName, aaMenu) {
      var funcname = 'updateCustomMenu';

      // $log.log(funcname + ': ceRecord: ' + JSON.stringify(ceRecord));
      // $log.log(funcname + ': aaMenu: ' + JSON.stringify(aaMenu));
      if (angular.isUndefined(aaMenu.type) || aaMenu.type !== 'MENU_CUSTOM') {
        return false;
      }

      var actionSet = getAndCreateActionSet(ceRecord, actionSetName);

      var customAction = getActionObject(actionSet.actions, 'runCustomActions');
      if (angular.isUndefined(customAction)) {
        var i = actionSet.actions.length;
        actionSet.actions[i] = {};
        actionSet.actions[i].runCustomActions = new CustomAction();
        customAction = actionSet.actions[i];
      }

      for (var attr in customAction['runCustomActions']) {
        customAction['runCustomActions'][attr] = aaMenu.entries[0][attr];
      }
      // $log.log(funcname + ': ceRecord: ' + JSON.stringify(ceRecord));
      return true;
    }

    function createWelcomeMenu(aaMenu) {
      var newActionArray = [];
      for (var i = 0; i < aaMenu.entries.length; i++) {
        var menuEntry = aaMenu.entries[i];
        newActionArray[i] = {};
        if (menuEntry.type === 'MENU_OPTION') {
          newActionArray[i].runActionsOnInput = newRunActionsOnInput();
          createOptionMenu(newActionArray[i].runActionsOnInput, menuEntry);
        } else {
          if (angular.isDefined(menuEntry.actions) && menuEntry.actions.length > 0) {
            var actionName = menuEntry.actions[0].getName();
            newActionArray[i][actionName] = {};
            if (angular.isDefined(menuEntry.actions[0].description) && menuEntry.actions[0].description.length > 0) {
              newActionArray[i][actionName].description = menuEntry.actions[0].description;
            }
            if (actionName === 'say') {
              newActionArray[i][actionName].value = encodeUtf8(menuEntry.actions[0].getValue());
              newActionArray[i][actionName].voice = menuEntry.actions[0].voice;
            } else if (actionName === 'play') {
              newActionArray[i][actionName].url = menuEntry.actions[0].getValue();
              // newActionArray[i][actionName].url = MediaResourceService.getFileUrl(menuEntry.actions[0].getValue());
            } else if (actionName === 'route') {
              newActionArray[i][actionName].destination = menuEntry.actions[0].getValue();
            } else if (actionName === 'routeToVoiceMail') {
              newActionArray[i][actionName].id = menuEntry.actions[0].getValue();
            } else if (actionName === 'routeToUser') {
              newActionArray[i][actionName].id = menuEntry.actions[0].getValue();
            } else if (actionName === 'disconnect') {
              if (menuEntry.actions[0].getValue() && menuEntry.actions[0].getValue() !== 'none') {
                newActionArray[i][actionName].treatment = menuEntry.actions[0].getValue();
              }
            } else if (actionName === 'goto') {
              newActionArray[i][actionName].ceid = menuEntry.actions[0].getValue();
            } else if (actionName === 'routeToHuntGroup') {
              newActionArray[i][actionName].id = menuEntry.actions[0].getValue();
            } else if (actionName === 'routeToQueue') {
              newActionArray[i][actionName].id = menuEntry.actions[0].getValue();
            } else if (actionName === 'runActionsOnInput') {
              if (menuEntry.actions[0].inputType === 2) {
                newActionArray[i][actionName] = populateRunActionsOnInput(menuEntry.actions[0]);
                newActionArray[i][actionName].attempts = menuEntry.attempts;
                newActionArray[i][actionName].voice = menuEntry.actions[0].voice;
                newActionArray[i][actionName].language = menuEntry.actions[0].language;
              }
            }

          }
        }
      }
      return newActionArray;
    }

    function updateWelcomeMenu(ceRecord, actionSetName, aaMenu) {
      if (angular.isUndefined(aaMenu.type) || aaMenu.type !== 'MENU_WELCOME') {
        return false;
      }

      if (angular.isUndefined(ceRecord.actionSets)) {
        ceRecord.actionSets = [];
      }

      var actionSet = getAndCreateActionSet(ceRecord, actionSetName);
      actionSet.actions = createWelcomeMenu(aaMenu);

      return true;
    }

    function createActionArray(actions) {
      var newActionArray = [];
      for (var i = 0; i < actions.length; i++) {
        newActionArray[i] = {};
        var actionName = actions[i].getName();
        var val = actions[i].getValue();
        newActionArray[i][actionName] = {};
        if (actionName === 'say') {
          newActionArray[i][actionName].value = encodeUtf8(val);
          newActionArray[i][actionName].voice = actions[i].voice;
        } else if (actionName === 'play') {
          // convert unique filename to corresponding URL
          newActionArray[i][actionName].url = val;
          // newActionArray[i][actionName].url = MediaResourceService.getFileUrl(val);
        } else if (actionName === 'route') {
          newActionArray[i][actionName].destination = val;
        } else if (actionName === 'routeToExtension') {
          newActionArray[i][actionName].destination = val;
        } else if (actionName === 'routeToVoiceMail') {
          newActionArray[i][actionName].id = val;
        } else if (actionName === 'routeToHuntGroup') {
          newActionArray[i][actionName].id = val;
        } else if (actionName === 'routeToUser') {
          newActionArray[i][actionName].id = val;
        } else if (actionName === 'goto') {
          newActionArray[i][actionName].ceid = val;
        } else if (actionName === 'routeToQueue') {
          newActionArray[i][actionName].id = val;
        } else if (actionName === 'disconnect') {
          if (val && val !== 'none') {
            newActionArray[i][actionName].treatment = val;
          }
        } else if (actionName === 'runActionsOnInput') {
          newActionArray[i][actionName] = populateRunActionsOnInput(actions[i]);
        } else if (actionName === 'repeatActionsOnInput' && _.has(actions[i], 'level')) {
          newActionArray[i][actionName].level = actions[i].level;
        }

        if (angular.isDefined(actions[i].description) && actions[i].description.length > 0) {
          newActionArray[i][actionName].description = actions[i].description;
        }
      }
      return newActionArray;
    }

    /*
     * Set the defaults for Dial by Extension
     */
    function populateRunActionsOnInput(action) {
      var newAction = {};
      if (angular.isDefined(action.inputType)) {
        newAction.inputType = action.inputType;
        if (newAction.inputType == 2 && angular.isDefined(action.value)) {
          var prompts = {};
          var sayListArr = [];
          var sayList = {};
          sayList.value = encodeUtf8(action.value);
          sayListArr[0] = sayList;
          prompts.sayList = sayListArr;
          newAction.prompts = prompts;
          var rawInputAction = {};
          var routeToExtension = {};
          routeToExtension.destination = '$Input';
          routeToExtension.description = action.description;
          rawInputAction.routeToExtension = routeToExtension;
          newAction.rawInputActions = [];
          newAction.rawInputActions[0] = rawInputAction;
          newAction.minNumberOfCharacters = action.minNumberOfCharacters;
          newAction.maxNumberOfCharacters = action.maxNumberOfCharacters;
          newAction.attempts = 3;
          newAction.repeats = 2;
        }
      }
      return newAction;
    }
    /*
     * Read aaMenu and populate mainMenu object
     */
    function createOptionMenu(inputAction, aaMenu) {

      // create menuOptions section
      var newOptionArray = [];
      var menuEntry;

      for (var i = 0; i < aaMenu.entries.length; i++) {
        menuEntry = aaMenu.entries[i];
        // skip incomplete key/action definition
        if (menuEntry.key && _.has(menuEntry, 'actions') && menuEntry.actions.length > 0 && menuEntry.actions[0].name) {
          var newOption = {};
          newOption.description = menuEntry.description;
          newOption.input = menuEntry.key;
          newOption.actions = createActionArray(menuEntry.actions);
          newOptionArray.push(newOption);
        } else if (menuEntry.key && _.has(menuEntry, 'entries') && _.has(menuEntry, 'headers')) {
          var newOption = {};
          if (angular.isDefined(menuEntry.description)) {
            newOption.description = menuEntry.description;
          }
          newOption.input = menuEntry.key;
          newOption.actions = [];
          newOption.actions[0] = {};
          var _menu = newRunActionsOnInput();
          // for submenu, always return to parent when invalid inputs timeout.
          newOption.actions[0]['runActionsOnInput'] = _menu;
          newOption.actions[0]['runActionsOnInput']['incompleteInputActions'] = [{
            "repeatActionsOnInput": {
              "level": -1
            }
          }];
          createOptionMenu(_menu, menuEntry);
          newOptionArray.push(newOption);
        }
      }

      // sort menu keys in ascending order
      newOptionArray.sort(function (a, b) {
        return a.input.localeCompare(b.input);
      });

      // create prompts section
      if (aaMenu.headers.length > 0) {
        menuEntry = aaMenu.headers[0];
        inputAction.prompts = {};
        inputAction.prompts.description = menuEntry.description;
        inputAction.prompts.sayList = createSayList(menuEntry.actions);
        if (_.has(aaMenu, 'attempts')) {
          inputAction.attempts = aaMenu.attempts;
        }
        inputAction.language = menuEntry.getLanguage();
        inputAction.voice = menuEntry.getVoice();
        // for Dial by Extension we need to copy the Phone Menu voice & language
        _.each(newOptionArray, function (obj) {
          if (obj.actions[0].runActionsOnInput &&
            obj.actions[0].runActionsOnInput.inputType === 2) {
            obj.actions[0].runActionsOnInput.voice = inputAction.voice;
            obj.actions[0].runActionsOnInput.language = inputAction.language;
          }
        });
      }

      if (aaMenu.headers.length > 1) {
        // create default action
        i = aaMenu.entries.length;
        menuEntry = aaMenu.headers[1];
        if (angular.isDefined(menuEntry.actions) && menuEntry.actions.length > 0) {
          newOptionArray[i] = {};
          newOptionArray[i].description = menuEntry.description;
          newOptionArray[i].input = 'default';
          newOptionArray[i].actions = createActionArray(menuEntry.actions);
        }
      }

      // create timeout section
      // i = aaMenu.entries.length;
      // menuEntry = aaMenu.headers[2];
      // newOptionArray[i] = {};
      // newOptionArray[i].description = menuEntry.description;
      // newOptionArray[i].input = 'timeout';
      // newOptionArray[i].actions = createActionArray(menuEntry.actions);
      // inputAction.timeoutInSeconds = menuEntry.getTimeout();

      inputAction.inputs = newOptionArray;
    }

    function updateOptionMenu(ceRecord, actionSetName, aaMenu) {
      if (angular.isUndefined(aaMenu.type) || aaMenu.type !== 'MENU_OPTION') {
        return false;
      }

      var actionSet = getAndCreateActionSet(ceRecord, actionSetName);
      var inputAction = getActionObject(actionSet.actions, 'runActionsOnInput');
      if (angular.isUndefined(inputAction)) {
        var i = actionSet.actions.length;
        actionSet.actions[i] = {};
        actionSet.actions[i].runActionsOnInput = newRunActionsOnInput();
        inputAction = actionSet.actions[i];
      }
      createOptionMenu(inputAction.runActionsOnInput, aaMenu);

      return true;
    }

    function updateMenu(ceRecord, actionSetName, aaMenu) {
      if (angular.isUndefined(aaMenu.type) || aaMenu.type === null) {
        return false;
      }
      if (aaMenu.type === 'MENU_WELCOME') {
        updateWelcomeMenu(ceRecord, actionSetName, aaMenu);
      } else if (aaMenu.type === 'MENU_OPTION') {
        updateOptionMenu(ceRecord, actionSetName, aaMenu);
      } else if (aaMenu.type === 'MENU_CUSTOM') {
        updateCustomMenu(ceRecord, actionSetName, aaMenu);
      }
      return true;
    }

    /*
     * actionSetName: 'regularOpenActions'
     * aaMenuType: 'MENU_CUSTOM', 'MENU_MAIN'
     * ceRecord: a customer AA record
     */
    function deleteMenu(ceRecord, actionSetName, aaMenuType) {

      if (angular.isUndefined(actionSetName) || actionSetName === null) {
        return false;
      }

      if (angular.isUndefined(aaMenuType) || aaMenuType === null) {
        return false;
      }

      if (angular.isUndefined(ceRecord) || ceRecord === null) {
        return false;
      }

      // get the action object of actionSetName
      //
      var actionSet = getActionSet(ceRecord, actionSetName);
      if (angular.isUndefined(actionSet)) {
        return false;
      }

      if (angular.isUndefined(actionSet.actions)) {
        return false;
      }

      var aaActionArray = actionSet.actions;
      var i = -1;
      if (aaMenuType === 'MENU_CUSTOM') {
        i = getActionIndex(aaActionArray, 'runCustomActions');
      }

      if (aaMenuType === 'MENU_OPTION') {
        i = getActionIndex(aaActionArray, 'runActionsOnInput');
      }

      if (i >= 0) {
        aaActionArray.splice(i, 1);
        return true;
      }
      return false;
    }

    function deleteScheduleActionSetMap(ceRecord, actionSetName) {
      // remove associated schedule to actionSet map, e.g.,
      // scheduleEventTypeMap.open = 'openHours'
      var prop;
      if (!ceRecord.scheduleEventTypeMap) {
        return;
      }
      if (actionSetName === 'holidays') {
        prop = 'holiday';
      } else if (actionSetName === 'closedHours') {
        prop = 'closed';
      } else {
        prop = 'open';
      }
      if (prop) {
        delete ceRecord.scheduleEventTypeMap[prop];
      }
    }

    /*
     * actionSetName: 'regularOpenActions'
     * ceRecord: a customer AA record
     */
    function deleteCombinedMenu(ceRecord, actionSetName) {

      if (angular.isUndefined(actionSetName) || actionSetName === null) {
        return false;
      }

      if (angular.isUndefined(ceRecord) || ceRecord === null) {
        return false;
      }

      // remove associated schedule to actionSet map, e.g.,
      // scheduleEventTypeMap.open = 'openHours'
      deleteScheduleActionSetMap(ceRecord, actionSetName);

      // get the action object of actionSetName
      //
      for (var i = 0; i < ceRecord.actionSets.length; i++) {
        if (ceRecord.actionSets[i].name === actionSetName) {
          ceRecord.actionSets.splice(i, 1);
          return true;
        }
      }
      return false;
    }

    function objectType(obj) {
      if (obj) {
        var text = obj.constructor.toString();
        return text.match(/function (.*)\(/)[1];
      } else {
        return undefined;
      }
    }

    function getCeMenu(id) {
      return ceMenuMap[id];
    }

    function clearCeMenuMap() {
      ceMenuMap = {};
      ceMenuCount = 0;
    }

    function deleteCeMenuMap(menuId) {
      var menu = ceMenuMap[menuId];
      if (menu) {
        _.forEach(menu.entries, function (entry) {
          if (objectType(entry) === 'CeMenu') {
            deleteCeMenuMap(entry.getId());
          }
        });
        delete ceMenuMap[menuId];
      }
    }

    function isCeMenu(obj) {
      return (objectType(obj) === 'CeMenu');
    }
  }
})();
