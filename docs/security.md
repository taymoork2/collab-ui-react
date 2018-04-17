# Atlas UI Security

* [General Security Guidelines](https://wiki.cisco.com/display/WX2/Atlas%20Security%20Guidelines)
* Front-End Security Guidelines [Atlas Front-end Security Guidelines Wiki](https://wiki.cisco.com/display/WX2/Atlas%20Security%20Guidelines#AtlasSecurityGuidelines-Frontend)
* [AngularJS 1.x Security Guidelines](https://docs.angularjs.org/guide/security)

## Content Security Policy
* [What is a Content Security Policy?](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
* [Why use a CSP?](https://csp.withgoogle.com/docs/why-csp.html)

### Adding a directive URI to the Atlas Content Security Policy:
* If you are trying to hit a local server for testing purposes, please add the url under the correct directive inside the `config/csp-dev.config.js` file.

* If you are working on a feature that introduces an API call to a domain not listed in our Content Security Policy white-list, you'll need to add it to our config files. If it is a trusted url on https and it is not a local address, you can add it to the `config/csp-prod.config.js` file. 
* In your PR, please tag (@WebExSquared/atlas-security-ninjas , @WebExSquared/atlas-web-core-team , @shrazzac, @degrazia) and do not merge until you are given approval and the CSP directive has been introduced to prod. 
* After your PR is merged, you will need to apply the same change in [Platform-Common/static-nginx-configs](https://sqbu-github.cisco.com/Platform-Common/static-nginx-configs) for the following files:
  * admin-client-cfe.conf
  * admin-client-int.conf

for examples of this change see: https://sqbu-github.cisco.com/Platform-Common/static-nginx-configs/pull/34/files


## Ongoing security work:
* Currently we have a phased approach applying strict security standards to the Admin Client (Atlas Web). In Phase 1 we introduced the CSP to our development environment as a middleware. In phase 2 we applied the CSP to the integration and CFE environments. Next we will introduce a reports URI to the CSP to track any violations. We will apply the CSP to the production environment soon.

* Another facet of our approach to security on Atlas is our intent to introduce security testing upon build and test before the validated merge into the integration and production environments. We intend exploring multiple solutions in addition to RetireJS that will test node/npm modules for vulnerabilities and other security holes in the Atlas code itself.
