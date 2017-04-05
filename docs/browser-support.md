# Browser support

Our official browser support statement can be found on [Help Central](https://help.webex.com/docs/DOC-10628).

But when we speak about browser support, `code > documentation`, so let's see what our code is saying:

## Short answer

Latest 2 major versions of the main browsers, and IE 11.

## Long answer

* `index.html` displays a message for Internet Explorer strictly inferior to 11.
* Most developers only test in their main browsers, which is either the latest Chrome or latest Firefox.
* Developers don't use any [vendor prefixes](http://google.com) when authoring CSS, `autoprefixer` does it for them at build time. It is configured to adapt the CSS for the [`last 2 versions`](http://browserl.ist/?q=last+2+versions) of major browsers.

## Testing with Edge and Internet Explorer

Many, if not all, Atlas UI developers are using macOS, so testing on Internet Explorer can be tricky.

You can either use:
* [VirtualBox + an official virtual machine from Microsoft](https://developer.microsoft.com/en-us/microsoft-edge/tools/vms/) (expiring after 90 days, sometimes you can recharge it, other times you have to download a new one). [Read detailed article](https://sqbu-github.cisco.com/WebExSquared/wx2-admin-web-client/wiki/Windows-7-VM-%28VirtualBox%29-for-testing).
* Use [VMWare Fusion and Windows 10](https://cisco.jiveon.com/docs/DOC-64798) provided by Cisco.
