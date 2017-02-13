(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('NotificationService', NotificationService);

  /* @ngInject */
  function NotificationService() {
    var notifications = [];

    function addNotification(type, id, priority, template, tags, data) {
      var notification = new Notification(type, id, priority, template, tags, (data || {}));
      var existingIndex = _.findIndex(notifications, { 'id': id });
      if (existingIndex >= 0) {
        // Replace if it already exists (to avoid UI "flip-flapping") compared to remove/add
        notifications.splice(existingIndex, 1, notification);
      } else {
        notifications.push(notification);
      }
    }

    function removeNotification(id) {
      _.remove(notifications, {
        id: id
      });
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
        CRITICAL: 'critical',
        ALERT: 'alert',
        TODO: 'todo',
        NEW: 'new',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info',
      }
    };
  }

  function Notification(type, id, priority, template, tags, data) {
    this.type = type;
    this.template = template;
    this.id = id;
    this.priority = priority;
    this.tags = tags;
    this.data = data;
  }

}());
