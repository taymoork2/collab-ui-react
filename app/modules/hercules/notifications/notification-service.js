(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('NotificationService', NotificationService);

  /* @ngInject */
  function NotificationService() {
    var notifications = [];

    function addNotification(type, id, priority, template, tags, data) {
      removeNotification(id);
      notifications.push(new Notification(type, id, priority, template, tags, (data || {})));
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
