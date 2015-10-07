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
    var todos = {
      type: 'todo',
      notifications: {}
    };
    var alerts = {
      type: 'alert',
      notifications: {}
    };
    var notificationStatus = {
      count: 0,
      types: [alerts, todos]
    };

    function addNotification(type, id, priority, template, data) {
      var collection = _.find(notificationStatus.types, {
        type: type
      }) || {
        notifications: {}
      };
      collection.notifications[id] = new Notification(type, id, priority, template, data);
      notificationStatus.count = _.size(todos.notifications) + _.size(alerts.notifications);
    }

    function removeNotification(type, id) {
      var collection = _.find(notificationStatus.types, {
        type: type
      }) || {
        notifications: {}
      };
      delete collection.notifications[id];
    }

    function getNotifications() {
      return _.sortBy(notifications, 'type');
    }

    function getNotificationStatus() {
      return notificationStatus;
    }

    function getNotificationLength() {
      return _.size(notifications);
    }

    return {
      addNotification: addNotification,
      getNotifications: getNotifications,
      getNotificationLength: getNotificationLength,
      getNotificationStatus: getNotificationStatus,
      removeNotification: removeNotification
    };
  }

  angular
    .module('Hercules')
    .service('NotificationService', NotificationService);
}());
