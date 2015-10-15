(function () {
  'use strict';

  function Notification(type, id, priority, template, data) {
    this.type = type;
    this.template = template;
    this.data = data;
    this.id = id;
    this.priority = priority;
  }

  /* @ngInject */
  function NotificationService() {
    var notifications = {};

    function addNotification(type, id, priority, template, data) {
      notifications[id] = new Notification(type, id, priority, template, data);
    }

    function removeNotification(id) {
      delete notifications[id];
    }

    function getNotifications() {
      return notifications;
    }

    function getNotificationLength() {
      return _.size(notifications);
    }

    return {
      addNotification: addNotification,
      getNotifications: getNotifications,
      getNotificationLength: getNotificationLength,
      removeNotification: removeNotification,
      types: {
        ALERT: 'alert',
        TODO: 'todo'
      }
    };
  }

  angular
    .module('Hercules')
    .service('NotificationService', NotificationService);
}());
