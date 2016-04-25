'use strict';

angular.module('WebExApp')
  .service('webExXmlApiInfoObj', webExXmlApiInfoObj);

function webExXmlApiInfoObj() {
  return {
    xmlApiUrl: "",
    webexAdminID: "",
    webexSessionTicket: "",
    webexUserId: ""
  }; // return
} // WebExXmlApiInfo()
