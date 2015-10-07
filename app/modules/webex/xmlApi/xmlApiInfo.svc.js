'use strict';

angular.module('WebExXmlApi')
  .service('WebExXmlApiInfoSvc', [
    function WebExXmlApiInfo() {
      return {
        xmlServerURL: "",
        webexAdminID: "",
        webexSessionTicket: "",
        webexUserId: ""
      }; // return
    } // WebExXmlApiInfo()
  ]); // service()
