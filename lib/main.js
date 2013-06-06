var widget = require("sdk/widget").Widget({
  id: "standalone-widget",
  label: "Install Current Page as App",
  contentURL: 'chrome://browser/skin/webapps-16.png'
})

widget.on('click', function() {
  var tab = require('sdk/tabs').activeTab
  var manifestObj = generateManifestForTab(tab)
  installAppFromManifestObj(manifestObj)
})

function generateManifestForTab(tab) {
  return {
    //"version": "1",
    "name": tab.title, // TODO: shorten to 128
    "launch_path": require('url').URL(tab.url).path,
    "url": tab.url,
    "description": "Standalone: The Web in an App Form-factor.",
    "icons": {
      "16": tab.favicon
    }   
  }
}

function installAppFromManifestObj(obj) {
  const {Cc, Ci, Cu, Cm} = require('chrome')
  Cu.import("resource://gre/modules/WebappsInstaller.jsm")
  var installParam = { 
    app: {
      manifest : obj,
      origin: obj.url
    }   
  }
  var retval = WebappsInstaller.install(installParam)
  if (retval.app) {
    require("sdk/notifications").notify({
        text: "App installed!",
        iconURL: 'chrome://browser/skin/webapps-16.png'
    })  
  }
}
