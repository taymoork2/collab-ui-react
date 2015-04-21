'use strict';

angular.module('WebExUserSettings')
  .service('XmlApiInfoSvc', [
    function XmlApiInfo() {
      return {
        xmlServerURL: "",
        webexAdminID: "",
        webexSessionTicket: "",
        webexUserId: ""
      }; // return
    } // XmlApiInfo()
  ]); // service()
