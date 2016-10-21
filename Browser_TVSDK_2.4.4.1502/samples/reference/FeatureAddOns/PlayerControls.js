// This Add-On handles the media source list picked up from sources.js
// This need to be supplied the Ids of button, source list and text box where selected source is to be saved
var videoControlsEnabled = false;
function isVideoControlsEnabled () {return videoControlsEnabled;}
var settingsManager; // manager for settings GUI
var currentVolume = 1;
var seekBar;
// playbackWaiting - to know if the player is currently seeking and
// toggle button was pressed multiple times
var playbackWaiting = false;
// toggleBtnPlayState - variable to know current status of player
// according to togglePlayPause button
var toggleBtnPlayState = false;

ReferencePlayer.AddOns = ReferencePlayer.AddOns || {};
ReferencePlayer.AddOns.PlayerControls = {};

ReferencePlayer.AddOns.PlayerControls.getPlayer = function() {
    return playerWrapper.getPlayer();
}

ReferencePlayer.AddOns.PlayerControls.removeEventListeners = function(playerWrapper) {

    playerWrapper.removeEventListener(ReferencePlayer.Events.LoadInitiatedEvent, playerWrapper._onLoadInitEventFunc);
    playerWrapper.getPlayer().removeEventListener(AdobePSDK.MediaPlayer.Events.TimeChangeEvent, playerWrapper._onTimeChangeFunc);
    playerWrapper.getPlayer().removeEventListener(AdobePSDK.MediaPlayer.Events.SeekPositionAdjustedEvent, playerWrapper._onSeekPositionAdjustedFunc);
    playerWrapper.getPlayer().removeEventListener(AdobePSDK.MediaPlayer.Events.PlaybackRateSelectedEvent, playerWrapper._onPlaybackRateSelectedFunc);
    playerWrapper.getPlayer().removeEventListener(AdobePSDK.MediaPlayer.Events.StatusChangeEvent, playerWrapper._onPlaybackRateChangeEventFunc);

    document.removeEventListener("webkitfullscreenchange", playerWrapper._onFullScreenChangeFunc, false);
    document.removeEventListener("fullscreenchange", playerWrapper._onFullScreenChangeFunc, false);
    document.removeEventListener("mozfullscreenchange", playerWrapper._onFullScreenChangeFunc, false);
    document.removeEventListener("MSFullscreenChange", playerWrapper._onFullScreenChangeFunc, false);

};

ReferencePlayer.AddOns.PlayerControls.addOnVideoControls = function(videoControlDivId, videoDiv, playerWrapper) {
    videoControlsEnabled = true;
    insertVideoControls (videoControlDivId);

    seekBar = new SeekBar();

    playerWrapper._onLoadInitEventFunc = ReferencePlayer.AddOns.PlayerControls.onLoadInitEvent.bind(playerWrapper);
    playerWrapper._onTimeChangeFunc = ReferencePlayer.AddOns.PlayerControls.onTimeChange.bind(playerWrapper, seekBar);
    playerWrapper._onSeekPositionAdjustedFunc = ReferencePlayer.AddOns.PlayerControls.onSeekPositionAdjusted.bind(playerWrapper, seekBar);
    playerWrapper._onPlaybackRateSelectedFunc = ReferencePlayer.AddOns.PlayerControls.onPlaybackRateSelected.bind(playerWrapper);
    playerWrapper._onPlaybackRateChangeEventFunc = ReferencePlayer.AddOns.PlayerControls.onPlaybackRateChangeEvent.bind(playerWrapper);

    playerWrapper.addEventListener(ReferencePlayer.Events.LoadInitiatedEvent, playerWrapper._onLoadInitEventFunc);
    playerWrapper.getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.TimeChangeEvent, playerWrapper._onTimeChangeFunc);
    playerWrapper.getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.SeekPositionAdjustedEvent, playerWrapper._onSeekPositionAdjustedFunc);
    playerWrapper.getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.PlaybackRateSelectedEvent, playerWrapper._onPlaybackRateSelectedFunc);
    playerWrapper.getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.StatusChangeEvent, playerWrapper._onPlaybackRateChangeEventFunc);

    // add full screen change event listeners to update fullscreen button icon
    // NOTE - event is not triggered if user enables fullscreen from hotkey (F11)
    playerWrapper._onFullScreenChangeFunc = this.onFullscreenChange.bind(playerWrapper.getVideoDiv(), seekBar);
    document.addEventListener("webkitfullscreenchange", playerWrapper._onFullScreenChangeFunc, false);
    document.addEventListener("fullscreenchange", playerWrapper._onFullScreenChangeFunc, false);
    document.addEventListener("mozfullscreenchange", playerWrapper._onFullScreenChangeFunc, false);
    document.addEventListener("MSFullscreenChange", playerWrapper._onFullScreenChangeFunc, false);

    // Settings button
    btnSettings = videoDiv.querySelector("#btn_settings");
    btnSettings.classList.add("invisible");
    btnSettings.addEventListener("click", function () {
        if (settingsManager.toggleManagerDisplay().visible)
        {
            btnSettings.classList.add("on");
        }
        else
        {
            btnSettings.classList.remove("on");
        }
    });

    // volume button
    btnVolume = videoDiv.querySelector("#btn_volume");
    btnVolume.addEventListener("mouseover", function () {
        videoDiv.querySelector("#volume_slide_container").classList.remove("hidden");
    });
    btnVolume.addEventListener("mouseout", function () {
        videoDiv.querySelector("#volume_slide_container").classList.add("hidden");
    });

    rngVolume = videoDiv.querySelector("#rng_volumebar");
    rngVolume.onchange = (function() {
        // update mute button style
        ReferencePlayer.AddOns.PlayerControls.toggleMuteButtonStyle(this.getVideoDiv(), rngVolume.value === 0);
        ReferencePlayer.AddOns.PlayerControls.setVolume(this, rngVolume.value);
    }).bind(playerWrapper);

    var volumeContainer = videoDiv.querySelector("#volume_slide_container");
    volumeContainer.addEventListener("mouseover", function () {
        this.classList.remove("hidden");
    });
    volumeContainer.addEventListener("mouseout", function () {
        this.classList.add("hidden");
    });

    // full screen button
    btnFullScreen = videoDiv.querySelector("#btn_fullscreen");
    btnFullScreen.addEventListener("click", (function () {
        var result =  ReferencePlayer.AddOns.PlayerControls.toggleFullScreen(this);
        ReferencePlayer.AddOns.PlayerControls.toggleFullScreenButtonStyle(this.getVideoDiv(), result.fullscreen);
    }).bind(playerWrapper));

    // set event handler for UI elements
    btnPlayPause = videoDiv.querySelector("#btn_playpause");
    btnPlayPause.addEventListener("click", (function(){
        ReferencePlayer.AddOns.PlayerControls.togglePlayPause(this);
    }).bind(playerWrapper));

    btnRewind = videoDiv.querySelector("#btn_rewind");
    btnRewind.addEventListener("click",  ReferencePlayer.AddOns.PlayerControls.rewindTenSec.bind(playerWrapper));

    btnVolume.addEventListener("click", (function() {
        var result =  ReferencePlayer.AddOns.PlayerControls.toggleMute(this);
        ReferencePlayer.AddOns.PlayerControls.toggleMuteButtonStyle(this.getVideoDiv(), result.mute);
        this.getVideoDiv().querySelector("#rng_volumebar").value = result.volume;
    }).bind(playerWrapper));

    // initialize the seek bar
    seekBar.init(videoControlDivId);
    seekBar.setPositionChangeListener((function (pos) {
        var range = this.getPlaybackRange();
        if (range && range instanceof AdobePSDK.TimeRange) {

            var duration = range.duration;
            if (!isFinite(duration)) {
                return;
            }

            // The timeline shows localtime, therefore we need to map this time to virtual time
            var timeline = playerWrapper.getPlayer().timeline;
            var localBegin = timeline.convertToLocalTime (range.begin);
            var localEnd = timeline.convertToLocalTime (range.end);
            var localDuration = localEnd - localBegin;

            var localSeekTime = localDuration * pos; // seek bar range is [0,1]
            // convert to virtual time
            var virtualSeekTime = timeline.convertToVirtualTime (localSeekTime);

            //Per API spec position should be absolute position and not relative position
            virtualSeekTime = range.begin + virtualSeekTime;
            this.seek(virtualSeekTime);

            console.log("[Reference] seek to " + localSeekTime + " / " + localDuration);
        }

    }).bind(playerWrapper));

    // initialize settings manager after document has loaded
    settingsManager = new ReferencePlayer.SettingsManager(videoDiv.querySelector("#popup-panel"));
};

/**
 * Toggles UI style for fullscreen when fullscreen mode is enabled/disabled.
 * @param isFullscreen {boolean}
 */
ReferencePlayer.AddOns.PlayerControls.toggleFullScreenButtonStyle = function(videoDiv, isFullscreen)
{
    if (isFullscreen) {
        videoDiv.querySelector("#btn_fullscreen").classList.add("fullscreen-state");
    }
    else
    {
        videoDiv.querySelector("#btn_fullscreen").classList.remove("fullscreen-state");
    }
};

/**
 * Toggles UI style for volume/mute when volume is muted/unmuted.
 * @param isMute {boolean}
 */
ReferencePlayer.AddOns.PlayerControls.toggleMuteButtonStyle = function(videoDiv, isMute)
{
    if (isMute) {
        videoDiv.querySelector("#btn_volume").classList.add("mute-state");
    }
    else {
        videoDiv.querySelector("#btn_volume").classList.remove("mute-state");
    }
};

/**
 * Update controls UI when full screen change is detected.
 */
ReferencePlayer.AddOns.PlayerControls.onFullscreenChange = function(seekBar, event) {
    if ( ReferencePlayer.AddOns.PlayerControls.isFullScreen())
    {
        this.querySelector("#btn_fullscreen").classList.add("fullscreen-state");
        this.classList.remove("videoDivMaxSize");
    }
    else
    {
        this.querySelector("#btn_fullscreen").classList.remove("fullscreen-state");
        this.classList.add("videoDivMaxSize");
    }

    // reset seekbar to readjust positions based on new screen size
    seekBar.readjustSeekBar();
};

/**
 * Called when the playerWrapper's time changes.
 * Update UI to show current time, seekbar playhead position and buffer level.
 */
ReferencePlayer.AddOns.PlayerControls.onTimeChange = function(seekBar, event)
{
    if (!seekBar.isSeeking) {
        var time = event.time;
        var range = event.target.playbackRange;

        if (range && range instanceof AdobePSDK.TimeRange){
            var timeline = playerWrapper.getPlayer().timeline;

            var timeWithoutAds = timeline.convertToLocalTime (time);
            var localBegin = timeline.convertToLocalTime (range.begin);
            var localEnd = timeline.convertToLocalTime (range.end);
            var rangeWithoutAds = new AdobePSDK.TimeRange (localBegin, localEnd - localBegin);

            seekBar.updatePlayhead(timeWithoutAds, rangeWithoutAds);
            var adjustedTime = timeWithoutAds - rangeWithoutAds.begin;
            ReferencePlayer.AddOns.PlayerControls.updateDisplayTime(this.getVideoDiv(), adjustedTime, rangeWithoutAds);

            var bufferedRange = this.getBufferedRange();
            var reverseTrickPlay = (ReferencePlayer.AddOns.PlayerControls.isTrickPlayEnabled() 
                && ReferencePlayer.AddOns.PlayerControls.getTrickPlayRate() &&
                ReferencePlayer.AddOns.PlayerControls.getTrickPlayRate() < 0) ? true : false;
            seekBar.updateBufferLevel(timeline.convertToLocalTime (bufferedRange.end), rangeWithoutAds,
                reverseTrickPlay);
        }
    }
};

/**
 * If the seek position was adjusted, re-position the playhead.
 */
ReferencePlayer.AddOns.PlayerControls.onSeekPositionAdjusted = function (seekBar, event)
{
    var timeline = playerWrapper.getPlayer().timeline;
    var range = this.getPlaybackRange();

    var timeWithoutAds = timeline.convertToLocalTime (event.actualPosition);
    var localBegin = timeline.convertToLocalTime (range.begin);
    var localEnd = timeline.convertToLocalTime (range.end);
    var rangeWithoutAds = new AdobePSDK.TimeRange (localBegin, localEnd - localBegin);

    seekBar.updatePlayhead(timeWithoutAds, rangeWithoutAds);
    ReferencePlayer.AddOns.PlayerControls.updateDisplayTime(this.getVideoDiv(), timeWithoutAds, rangeWithoutAds);
};

/**
 * Format time for display.
 *
 * If a duration is given, then the time display is formatted to match
 * the duration. For example, if the time is 1 minute 23 seconds and the duration is 1 hour,
 * then the time is displayed as 00:01:23. However, if the duration is 30 minutes,
 * then the time is displayed as 01:23.
 *
 * @param time - in milliseconds
 * @param duration - total expected time, used to pad result
 * @returns {string} in format hours:mins:seconds
 */
ReferencePlayer.AddOns.PlayerControls.formatDisplayTime = function(time, duration)
{
    var value = Math.max(time, 0);
    var hours = Math.floor(value/1000/3600);
    var mins = Math.floor((value/1000)%3600/60);
    var secs = Math.floor((value/1000)%3600%60);

    var dValue = 0; // duration
    var dH = 0; // duration hours
    var dM = 0; // duration minutes

    if (duration)
    {
        dValue = Math.max(duration, 0);
        dH = Math.floor(dValue/1000/3600);
        dM = Math.floor((dValue/1000)%3600/60);
    }

    var result;
    result = hours === 0 ? (dH === 0 ? "" : "00:") : ((hours < 10 ? "0" : "") + hours.toString() + ":");
    result += mins === 0 ? ((dM > 0 || dH > 0 || hours > 0) ? "00:" : "") : ((mins < 10 ? "0" : "") + mins.toString() + ":");
    result += (secs < 10 ? "0" : "") + secs.toString();

    return result;
};

/**
 * Set the displayed media time and duration
 */
ReferencePlayer.AddOns.PlayerControls.updateDisplayTime = function(videoDiv, time, range) {
    var timeElm = videoDiv.querySelector("#time");
    var durationElm = videoDiv.querySelector("#duration");
    var fwdSlashElm = videoDiv.querySelector("#fwd-slash");

    if (this.isLive()) {
        timeElm.style.visibility = "hidden";
        fwdSlashElm.style.visibility = "hidden";
        // set Live button if not already set
        if (durationElm.getElementsByTagName("button").length == 0) {
            // remove child elements
            while (durationElm.firstChild) {
                durationElm.removeChild(durationElm.firstChild);
            }

            durationElm.appendChild(liveLink);
        }
    }
    else {
        timeElm.innerHTML = this.formatDisplayTime(time, range.duration);
        timeElm.style.visibility = "visible";
        fwdSlashElm.style.visibility = "visible";
        var roundedValue = Math.round(range.duration / 1000) * 1000;
        durationElm.innerHTML = this.formatDisplayTime(roundedValue, null);
    }
};

ReferencePlayer.AddOns.PlayerControls.onLoadInitEvent = function(event) {
    // reset settings
    settingsManager.reset();
    // hide settings button
    this.getVideoDiv().querySelector("#btn_settings").classList.add("invisible");
    // hide captions button
    this.getVideoDiv().querySelector("#btn_captions").classList.add("invisible");
};

/**
 * Toggle in and out of fullscreen modes.
 *
 * @returns {{fullscreen: boolean}} - true if moved to fullscreen, false if moved out of fullscreen
 */
ReferencePlayer.AddOns.PlayerControls.toggleFullScreen = function(playerWrapper)
{
    var view = playerWrapper.getPlayer().view;
    if (typeof view !== "undefined")
    {
        if (view.isFullScreen())
        {
            view.exitFullScreen();
            return {fullscreen: false};
        }
        else
        {
            view.makeFullScreen();
            return {fullscreen: true};
        }
    }
};

ReferencePlayer.AddOns.PlayerControls.isLive = function()
{
    var item = this.getPlayer().currentItem;
    if (item && item instanceof AdobePSDK.MediaPlayerItem)
    {
        return item.isLive;
    }

    return false;
};

/**
 * Check if player is currently in fullscreen mode.
 * @returns {boolean}
 */
ReferencePlayer.AddOns.PlayerControls.isFullScreen = function()
{
    return (typeof this.getPlayer().view == "object") ? this.getPlayer().view.isFullScreen() : false;
};

/**
 * Toggle volume between mute and previous volume levels.
 * @returns {{mute: boolean}} - true if volume is now muted, false if volume is now unmuted.
 */
ReferencePlayer.AddOns.PlayerControls.toggleMute = function(playerWrapper)
{
    if (playerWrapper.getPlayer().volume == 0)
    {
        var currentVolume = this.unmute(playerWrapper);
        return {mute: false, volume: currentVolume};
    }
    else
    {
        ReferencePlayer.AddOns.PlayerControls.mute(playerWrapper);
        return {mute: true, volume: 0};
    }
};

/**
 * Set media player's volume.
 * @param volume - [0,1]
 */
ReferencePlayer.AddOns.PlayerControls.setVolume = function(playerWrapper, volume)
{
    var result = playerWrapper.getPlayer().volume = volume;
    if (result === AdobePSDK.PSDKErrorCode.kECSuccess)
    {
        if (volume > 0)
        {
            currentVolume = volume;
        }
    }
};

/**
 * Sets media player's volume to 0.
 */
ReferencePlayer.AddOns.PlayerControls.mute = function(playerWrapper)
{
    playerWrapper.getPlayer().volume = 0;
};

/**
 * Restores media player's volume to level before being muted.
 * @returns {number}
 */
ReferencePlayer.AddOns.PlayerControls.unmute = function(playerWrapper)
{
    playerWrapper.getPlayer().volume = currentVolume;
    return currentVolume;
};

/**
 * Seek backwards ten seconds. If there is less than ten seconds of time behind the playhead,
 * then the seek is performed to the beginning of the seekable range.
 */
ReferencePlayer.AddOns.PlayerControls.rewindTenSec = function()
{
    if (this.areControlsDisabledInAd())
        return;

    var time = this.getPlayer().currentTime;
    if (time !== AdobePSDK.PSDKErrorCode.kECIllegalState)
    {
        var range = this.getSeekableRange();
        if (range !== AdobePSDK.PSDKErrorCode.kECIllegalState)
        {
            //Per API spec time should be absolute time and not relative time
            var position = time;

            position -= 10 * 1000; // milliseconds
            if (position < range.begin) position = range.begin;

            this.seek(position);
        }
    }
};

ReferencePlayer.AddOns.PlayerControls.onPlaybackRateSelected = function(event)
{
	ReferencePlayer.AddOns.PlayerControls.onPlaybackRateChange(this.getVideoDiv(), event.rate, false);
};

ReferencePlayer.AddOns.PlayerControls.onPlaybackRateChangeEvent = function (event) {
    switch (event.status)
    {
        case AdobePSDK.MediaPlayerStatus.PLAYING:
            var rate = this.getPlayer().rate;
            ReferencePlayer.AddOns.PlayerControls.onPlaybackRateChange(this.getVideoDiv(), rate, true);
            break;
        case AdobePSDK.MediaPlayerStatus.PAUSED:
            ReferencePlayer.AddOns.PlayerControls.onPlaybackRateChange(this.getVideoDiv(), 0, true);
            break;
        case AdobePSDK.MediaPlayerStatus.COMPLETE:
            ReferencePlayer.AddOns.PlayerControls.onPlaybackRateChange(this.getVideoDiv(), -1, true); // use -1 to denote playback is complete
            break;
    }
};

ReferencePlayer.AddOns.PlayerControls.getTrickPlayRate = function(){
    var rate = this.getPlayer().rate;
    if (rate < 0  || rate > 1 || (rate < 1 && rate !== 0)) {
        return rate;
    }

    return false;
};

ReferencePlayer.AddOns.PlayerControls.isTrickPlayEnabled = function(){
	var enabled = false;

	if (ReferencePlayer.AddOns.TrickPlay !== "undefined" && ReferencePlayer.AddOns.TrickPlay !== null)
		enabled = ReferencePlayer.AddOns.TrickPlayEnabled;

	return enabled;
};

/**
 * Update the Play/Pause/Replay button with the correct icon based on the playback rate.
 * statusChanged variable introduced to distinguish between whether playback rate was
 * called by PlaybackRateSelectedEvent or StatusChangeEvent
 */
ReferencePlayer.AddOns.PlayerControls.onPlaybackRateChange = function(videoDiv, rate, statusChanged)
{
    var btnPlayPause = videoDiv.querySelector("#btn_playpause");
    var outRate = videoDiv.querySelector("#play_rate");

    switch (rate)
    {
		case -1: // complete
            btnPlayPause.innerHTML = "Replay";
            btnPlayPause.classList.remove("pause-state");
            btnPlayPause.classList.add("replay-state");
            outRate.innerHTML = "";
            break;
        case 0: // paused
            btnPlayPause.innerHTML = "Play";
            btnPlayPause.classList.remove("pause-state");
            btnPlayPause.classList.remove("replay-state");
            outRate.innerHTML = "";
            break;
        case 1: // playing
	    if(playerWrapper.getPlayer().status === AdobePSDK.MediaPlayerStatus.PREPARED) {
		break;
	    }
            //Logic for if togglePlayPause pressed multiple times while seeking,
            // it should continue with the option last pressed
			if (playbackWaiting && statusChanged)
			{
				playbackWaiting = false;
				var result = toggleBtnPlayState?this.play(playerWrapper):this.pause(playerWrapper);
				break;
			}
            btnPlayPause.innerHTML = "Pause";
            btnPlayPause.classList.add("pause-state");
            btnPlayPause.classList.remove("replay-state");
            outRate.innerHTML = "";
            break;
        default: // playing with trick mode
            btnPlayPause.innerHTML = "Play";
            btnPlayPause.classList.remove("pause-state");
            btnPlayPause.classList.remove("replay-state");
            outRate.innerHTML = rate.toString() + "x";
            break;
    }
};

ReferencePlayer.AddOns.PlayerControls.play = function(playerWrapper)
{
    switch (playerWrapper.getPlayer().status)
    {
        case AdobePSDK.MediaPlayerStatus.COMPLETE:
            playerWrapper.loadPrevMediaResource ();
            break;
        case AdobePSDK.MediaPlayerStatus.PREPARED:
        case AdobePSDK.MediaPlayerStatus.PAUSED:
		case AdobePSDK.MediaPlayerStatus.SEEKING:
            playerWrapper.getPlayer().play();
            break;

        case AdobePSDK.MediaPlayerStatus.PLAYING:
        	if (this.isTrickPlayEnabled() && this.getTrickPlayRate())
            {
                // cancel trick play and return to playing
                //player.play();
                playerWrapper.getPlayer().rate = 1;
            }
            break;
    }
};

ReferencePlayer.AddOns.PlayerControls.pause = function(playerWrapper)
{
    switch (playerWrapper.getPlayer().status)
    {
        case AdobePSDK.MediaPlayerStatus.PREPARED:
        case AdobePSDK.MediaPlayerStatus.PLAYING:
        case AdobePSDK.MediaPlayerStatus.COMPLETE:
		case AdobePSDK.MediaPlayerStatus.SEEKING:
            playerWrapper.getPlayer().pause();
            break;
    }
};

/**
 * Toggle between playing and paused states. If player is performing trick play, returns
 * player to PLAYING state. If playback has completed, restarts playback from start of video.
 *
 * @returns {{playing: boolean}} - true if player is playing, false if player is paused
 */
ReferencePlayer.AddOns.PlayerControls.togglePlayPause = function(playerWrapper)
{
    switch (playerWrapper.getPlayer().status)
    {
        case AdobePSDK.MediaPlayerStatus.PAUSED:
            if (toggleBtnPlayState == true)
            {
				playbackWaiting = true;
				btnPlayPause.innerHTML = "Play";
				btnPlayPause.classList.remove("pause-state");
				btnPlayPause.classList.remove("replay-state");
                this.pause(playerWrapper);
                toggleBtnPlayState = false;
				break;
            }
        case AdobePSDK.MediaPlayerStatus.PREPARED:
            this.play(playerWrapper);
            toggleBtnPlayState = true;
            break;
        case AdobePSDK.MediaPlayerStatus.COMPLETE:
            var ID3 = ReferencePlayer.AddOns.ID3();
            ID3.cleanup();
            this.play(playerWrapper);
            toggleBtnPlayState = true;
            break;

		case AdobePSDK.MediaPlayerStatus.SEEKING:
			if (btnPlayPause.innerHTML == "Play")
            {
                this.play(playerWrapper);
                toggleBtnPlayState = true;
            }
            else
            {
                this.pause(playerWrapper);
                toggleBtnPlayState = false;
            }
		break;
        case AdobePSDK.MediaPlayerStatus.PLAYING:
            if (this.isTrickPlayEnabled() && this.getTrickPlayRate())
            {
                this.play(playerWrapper);
                toggleBtnPlayState = true;
            }
            else
            {
                this.pause(playerWrapper);
                toggleBtnPlayState = false;
            }
        break;

        default:
            console.log("ReferencePlayer::togglePlayPause - Player is in an invalid state for play/pause.");
    }
    return {playing: toggleBtnPlayState};
};

function insertVideoControls(videoControlDivId) {
    var videoControlsHTML =
        '<div id="ad-row" hidden>' +
            '<span class="cell display vid-skin-fgcolor" id="ad-remaining-time"></span>' +
            '<div id="ad-seekbar" hidden>' +
            '    <div>' +
            '        <span class="adBacker" id="ad-backer"></span>' +
            '        <span class="adProgress" id="ad-progress" ></span>' +
            '    </div>' +
            '</div>' +
        '</div>' +
        '<div id="popup-panel"></div>' +
        '<div id="top-row">' +
        '<div class="seekbar" id="seekbar">' +
        '    <div>' +
        '        <span class="backer" id="backer"></span>' +
        '        <span class="buffer" id="buffer" ></span>' +
        '       <div class="playhead round vid-skin-bgcolor" id="playhead"></div>' +
        '        <span class="progress vid-skin-bgcolor" id="progress" ></span>' +
        '    </div>' +
        '</div>' +
    '</div>' +
    '<div id="bottom-row">' +
        '<span id="left-control-group">' +
            '<span class="cell button">' +
                '<button type="button" class="btn-play align vid-skin-bgcolor" id="btn_playpause">Play</button>' +
                '<label id="play_rate"></label>' +
            '</span>' +
            '<span class="cell separator"></span>' +
            '<span class="cell button">' +
                '<button type="button" class="rewind align vid-skin-bgcolor" id="btn_rewind">Rewind 10 sec</button>' +
            '</span>' +
            '<span class="cell separator"></span>' +
            '<span class="cell button">' +
                '<button type="button" class="rewind align hidden vid-skin-bgcolor" id="btn_fastrewind">Fast Rewind</button>' +
            '</span>' +
            '<span class="cell separator"></span>' +
            '<span class="cell button">' +
                '<button type="button" class="rewind align hidden vid-skin-bgcolor" id="btn_slowrewind">Slow Rewind</button>' +
            '</span>' +
            '<span class="cell separator"></span>' +
            '<span class="cell button">' +
                '<button type="button" class="rewind align hidden vid-skin-bgcolor" id="btn_slowforward">Slow Forward</button>' +
            '</span>' +
            '<span class="cell separator"></span>' +
            '<span class="cell button">' +
                '<button type="button" class="rewind align hidden vid-skin-bgcolor" id="btn_fastforward">Fast Forward</button>' +
            '</span>' +
            '<span class="cell separator"></span>' +
            '<span class="cell button">' +
                '<span style="position:relative;">' +
                    '<div id="volume_slide_container" class="hidden" >' +
                        '<input type="range" orient="vertical" class="align vid-skin-bgcolor adjust-volumebar" id="rng_volumebar" min="0" max="1" step="0.1" value="1">' +
                    '</div>' +
                    '<button type="button" class="btn-volume align vid-skin-bgcolor" id="btn_volume">Mute</button>' +
                '</span>' +
            '</span>' +
            '<span class="cell separator"></span>' +
            '<span class="cell display">' +
            '</span>' +
            '</span>' +
            '<span id="right-control-group">' +
            '<span class="cell display vid-skin-fgcolor">' +
                '<span id="time">0:00</span> <span id="fwd-slash">/</span> <span id="duration">0:00</span>' +
            '</span>' +
            '<span class="cell separator"></span>' +
            '<span class="cell button">' +
                '<button type="button" class="btn-captions invisible vid-skin-bgcolor" id="btn_captions">CC</button>' +
            '</span>' +
            '<span class="cell separator"></span>' +
            '<span class="cell button">' +
                '<button type="button" class="btn-settings vid-skin-bgcolor" id="btn_settings">Settings</button>' +
            '</span>' +
            '<span class="cell separator"></span>' +
            '<span class="cell button">' +
                '<button type="button" class="btn-fullscreen vid-skin-bgcolor" id="btn_fullscreen">FullScreen</button>' +
            '</span>' +
        '</span>' +
    '</div>';

    var targetIdElement = this.window.document.getElementById(videoControlDivId);
    targetIdElement.innerHTML = videoControlsHTML;
}

/**
 * Seekbar object which handles the display of the playerWrapper progress, playhead, and buffer level.
 */
SeekBar = function () {
    var playheadHalfSize = 8, // must be half width of playhead defined in CSS
            containerElm = null,
            playheadElm = null,
            backerElm = null,
            bufferElm = null,
            progressElm = null,
            currentPos = 0, // [0,1] relative to range
            currentBuffer = 0,// [0,1] relative to range
            listener = null,
            isSeeking = false,

            setPositionChangeListener = function (funct) {
                listener = funct;
            },

            getSeekBarBounds = function () {
                return backerElm.getBoundingClientRect();
            },

            onPositionChange = function (event) {
                var pos = event.pageX || event.clientX;
                var bounds = getSeekBarBounds();
                // normalize position to seek bounds
                pos -= bounds.left;
                var percent = pos / (bounds.right - bounds.left);

                // check bounds
                if (percent > 1) percent = 1;
                else if (percent < 0) percent = 0;

                currentPos = percent;
                setPosition(percent);
            },

            updatePlayhead = function (time, range) {
                if (!isSeeking) {
                    var pos = convertTimeToRelativePosition(time, range);
                    setPosition(pos);
                }
            },

            setPosition = function (percent) {
                // adjust to keep playhead graphic inside container on right side
                var bounds = getSeekBarBounds();
                var pos = percent * (bounds.right - bounds.left);

                progressElm.style.width = (pos).toString() + "px";
                playheadElm.style.left = (pos-playheadHalfSize).toString() + "px";

                currentPos = percent;
                return percent;

            },

            updateBufferLevel = function (level, range, reverseTrickPlay) {
                if (!isSeeking) {
                    var position = reverseTrickPlay ? 0 :
                        convertTimeToRelativePosition(level, range);
                    setBufferLevel(position);
                }
            },

            setBufferLevel = function (percent) {
                currentBuffer = percent;
                var bounds = getSeekBarBounds();
                var pos = percent * (bounds.right - bounds.left);

                bufferElm.style.width = pos.toString() + "px";
            },

            resetSeekBar = function () {
                setPosition(currentPos);
                setBufferLevel(currentBuffer);
            },

            convertTimeToRelativePosition = function (time, range) {
                // convert time to a percentage of the duration
                var position = (time - range.begin) / range.duration;
                if (position > 1) position = 1;
                else if (position < 0) position = 0;
                return position;
            },

            unattachEvents = function (e) {
                this.removeEventListener('mousemove', onPositionChange);
                this.removeEventListener('mouseout', unattachEvents);
                this.removeEventListener('mouseup', unattachEvents);

                this.addEventListener('mouseover', attachEvents);
                isSeeking = false;
            },

            attachEvents = function (e) {
                this.addEventListener('mousemove', onPositionChange);
                this.addEventListener('mouseout', unattachEvents);
                this.addEventListener('mouseup', unattachEvents);
                isSeeking = true;
                return false;
            };

    return  {
        init : function (videoControlDivId) {
            var videoControlDiv = document.getElementById(videoControlDivId);
            containerElm = videoControlDiv.querySelector("#seekbar");
            backerElm = videoControlDiv.querySelector("#backer");
            playheadElm = videoControlDiv.querySelector("#playhead");
            bufferElm = videoControlDiv.querySelector("#buffer");
            progressElm = videoControlDiv.querySelector("#progress");

            // client seek via scrubbing
            containerElm.addEventListener('mousedown', attachEvents);

            // client seek via single click or 'mouseup' after scrubbing
            containerElm.addEventListener('click', function (e) {
                if (listener !== null) {
                    onPositionChange(e);
                    // callback to notify of desired seek position
                    listener.call(this, currentPos);
                }
            });

            // end client seek via scrubbing
            document.addEventListener('mouseup', function (e) {
                containerElm.removeEventListener('mouseover', attachEvents);
            });
        },

        /**
         * Is the playhead currently being scrubbed.
         */
        isSeeking : isSeeking,

        /**
         * Change the position of the playhead.
         * @param time - time in seconds to position playhead
         * @param range - current playback range
         */
        updatePlayhead : updatePlayhead,

        /**
         * Change the position of the buffer range.
         * @param time - time in seconds to position head of buffer
         * @param range - current playback range
         */
        updateBufferLevel : updateBufferLevel,

        /**
         * Set listener which is called when the playhead position changes by the user event.
         * Listener is not called when playhead position changes via updatePlayhead function.
         * @param listener - callback function, passed single position argument representing the
         * playhead position in the range [0,1].
         */
        setPositionChangeListener : setPositionChangeListener,

        /**
         * Readjust position levels if seekbar is resized.
         * Should be called every time the video window changes size.
         */
        readjustSeekBar : resetSeekBar
    };

};
