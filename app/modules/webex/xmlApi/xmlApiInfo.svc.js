'use strict';

angular.module('WebExXmlApi')
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
