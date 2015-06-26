'use strict';

angular.module('uc.autoattendant')
  .filter('displayNameAction', function ($translate) {
    var displayNameActionMap = {
      "play": "common.play",
      "disconnect": "autoAttendant.disconnect",
      "route": "autoAttendant.routeToNumber",
      "routeToDialed": "autoAttendant.routeToDialedNumber",
      "routeToMailbox": "autoAttendant.routeToMailbox",
      "routeToDialedMailbox": "autoAttendant.routeToDialedMailbox",
      "routeToCollectedNumber": "autoAttendant.routeToCollectedNumber",
      "repeatActionsOnInput": "autoAttendant.repeatMenu",
      "busy": "autoAttendant.disconnectBusy",
      "reorder": "autoAttendant.disconnectTone",
      "none": "autoAttendant.disconnectNone",
    };

    return function (menuEntry) {
      var displayName = '';
      if (angular.isUndefined(menuEntry) || angular.isUndefined(menuEntry.actions[0]) || angular.isUndefined(menuEntry.actions[0].name))
        return displayName;

      // set the display name for this action
      displayName = $translate.instant(displayNameActionMap[menuEntry.actions[0].name]);

      // add any input value for this action
      if (displayName && menuEntry.actions[0].value) {
        if (menuEntry.actions[0].name === "disconnect") {
          displayName = displayName.concat(" ").concat($translate.instant(displayNameActionMap[menuEntry.actions[0].value]));
        } else {
          displayName = displayName.concat(" ").concat(menuEntry.actions[0].value);
        }
      }

      return displayName;
    };
  })
  .filter('displayNameTitle', function ($translate, displayNameActionFilter) {
    var displayNameTitleMap = {
      "play": "autoAttendant.announcement",
      "disconnect": "autoAttendant.disconnect",
      "route": "autoAttendant.routeToNumber",
      "routeToDialed": "autoAttendant.routeToDialedNumber",
      "routeToMailbox": "autoAttendant.routeToMailbox",
      "routeToDialedMailbox": "autoAttendant.routeToDialedMailbox",
      "routeToCollectedNumber": "autoAttendant.routeToCollectedNumber",
      "repeatActionsOnInput": "autoAttendant.repeatMenu",
    };

    var displayNamePlaceholderMap = {
      "play": "autoAttendant.announcementPlaceholder",
      "disconnect": "autoAttendant.disconnectPlaceholder",
      "route": "autoAttendant.routeToNumberPlaceholder",
      "routeToDialed": "autoAttendant.routeToDialedNumberPlaceholder",
      "routeToMailbox": "autoAttendant.routeToMailboxPlaceholder",
      "routeToDialedMailbox": "autoAttendant.routeToDialedMailboxPlaceholder",
      "routeToCollectedNumber": "autoAttendant.routeToCollectedNumberPlaceholder",
      "repeatActionsOnInput": "autoAttendant.repeatMenuPlaceholder",
    };

    return function (menuEntry) {
      var displayName = '';
      if (angular.isUndefined(menuEntry)) {
        return displayName;
      }

      // title by entry type
      var type = menuEntry.type;
      switch (type) {
      case 'MENU_OPTION_DEFAULT':
        if (menuEntry.isConfigured) {
          displayName = $translate.instant("autoAttendant.optionForInvalidInput");
        } else {
          displayName = $translate.instant("autoAttendant.optionForInvalidInputPlaceholder");
        }
        break;

      case 'MENU_OPTION_TIMEOUT':
        if (menuEntry.isConfigured) {
          displayName = $translate.instant("autoAttendant.timeoutOption");
        } else {
          displayName = $translate.instant("autoAttendant.timeoutOptionPlaceholder");
        }
        break;

      case 'MENU_OPTION_ANNOUNCEMENT':
        if (menuEntry.isConfigured) {
          displayName = $translate.instant("autoAttendant.announcementMenu");
        } else {
          displayName = $translate.instant("autoAttendant.announcementMenuPlaceholder");
        }
        break;

      case 'MENU_OPTION':
        if (menuEntry.isConfigured) {
          displayName = $translate.instant("autoAttendant.menuOption");
        } else {
          displayName = $translate.instant("autoAttendant.configureMenuOption");
        }
        break;

      default:
        // title by action name
        if (menuEntry.actions !== undefined && menuEntry.actions.length > 0) {
          if (menuEntry.isConfigured) {
            displayName = $translate.instant(displayNameTitleMap[menuEntry.actions[0].name]);
          } else {
            displayName = $translate.instant(displayNamePlaceholderMap[menuEntry.actions[0].name]);
          }
        }
      }
      return displayName;
    };
  });
