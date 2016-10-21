// Fast forward and fast backward
ReferencePlayer.AddOns = ReferencePlayer.AddOns || {};
ReferencePlayer.AddOns.TrickPlayEnabled = false;
ReferencePlayer.AddOns.TrickPlay = function() {
    var _fForwardBtnId, _fBackBtnId,
        _sForwardBtnId, _sBackBtnId,
        trickPlayRates = [],

        isTrickPlayEnabled = function () {
            return ReferencePlayer.AddOns.TrickPlayEnabled;
        },

        enableTrickPlay = function (fForwardBtnId, fBackBtnId, sForwardBtnId, sBackBtnId) {
            // can only be enabled if additional controls have been added
            if (isVideoControlsEnabled() == false)
                return;

            ReferencePlayer.AddOns.TrickPlayEnabled = true;

            _fForwardBtnId = fForwardBtnId;
            _fBackBtnId = fBackBtnId;
            _sForwardBtnId = sForwardBtnId;
            _sBackBtnId = sBackBtnId;

            document.getElementById (fForwardBtnId).classList.remove("hidden");
            document.getElementById (fBackBtnId).classList.remove("hidden");
            document.getElementById (sForwardBtnId).classList.remove("hidden");
            document.getElementById (sBackBtnId).classList.remove("hidden");

            btnFF = document.getElementById(fForwardBtnId);
            btnFF.addEventListener("click", function () {
                cycleFastForward();
            });

            btnRW = document.getElementById(fBackBtnId);
            btnRW.addEventListener("click", function () {
                cycleFastRewind();
            });

            btnSF = document.getElementById(sForwardBtnId);
            btnSF.addEventListener("click", function () {
                cycleSlowForward();
            });

            btnSRW = document.getElementById(sBackBtnId);
            btnSRW.addEventListener("click", function () {
                cycleSlowRewind();
            });

			btnSF.parentNode.style.display = 'none';
			btnSRW.parentNode.style.display = 'none';
			
            // event listeners
            getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.StatusChangeEvent, onTrickPlayStatusChange);
			getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.AdBreakStartedEvent, updateTrickPlayButtons);
			getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.AdBreakCompletedEvent, updateTrickPlayButtons);
        },

        /**
         * Cycle playback through available fast-forward rates. If current playback is at maximum fast-forward rate,
         * cycles playback to minimum fast-forward rate (x2). If current playback is in rewind, sets playback to minimum
         * fast-forward rate (x2).
         */
        cycleFastForward = function () {
            if (playerWrapper.areControlsDisabledInAd())
                return;
            var rate = nextPlaybackRate(true);
            getPlayer().rate = rate;
        },

        /**
         * Cycle playback through available slow-forward rates.
         */
        cycleSlowForward = function () {
            if (playerWrapper.areControlsDisabledInAd())
                return;
            var rate = nextSlowMotionPlaybackRate(true);
            getPlayer().rate = rate;
        },

        /**
         * Cycle playback through available rewind rates. If current playback is at maximum rewind rate,
         * cycles playback to minimum rewind rate (-x2). If current playback is in fast-forward, sets playback
         * to minimum rewind rate (-x2).
         */
        cycleFastRewind = function () {
            if (playerWrapper.areControlsDisabledInAd())
                return;
            var rate = nextPlaybackRate(false);
            getPlayer().rate = rate;
        },

        /**
         * Cycle playback through available slow-rewind rates.
         */
        cycleSlowRewind = function () {
            if (playerWrapper.areControlsDisabledInAd())
                return;
            var rate = nextSlowMotionPlaybackRate(false);
            getPlayer().rate = rate;
        },

        nextSlowMotionPlaybackRate = function (isForward) {
            var rate = getPlayer().rate;

            if ((rate === AdobePSDK.PSDKErrorCode.kECIllegalState) || (rate === undefined))
            {
                console.log("ReferencePlayer - player is not in correct state to set playback rate.");
                return;
            }

            var item = getPlayer().currentItem;

            if (item) {
                trickPlayRates = item.availablePlaybackRates;
            }

            // reset rate if previously going in opposite direction
            if ((isForward && (rate < 0 || rate >= 1)) || (!isForward && (rate >= 0 || rate < -1)))
            {
                rate = 0;
            }

            var nextRate = rate;
            if (trickPlayRates && trickPlayRates.length > 0) {
                for (var i=0; i<trickPlayRates.length; i++) {
                    if (isForward && trickPlayRates[i] > rate && trickPlayRates[i] > 0 && trickPlayRates[i] < 1 && (nextRate === rate || trickPlayRates[i] < nextRate)) {
                        nextRate = trickPlayRates[i];
                    }
                    else if (!isForward && trickPlayRates[i] < rate && trickPlayRates[i] < 0 && trickPlayRates[i] > -1 && (nextRate === rate || trickPlayRates[i] > nextRate)) {
                        nextRate = trickPlayRates[i];
                    }
                }
            }

            if (nextRate === 0) {
                nextRate = 1;
            }

            console.log("TrickPlay: next rate " + nextRate);
            return nextRate;
        },

        nextPlaybackRate = function (isForward)	{
            var rate = getPlayer().rate;

            if ((rate === AdobePSDK.PSDKErrorCode.kECIllegalState) || (rate === undefined))
            {
                console.log("ReferencePlayer - player is not in correct state to set playback rate.");
                return;
            }

            var item = getPlayer().currentItem;

            if (item) {
                trickPlayRates = item.availablePlaybackRates;
            }

            // reset rate if previously going in opposite direction
            if ((isForward && rate < 1) || (!isForward && rate >= 0))
            {
                rate = 1;
            }

            var nextRate = rate;
            if (trickPlayRates && trickPlayRates.length > 0) {
                for (var i=0; i<trickPlayRates.length; i++) {
                    if (isForward && trickPlayRates[i] > rate && trickPlayRates[i] > 1 && (nextRate === rate || trickPlayRates[i] < nextRate)) {
                        nextRate = trickPlayRates[i];
                    }
                    else if (!isForward && trickPlayRates[i] < rate && trickPlayRates[i] < -1 && (nextRate === rate || trickPlayRates[i] > nextRate)) {
                        nextRate = trickPlayRates[i];
                    }
                }
            }

            console.log("TrickPlay: next rate " + nextRate);
            return nextRate;
        },

        onTrickPlayStatusChange = function(event) {
            if (event.status === AdobePSDK.MediaPlayerStatus.PREPARED) {
                updateTrickPlayButtons();
            }
        },

        updateTrickPlayButtons = function() {
			var item = getPlayer().currentItem;

			if (item && item.isTrickPlaySupported) {
				document.getElementById (_fForwardBtnId).classList.remove("hidden");
				document.getElementById (_fBackBtnId).classList.remove("hidden");
				//document.getElementById (_sForwardBtnId).classList.remove("hidden");
				//document.getElementById (_sBackBtnId).classList.remove("hidden");
				trickPlayRates = item.availablePlaybackRates;
			}
			else {
				document.getElementById (_fForwardBtnId).classList.add("hidden");
				document.getElementById (_fBackBtnId).classList.add("hidden");
				//document.getElementById (_sForwardBtnId).classList.add("hidden");
				//document.getElementById (_sBackBtnId).classList.add("hidden");
				trickPlayRates = [];
			}
        }

    return {
        enableTrickPlay : enableTrickPlay,
        isTrickPlayEnabled : isTrickPlayEnabled,
        cycleFastForward: cycleFastForward,
        cycleFastRewind: cycleFastRewind,
        cycleSlowForward: cycleSlowForward,
        cycleSlowRewind: cycleSlowRewind
    }
};
