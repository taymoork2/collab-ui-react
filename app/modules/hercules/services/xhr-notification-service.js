'use strict';

angular.module('Hercules')
  .service('XhrNotificationService', ['Notification',
    function XhrNotificationService(notification) {

      var findMessages = function (data, messages) {
        messages = messages || [];
        if (_.isPlainObject(data) || _.isArray(data)) {
          _.each(data, function (val, key) {
            if (key == 'message' || key == 'description') {
              if (_.isString(val)) {
                messages.push(val);
              }
              if (_.isArray(val)) {
                _.each(val, function (v, k) {
                  if (!k && _.isString(v)) {
                    messages.push(v);
                  }
                });
              }
            }
            findMessages(val, messages);
          });
        }
        return messages;
      };

      var getMessages = function (data, status) {
        data = data && data.data ? data.data : data;
        if (data && data.error && data.error.message) {
          return findMessages(data);
        } else {
          return [status ? 'Backend responded with status ' + status + '.' : 'Backend responded with an unknown status.'];
        }
      };

      return {
        notify: function (messageOrArgs, args) {
          var messages;
          if (args) {
            messages = getMessages.apply(null, args);
            messages.unshift(messageOrArgs);
          } else {
            messageOrArgs = _.isArray(messageOrArgs) ? messageOrArgs : [messageOrArgs];
            messages = getMessages.apply(null, messageOrArgs);
          }
          return notification.notify(messages, 'error');
        },
        getMessages: function (args) {
          return getMessages.apply(null, args);
        }
      };
    }
  ]);
