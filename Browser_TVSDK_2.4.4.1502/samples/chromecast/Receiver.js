(function() {
    "use strict";

    window.onload = function() {
        console.log("Starting CastReceiverManager");
        window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
        window.castReceiverManager.onReady = function(event) {
            console.log("CastReceiverManager ready event");
            console.log(event);
        };

        window.castReceiverManager.onSenderConnected = function(event) {
            console.log("CastReceiverManager senderConnected event");
            console.log(event);
        };

        window.castReceiverManager.onSenderDisconnected = function(event) {
            if (window.castReceiverManager.getSenders().length == 0 &&
                event.reason == cast.receiver.system.DisconnectReason.REQUESTED_BY_SENDER) {
                console.log("CastReceiverManager senderDisConnected event");
                window.close();
            }
        };

        var customMessageBus = window.castReceiverManager.getCastMessageBus(Chromecast.MSG_NAMESPACE);
        customMessageBus.onMessage = function(event) {
            var message = JSON.parse(event.data);
            switch (message.type) {
                case Chromecast.MSG_TYPE.RESET:
                    console.log("reset message");
                    playerWrapper.reset();
                    break;
                case Chromecast.MSG_TYPE.LOAD:
                    console.log("load message: " + JSON.stringify(message));
                    var player = playerWrapper.getPlayer();
                    player.volume = message.currentVolume;
                    message.configs.forEach(function(elem, index) {
                        $("#" + elem.id).prop(elem.prop, elem.value);
                    });
                    player.drmManager.setProtectionData(message.drmSettings);
                    var adurl = JSON.stringify(JSON.parse(message.adInfo));
                    load(message.url, adurl, false);
                    hideTitle();
                    break;
                case Chromecast.MSG_TYPE.TOGGLE_PLAY_PAUSE:
                    console.log("toggle play_pause message");
                    ReferencePlayer.AddOns.PlayerControls.togglePlayPause(playerWrapper);
                    break;
                case Chromecast.MSG_TYPE.SEEK:
                    console.log("seek message: " + message.seekTo);
                    playerWrapper.seek(parseInt(message.seekTo));
                    break;
                case Chromecast.MSG_TYPE.ABSOLUTE_SEEK:
                    console.log("absolute seek message: " + message.seekTo);
                    playerWrapper.seekToLocal(parseInt(message.seekTo));
                    break;
                case Chromecast.MSG_TYPE.VOLUME_CHANGE:
                    console.log("volume change message: " + message.volume);
                    playerWrapper.getPlayer().volume = message.volume;
                    break;
                case Chromecast.MSG_TYPE.FAST_FORWARD:
                    console.log("fast forward message");
                    playerWrapper.getTrickPlayAddOn().cycleFastForward();
                    break;
                case Chromecast.MSG_TYPE.SLOW_FORWARD:
                    console.log("slow forward message");
                    playerWrapper.getTrickPlayAddOn().cycleSlowForward();
                    break;
                case Chromecast.MSG_TYPE.FAST_REWIND:
                    console.log("fast rewind message");
                    playerWrapper.getTrickPlayAddOn().cycleFastRewind();
                    break;
                case Chromecast.MSG_TYPE.SLOW_REWIND:
                    console.log("slow rewind message");
                    playerWrapper.getTrickPlayAddOn().cycleSlowRewind();
                    break;
                case Chromecast.MSG_TYPE.REWIND:
                    console.log("rewind message");
                    ReferencePlayer.AddOns.PlayerControls.rewindTenSec.apply(playerWrapper);
                    break;
                case Chromecast.MSG_TYPE.SEEK_TO_LIVE:
                    console.log("seek to live message");
                    playerWrapper.seekToLive();
                    break;
                case Chromecast.MSG_TYPE.AUDIO_TRACK_CHANGE:
                    console.log("audio track change message");
                    playerWrapper.getLBAAddOn().selectAudioTrack(parseInt(message.selectedIndex));
                    break;
                case Chromecast.MSG_TYPE.CAPTIONS_TRACK_CHANGE:
                    console.log("captions track change message");
                    playerWrapper.getCaptionsAddOn().selectCaptionsTrack(parseInt(message.selectedIndex));
                    break;
                case Chromecast.MSG_TYPE.CC_TOGGLE:
                    console.log("captions toggle visibility message");
                    playerWrapper.getCaptionsAddOn().toggleCCVisibility();
                    break;
                default:
                    console.log("invalid message");
                    break;
            }
        };
        window.castReceiverManager.start();
    }

    var hideTitle = function() {
        setTimeout(function() {
            $("#video-title").hide()
        }, 10000);
    };
}());