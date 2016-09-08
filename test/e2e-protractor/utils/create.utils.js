'use strict';

/* global Promise */

var config = require('./test.config.js');
var utils = require('./test.utils.js');
var request = require('request');

//
//createRouteToQueue - create queues 
//
//Used to create queues created in the test

exports.createRouteToQueue = function () {
      helper.getBearerToken('aa-admin')
    .then(function (bearer) {
      var options = {
       method: 'put',
        url: config.getAutoAttendantQueueUrl(helper.auth['aa-admin'].org),
        headers: {
                 'Content-Type': 'application/json',
                 'Authorization': 'Bearer ' + bearer
        },
        body: JSON.stringify({
        	'queueName': 'Sunlight 1',
        	'handlerUrl': ['http://127.0.0.1:8202/vmrest1/webresources/user/send2', 'http://sunlight URL2']
        	})
      };
      
      return utils.sendRequest(options)
      .then(function () {
        return 200;
      });

    });
 };
