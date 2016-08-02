## What is Webpack? ##

Simply put, webpack is a module bundler that can load any type of module and produce a corresponding static asset.  Read up on webpack [here](https://webpack.github.io/docs/what-is-webpack.html)!

## Goals of using Webpack ##

* Split Atlas into self-contained modules that require their own dependencies
* Lazy load resources on-demand to reduce application load time
  * Current lazy-loaded modules are login, stateRedirect, and main (require all app files dynamically)
* Maintain build functionality parity with existing gulp tasks
* RIP gulp