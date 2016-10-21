ReferencePlayer.AddOns = ReferencePlayer.AddOns || {};
ReferencePlayer.AddOns.BufferingOverlay = function () {
  var getPlayer = function () {
    return playerWrapper.getPlayer();
  },

  enableBufferingOverlay = function () {
    var overlay = this.videoDiv.querySelector("#buffering-overlay");
    overlay.classList.add ("overlay-text");

    // Delay the buffering overlay display by 1 sec to avoid cases where buffering is almost immediate.
    this.showBufferingOverlay = (function() {
      if (this.buffering) {
        this.videoDiv.querySelector("#buffering-overlay").removeAttribute("hidden");
      }
      else {
        this.videoDiv.querySelector("#buffering-overlay").setAttribute("hidden", "true");
      }
    }).bind(this);
    var self = this;
    getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.BufferingBeginEvent, function (event) {
      self.buffering = true;
      setTimeout(self.showBufferingOverlay, 1000);
    });

    getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.BufferingEndEvent, function (event) {
      self.buffering = false;
      self.showBufferingOverlay();
    });
    getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.StatusChangeEvent, function (event) {
      if ((event.status === AdobePSDK.MediaPlayerStatus.IDLE) ||
          (event.status === AdobePSDK.MediaPlayerStatus.ERROR)) {
        self.buffering = false;
        self.showBufferingOverlay();
      }
    });
  };

  return {
    buffering : false,
    enableBufferingOverlay : function(videoDiv){
      this.videoDiv = videoDiv;
      enableBufferingOverlay.call(this);
    }
  };
};