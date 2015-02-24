'use strict';

angular.module('Hercules')
  .service('XhrNotificationService', ['Notification',
    function XhrNotificationService(notification) {

      var findMessages = function (data, messages) {
        messages = messages || [];
        _.each(data, function (val, key) {
          if (key == 'message') {
            if (_.isArray(val)) {
              _.each(val, function (m) {
                if (_.isPlainObject(m) || _.isArray(m)) {
                  findMessages(m, messages);
                } else {
                  messages.push(m);
                }
              });
            } else {
              messages.push(val);
            }
          } else if (_.isPlainObject(val) || _.isArray(val)) {
            findMessages(val, messages);
          }
        });
        return messages;
      };

      var getMessages = function (data, status, headers, config) {
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
            messages = this.getMessages(args);
            messages.unshift(messageOrArgs);
          } else {
            messages = this.getMessages(messageOrArgs);
          }
          return notification.notify(messages, 'error');
        },
        getMessages: function (args) {
          return getMessages.apply(null, args);
        }
      };
    }
  ]);
