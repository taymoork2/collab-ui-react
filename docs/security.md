# Atlas UI Security

* [General Security Guidelines](https://wiki.cisco.com/display/WX2/Atlas%20Security%20Guidelines)
* Front-End Security Guidelines [Atlas Front-end Security Guidelines Wiki](https://wiki.cisco.com/display/WX2/Atlas%20Security%20Guidelines#AtlasSecurityGuidelines-Frontend)
* [AngularJS 1.x Security Guidelines](https://docs.angularjs.org/guide/security)

## Content Security Policy
* [What is a Content Security Policy?](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
* [Why use a CSP?](https://csp.withgoogle.com/docs/why-csp.html)
* If you are working on a feature that introduces an API call to a domain not listed in our Content Security Policy white-list,
* you'll need to add it to our config files. If its a trusted url on https and its not a local address, you can add it to the
* `config/csp-prod.config.js` file. If you are trying to hit a local server for testing purposes, please add the url under 
* the correct directive inside the `config/csp-dev.config.js` file.
