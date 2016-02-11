'use strict';

angular.module('WebExApp')
  .service('WebExXmlApiInfoSvc', [
    function WebExXmlApiInfo() {
      return {
        xmlApiUrl: "",
        webexAdminID: "",
        webexSessionTicket: "",
        webexUserId: ""
      }; // return
    } // WebExXmlApiInfo()
  ]); // service()
