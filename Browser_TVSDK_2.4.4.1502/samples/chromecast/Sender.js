(function() {
    "use strict";

    var CastPlayer = function() {
        this.receivers_available = false;
        this.session = null;
        this.initializeCastPlayer();
    };

    CastPlayer.prototype.initializeCastPlayer = function() {
        if (!chrome.cast || !chrome.cast.isAvailable) {
            setTimeout(this.initializeCastPlayer.bind(this), 1000);
            return;
        }
        var applicationID = "C4ADC964"; //RECEIVER APP ID
        var autoJoinPolicy = chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED;
        var sessionRequest = new chrome.cast.SessionRequest(applicationID);
        var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
            this.sessionListener.bind(this),
            this.receiverListener.bind(this),
            autoJoinPolicy);

        chrome.cast.initialize(apiConfig, this.successCallback.bind(this), this.errorCallback.bind(this));
        this.bindEventHandlers();
    };

    CastPlayer.prototype.successCallback = function(info, e) {
        console.log(info);
    };

    CastPlayer.prototype.errorCallback = function(e) {
        console.log("error: " + e);
    };

    CastPlayer.prototype.sessionListener = function(e) {
        this.session = e;
        if (this.session) {
            if (this.session.media[0]) {
                this.onMediaDiscovered("activeSession", this.session.media[0]);
            } else {
                console.log("cast session, loading media");
                this.loadMedia();
            }
            this.session.addUpdateListener(this.sessionUpdateListener.bind(this));
        }
    }

    CastPlayer.prototype.sessionUpdateListener = function(isAlive) {
        console.log("session alive: " + isAlive);
        if (!isAlive) {
            this.session = null;
        }
    };

    CastPlayer.prototype.receiverListener = function(e) {
        if (e === "available") {
            this.receivers_available = true;
            console.log("receiver found");
        } else {
            console.log("receiver list empty");
        }
    };

    CastPlayer.prototype.onMediaDiscovered = function(how, mediaSession) {
        console.log("media discovered: " + how);
    };

    CastPlayer.prototype.sendMessage = function(message) {
        if (this.session) {
            this.session.sendMessage(Chromecast.MSG_NAMESPACE, message, this.successCallback.bind(this, "success: " + JSON.stringify(message)), this.errorCallback.bind(this));
        }
    };

    CastPlayer.prototype.loadMedia = function() {
        if (!this.session) {
            console.log("no session");
            return;
        }
        var player = playerWrapper.getPlayer();
        var src = $("#media-source-textbox").val();
        if (src === "" || src === undefined) return;
        var adInfo = $("#ad-url-textbox").val() || "{}";
        var drmSettings = player.drmManager._protectionData || {};
        var configElems = $("#div_addon_options :input[id]").not(":input[type=button], #isForceFlash, #drmJson");
        var configs = [];
        for (var i = 0; i < configElems.length; ++i) {
            var elem = configElems.eq(i);
            var type = elem.prop("type");
            var prop = null;
            if (type === "text" || type === "textarea" || type === "select-one")
                prop = "value";
            else if (type === "radio" || type === "checkbox")
                prop = "checked";
            else continue;
            configs.push({
                id: elem.prop("id"),
                prop: prop,
                value: elem.prop(prop)
            });
        }
        var message = {};
        message.type = Chromecast.MSG_TYPE.LOAD;
        message.url = src;
        message.currentTime = playerWrapper.getPlayer().currentTime;
        message.currentVolume = playerWrapper.getPlayer().volume;
        message.adInfo = adInfo;
        message.drmSettings = drmSettings;
        message.configs = configs;
        this.sendMessage(message);
    };

    CastPlayer.prototype.bindEventHandlers = function() {
        var context = this;
        function setUpCurrentItemHandlers() {
            var playerPreparedHandler = function(e) {
                var status = e.target._status;
                var player = playerWrapper.getPlayer();
                if (status == e.target.PLAYER_STATUS_PLAYING) {
                    player.removeEventListener(AdobePSDK.MediaPlayer.Events.StatusChangeEvent, handler);
                    if (player.currentItem.isLive) $("#duration button.link")[0].addEventListener("click", function() {
                        context.sendMessage({
                            type: Chromecast.MSG_TYPE.SEEK_TO_LIVE
                        });
                    });
                    if ($("#opt_aa_track")) $("#opt_aa_track").on("change", function() {
                        context.sendMessage({
                            type: Chromecast.MSG_TYPE.AUDIO_TRACK_CHANGE,
                            selectedIndex: this.selectedIndex
                        });
                    });
                    if ($("#opt_cc_track")) $("#opt_cc_track").on("change", function() {
                        context.sendMessage({
                            type: Chromecast.MSG_TYPE.CAPTIONS_TRACK_CHANGE,
                            selectedIndex: this.selectedIndex
                        });
                    });
                }
            };
            var handler = playerPreparedHandler.bind(this);
            playerWrapper.getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.StatusChangeEvent, handler);
        }
        $("#load-source").on("click", this.loadMedia.bind(this));
        $(".reset-button").on("click", function() {
            setUpCurrentItemHandlers();
            context.sendMessage({
                type: Chromecast.MSG_TYPE.RESET
            });
        });
        $("#btn_playpause").on("click", function() {
            context.sendMessage({
                type: Chromecast.MSG_TYPE.TOGGLE_PLAY_PAUSE
            });
        });
        $("#seekbar").on("click", function() {
            context.sendMessage({
                type: Chromecast.MSG_TYPE.SEEK,
                seekTo: playerWrapper.getPlayer().currentTime
            });
        });
        $("#rng_volumebar").on("click", function() {
            context.sendMessage({
                type: Chromecast.MSG_TYPE.VOLUME_CHANGE,
                volume: playerWrapper.getPlayer().volume
            });
        });
        $("#btn_volume").on("click", function() {
            context.sendMessage({
                type: Chromecast.MSG_TYPE.VOLUME_CHANGE,
                volume: playerWrapper.getPlayer().volume
            });
        });
        $("#btn_fastforward").on("click", function() {
            context.sendMessage({
                type: Chromecast.MSG_TYPE.FAST_FORWARD
            });
        });
        $("#btn_fastrewind").on("click", function() {
            context.sendMessage({
                type: Chromecast.MSG_TYPE.FAST_REWIND
            });
        });
        $("#btn_slowforward").on("click", function() {
            context.sendMessage({
                type: Chromecast.MSG_TYPE.SLOW_FORWARD
            });
        });
        $("#btn_slowrewind").on("click", function() {
            context.sendMessage({
                type: Chromecast.MSG_TYPE.SLOW_REWIND
            });
        });
        $("#btn_rewind").on("click", function() {
            context.sendMessage({
                type: Chromecast.MSG_TYPE.REWIND
            });
        });
        $("#btn_captions").on("click", function() {
            context.sendMessage({
                type: Chromecast.MSG_TYPE.CC_TOGGLE
            });
        });
        var getSeekValue = function() {
            return $("#seek_val")[0].value.trim() * 1000;
        };
        var getSeekButtonMessage = {
            "SeekToLocal": function() {
                return {
                    type: Chromecast.MSG_TYPE.ABSOLUTE_SEEK,
                    seekTo: getSeekValue()
                };
            },
            "Seek": function() {
                return {
                    type: Chromecast.MSG_TYPE.SEEK,
                    seekTo: getSeekValue()
                };
            },
            "Relative Seek": function() {
                return {
                    type: Chromecast.MSG_TYPE.SEEK,
                    seekTo: getSeekValue() + playerWrapper.getPlayer().currentTime
                };
            }
        };
        $("#div_addon_options button:contains(Seek)").on("click", function() {
            context.sendMessage(getSeekButtonMessage[this.innerHTML]());
        });
        setUpCurrentItemHandlers();
    };
    window.CastPlayer = CastPlayer;
})();