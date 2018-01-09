var waitForIntercom = null;

export function loadIntercomWidget(settings) {
  if (window.intercomSettings && window.intercomSettings.app_id !== settings.app_id) {
    unloadIntercomWidget()
    delete window.Intercom
  }

  window.intercomSettings = settings
  include(settings.app_id)
  startWaitingForIntercomBubble()
  window.Intercom('onShow', () => setTimeout(fixIntercomChatPosition))
}

export function unloadIntercomWidget() {
  if (window.Intercom) {
    window.Intercom('shutdown')
    stopWaitingForIntercomBubble()
  }
}

function startWaitingForIntercomBubble() {
  if (waitForIntercom) return
  waitForIntercom = setInterval(fixIntercomBubblePosition, 100)
}

function stopWaitingForIntercomBubble() {
  if (!waitForIntercom) return
  clearInterval(waitForIntercom)
  waitForIntercom = null
}

function fixIntercomBubblePosition() {
  try {
    const launcher = document.querySelector("#intercom-container .intercom-launcher-frame")
    const discovery = document.querySelector("#intercom-container .intercom-launcher-discovery-frame")

    if (launcher && discovery) {
      stopWaitingForIntercomBubble()
      launcher.setAttribute("style", "bottom: 50px !important")
      discovery.setAttribute("style", "width: 60px; bottom: 50px !important")
    }
  } catch(err) {
    stopWaitingForIntercomBubble()
  }
}

function fixIntercomChatPosition() {
  try {
    const messenger = document.querySelector("#intercom-container .intercom-app-launcher-enabled .intercom-messenger-frame")
    messenger.style = "bottom: 120px !important"
  } catch(err) {}
}

// Copied from https://developers.intercom.com/docs/single-page-app
// and turned app id into a parameter rather than a global variable
function include(appId) {
  var w = window;
  var ic = w.Intercom;

  if (typeof ic === "function") {
    ic('reattach_activator');
    ic('update', w.intercomSettings);
  } else {
    var d = document;
    var i = function() { i.c(arguments) };

    i.q = [];
    i.c = function(args) { i.q.push(args) };

    w.Intercom = i;

    function l() {
      var s = d.createElement('script');
      s.type = 'text/javascript';
      s.async = true;
      s.src = 'https://widget.intercom.io/widget/' + appId;

      var x = d.getElementsByTagName('script')[0];
      x.parentNode.insertBefore(s, x);
    }

    l()
  }
}
