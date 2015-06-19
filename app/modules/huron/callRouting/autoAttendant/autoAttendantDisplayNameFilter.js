'use strict';

angular.module('uc.autoattendant')
  .filter('displayNameAction', function () {

    var configuredDisplayNameMap = {
      "play": "common.play",
      "disconnect": "autoAttendant.disconnect",
      "route": "autoAttendant.routeToNumber",
      "routeToDialed": "autoAttendant.routeDialedNumber",
      "routeToMailbox": "autoAttendant.routeMailbox",
      "routeToDialedMailbox": "autoAttendant.routeDialedMailbox",
      "routeToCollectedNumber": "autoAttendant.routeCollectedNumber",
      "repeatActionsOnInput": "autoAttendant.repeatMenu",
    };

    return function (name) {
      var displayName = '';
      if (angular.isUndefined(name))
        return displayName;

      displayName = configuredDisplayNameMap[name];

      return displayName;
    };
  })
  .filter('displayNameTitle', function () {
    var configuredDisplayNameMap = {
      "play": "common.play",
      "disconnect": "autoAttendant.disconnect",
      "route": "autoAttendant.routeToNumber",
      "routeToDialed": "autoAttendant.routeDialedNumber",
      "routeToMailbox": "autoAttendant.routeMailbox",
      "routeToDialedMailbox": "autoAttendant.routeDialedMailbox",
      "routeToCollectedNumber": "autoAttendant.routeCollectedNumber",
      "repeatActionsOnInput": "autoAttendant.repeatMenu",
      "configureMenuOption": "autoAttendant.configureMenuOption",
    };

    var placeholderDisplayNameMap = {
      "play": "autoAttendant.playPlaceholder",
      "disconnect": "autoAttendant.disconnectPlaceholder",
      "route": "autoAttendant.routeToNumberPlaceholder",
      "routeToDialed": "autoAttendant.routeToDialedNumberPlaceholder",
      "routeToMailbox": "autoAttendant.routeToMailboxPlaceholder",
      "routeToDialedMailbox": "autoAttendant.routeToDialedMailboxPlaceholder",
      "routeToCollectedNumber": "autoAttendant.routeToCollectedNumberPlaceholder",
      "repeatActionsOnInput": "autoAttendant.repeatMenuPlaceholder",
      "configureMenuOption": "autoAttendant.configureMenuOption",
    };

    return function (menuEntry) {
      var displayName = '';
      if (angular.isUndefined(menuEntry)) {
        return displayName;
      }

      var type = menuEntry.type;
      switch (type) {
      case 'MENU_OPTION_DEFAULT':
        if (menuEntry.isConfigured) {
          displayName = "autoAttendant.optionForInvalidInput";
        } else {
          displayName = "autoAttendant.optionForInvalidInputPlaceholder";
        }
        break;

      case 'MENU_OPTION_TIMEOUT':
        if (menuEntry.isConfigured) {
          displayName = "autoAttendant.timeoutOption";
        } else {
          displayName = "autoAttendant.timeoutOptionPlaceholder";
        }
        break;

      case 'MENU_OPTION_ANNOUNCEMENT':
        if (menuEntry.isConfigured) {
          displayName = "autoAttendant.announcement";
        } else {
          displayName = "autoAttendant.announcementPlaceholder";
        }
        break;

      default:
        if (menuEntry.actions !== undefined && menuEntry.actions.length > 0) {
          if (menuEntry.isConfigured) {
            displayName = configuredDisplayNameMap[menuEntry.actions[0].name];
          } else {
            displayName = placeholderDisplayNameMap[menuEntry.actions[0].name];
          }
        }
      }
      return displayName;
    };
  });
