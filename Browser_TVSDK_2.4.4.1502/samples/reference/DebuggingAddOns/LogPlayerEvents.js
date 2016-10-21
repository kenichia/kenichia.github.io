// These add-on handle following functionalities:
// Seek bar, Ads, Caption, Buffering, Audio
function getPlayer () {
    return playerWrapper.getPlayer();
}

ReferencePlayer.AddOns = ReferencePlayer.AddOns || {}
ReferencePlayer.AddOns.LogPlayerEvents = {}

ReferencePlayer.AddOns.LogPlayerEvents.onSeekStart = function (event)
{
    var obj = {
        actualPosition: event.actualPosition,
        desiredPosition: event.desiredPosition
    };
    onEvent ("ReferencePlayer onSeekStart", obj);
},

ReferencePlayer.AddOns.LogPlayerEvents.onSeekComplete = function (event)
{
    var obj = {
        actualPosition: event.actualPosition,
        desiredPosition: event.desiredPosition
    };
    onEvent ("ReferencePlayer onSeekComplete", obj);
    obj.target = this;
},

ReferencePlayer.AddOns.LogPlayerEvents.onSeekPositionAdjusted = function (event)
{
    var obj = {
        actualPosition: event.actualPosition,
        desiredPosition: event.desiredPosition
    };
    onEvent ("ReferencePlayer onSeekPositionAdjusted", obj);
},

ReferencePlayer.AddOns.LogPlayerEvents.onPlaybackRatePlaying = function (event)
{
    onEvent ("ReferencePlayer onPlaybackRatePlaying", event.rate);
},

ReferencePlayer.AddOns.LogPlayerEvents.onCaptionsUpdate = function (event)
{
    if (event && event.item)
    {
        var tracks = event.item.closedCaptionsTracks;
        //Bug PTPLAY-10071
        // These events are not getting fired in MSE workflows
        // onEvent ("ReferencePlayer onCaptionsUpdate", tracks);
    }
},

ReferencePlayer.AddOns.LogPlayerEvents.onAudioUpdate = function (event)
{
    if (event && event.item)
    {
        var tracks = event.item.audioTracks;
        onEvent ("ReferencePlayer onAudioUpdate", tracks);
    }
},

ReferencePlayer.AddOns.LogPlayerEvents.onBufferBegin = function (event)
{
    onEvent ("ReferencePlayer onBufferBegin", event);
},

ReferencePlayer.AddOns.LogPlayerEvents.onBufferEnd = function (event)
{
    onEvent ("ReferencePlayer onBufferEnd", event);
},

ReferencePlayer.AddOns.LogPlayerEvents.onAdProgress = function(event){
    console.log("onAdProgressEvent = " + event.progress);
},

ReferencePlayer.AddOns.LogPlayerEvents.onAdBreakSkipped = function(){
    console.log("onAdBreakSkippedEvent");
},

ReferencePlayer.AddOns.LogPlayerEvents.onAdClick = function(){
    console.log("onAdClickEvent");
},

ReferencePlayer.AddOns.LogPlayerEvents.onProfileChange = function (event) {
    console.log("Profile Changed: " + event.profile);
},

ReferencePlayer.AddOns.LogPlayerEvents.onPlaybackRatePlaying = function (event) {
    console.log("Playback Rate Playing: " + event.rate);
},

ReferencePlayer.AddOns.LogPlayerEvents.onPlaybackRateSelected = function (event) {
    console.log("Playback Rate Selected: " + event.rate);
},

addEventLogs = function () {
    getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.SeekBeginEvent, ReferencePlayer.AddOns.LogPlayerEvents.onSeekStart);
    getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.SeekEndEvent, ReferencePlayer.AddOns.LogPlayerEvents.onSeekComplete);
    getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.SeekPositionAdjustedEvent, ReferencePlayer.AddOns.LogPlayerEvents.onSeekPositionAdjusted); //
    getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.CaptionsUpdatedEvent, ReferencePlayer.AddOns.LogPlayerEvents.onCaptionsUpdate);
    getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.AudioUpdatedEvent, ReferencePlayer.AddOns.LogPlayerEvents.onAudioUpdate);
    getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.BufferingBeginEvent, ReferencePlayer.AddOns.LogPlayerEvents.onBufferBegin);
    getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.BufferingEndEvent, ReferencePlayer.AddOns.LogPlayerEvents.onBufferEnd);
    getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.AdProgressEvent, ReferencePlayer.AddOns.LogPlayerEvents.onAdProgress);
    getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.AdBreakSkippedEvent, ReferencePlayer.AddOns.LogPlayerEvents.onAdBreakSkipped);
    getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.AdClickedEvent, ReferencePlayer.AddOns.LogPlayerEvents.onAdClick);
    getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.ProfileChangeEvent, ReferencePlayer.AddOns.LogPlayerEvents.onProfileChange);
    getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.PlaybackRateSelectedEvent, ReferencePlayer.AddOns.LogPlayerEvents.onPlaybackRateSelected);
    getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.PlaybackRatePlayingEvent, ReferencePlayer.AddOns.LogPlayerEvents.onPlaybackRatePlaying);
};