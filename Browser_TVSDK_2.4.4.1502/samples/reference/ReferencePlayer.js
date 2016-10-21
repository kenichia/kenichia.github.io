/*************************************************************************
    ADOBE CONFIDENTIAL
    ___________________
    *
    Copyright 2015 Adobe Systems Incorporated
    All Rights Reserved.
    *
    NOTICE: All information contained herein is, and remains
    the property of Adobe Systems Incorporated and its suppliers,
    if any. The intellectual and technical concepts contained
    herein are proprietary to Adobe Systems Incorporated and its
    suppliers and are protected by all applicable intellectual property laws, including trade secret and copyright laws.
    Dissemination of this information or reproduction of this material
    is strictly forbidden unless prior written permission is obtained
    from Adobe Systems Incorporated.
**************************************************************************/

/*global AdobePSDK*/
/*global console*/

/**
 * Construct a new TVSDK Reference Client.
 * Basic steps to setup player: 1) setVideoContainer, 2) setVideoControls, 3) loadMediaResource.
 *
 * @returns TVSDK Reference Player
 * @constructor
 */
ReferencePlayer = function (videoDivId, fullScreenDivId) {
    "use strict";

    var player = new AdobePSDK.MediaPlayer(),
        autoPlay = true,
        eventListeners = {},
        disableControlsInAd = false,
        videoDivID = videoDivId,
        videoDiv = document.getElementById(videoDivId),
        fullScreenDivID = fullScreenDivId,
        fullScreenDiv = document.getElementById(fullScreenDivId),
        prevMediaResource = null,
        prevConfig = null,
		videoAnalyticsTracker = null,
        _redirectionOptimization = true,
        drmAddOn = null,
        captionsAddOn = null,
        lbaAddOn = null,
        trickplayAddOn = null,
        _customAdView = null,

        getMimeTypeStringFromMediaResourceType = function(resourceType) {
            switch (resourceType) {
                case AdobePSDK.MediaResourceType.HLS:
                    return "application/x-mpegURL";
                case AdobePSDK.MediaResourceType.DASH:
                    return "application/dash+xml";
                case AdobePSDK.MediaResourceType.ISOBMFF:
                    return "video/mp4";
                default:
                    return null;
            }
        },

        onTimedMetadataEvent = function(event) {
            var timedMetadata = event.timedMetadata;
            if (timedMetadata.type == AdobePSDK.TimedMetadataType.TAG) {
                var time = timedMetadata.time;
                var content = timedMetadata.content;
                console.log("TimedMetadata: time: " + time + " content: " + content)
            }
        },

        /* For debugging */
        onStatusChange = function (event) {
            var msg = "";

            switch (event.status) {
                case AdobePSDK.MediaPlayerStatus.IDLE:
                    msg = "Player Status: IDLE";
					console.log(msg);
					onEvent("ReferencePlayer onStatusChange", msg);
                    break;

                case AdobePSDK.MediaPlayerStatus.INITIALIZING:
                    msg = "Player Status: INITIALIZING";
					console.log(msg);
					onEvent("ReferencePlayer onStatusChange", msg);
                    /*add event listener to TimedMetadataEvent in initializing only.
                    * because TimedMetadataEvent comes in initializing player state. 
                    */
                    getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.TimedMetadataEvent, onTimedMetadataEvent);
                    break;

                case AdobePSDK.MediaPlayerStatus.INITIALIZED:
                    msg = "Player Status: INITIALIZED";
                    console.log(msg);
            		onEvent("ReferencePlayer onStatusChange", msg);

                    if(document.getElementById("StartAtOffset") && document.getElementById("StartAtOffset").checked)
                    {
						var startTime=(document.getElementById("offset").value).trim();
                        var startTimeInMilliseconds = startTime*1000;
                    	player.prepareToPlay(startTimeInMilliseconds);
						msg +="\n Start Playback at offset "+startTime + "seconds";
                    }
                    else {
                    	player.prepareToPlay(AdobePSDK.MediaPlayer.LIVE_POINT);
                    }
                    break;

                case AdobePSDK.MediaPlayerStatus.PREPARING:
                    msg = "Player Status: PREPARING";
					console.log(msg);
					onEvent("ReferencePlayer onStatusChange", msg);
                    break;

                case AdobePSDK.MediaPlayerStatus.PREPARED:
                    msg = "Player Status: PREPARED";
                    console.log(msg);
            		onEvent("ReferencePlayer onStatusChange", msg);
                    //player.preBuffering = !player.preBuffering;
                    //player.abrSwitchBasedOnPDT = !player.abrSwitchBasedOnPDT;

                    if (_customAdView && _customAdView.parentNode)
                    {
                        _customAdView.parentNode.removeChild(_customAdView);
                    }

                    var customAdView = player.getCustomAdView();
                    player.setCustomAdTimeout(11*1000); // Setting custom ad timeout to be 11 seconds
                    if (customAdView)
                    {
                        customAdView.style.zIndex = "1000";
                        videoDiv.insertBefore(customAdView, videoDiv.firstChild);
                    }

                    _customAdView = customAdView;
                    if (isOoSEnabled()){
                        stopQoS();  //Restart the QOS
                        startQoS();
                    }
                    
                    if (autoPlay) {
                        player.play();
                    }
                    break;

                case AdobePSDK.MediaPlayerStatus.PLAYING:
                    msg = "Player Status: PLAYING";
					console.log(msg);
					onEvent("ReferencePlayer onStatusChange", msg);
                   // TODO update UI play/pause to show pause icon
                    break;

                case AdobePSDK.MediaPlayerStatus.PAUSED:
                    msg = "Player Status: PAUSED";
					console.log(msg);
					onEvent("ReferencePlayer onStatusChange", msg);
                    // TODO update UI play/pause to show play icon & display pause icon over video
                    break;

                case AdobePSDK.MediaPlayerStatus.SEEKING:
                    msg = "Player Status: SEEKING";
					console.log(msg);
					onEvent("ReferencePlayer onStatusChange", msg);
                    break;

                case AdobePSDK.MediaPlayerStatus.COMPLETE:
                    msg = "Player Status: COMPLETE";
					playerWrapper.dispatchEventWrapper(ReferencePlayer.Events.StatusChangeEvent, {status: ReferencePlayer.EventStatus.PLAYER_STATUS_COMPLETE});
					console.log(msg);
					onEvent("ReferencePlayer onStatusChange", msg);
                    if (isOoSEnabled()){
                        stopQoS();  //Stop the QOS
                    }
                    break;

                case AdobePSDK.MediaPlayerStatus.RELEASED:
                    msg = "Player Status: RELEASED";
					console.log(msg);
					onEvent("ReferencePlayer onStatusChange", msg);
                    if (isOoSEnabled()){
                        stopQoS();  //Stop the QOS
                    }
                    break;

                case AdobePSDK.MediaPlayerStatus.ERROR:
                    var errorCode = event.metadata.getValue('PSDK_ERROR_CODE');
					var errorDesc = event.metadata.getValue('DESCRIPTION');
                    if (errorCode === undefined)
                    {
                        errorCode ="Error Code : Undefined";
                    }
                    else
                    {
                        errorCode = "Error Code : " + errorCode;
                    }
                    if(errorDesc === undefined)
                    {
                        errorDesc = "[Demo for Custom Error] " + "Unknown Error Occurred";
                    }
                    else
                    {
                        errorDesc = "[Demo for Custom Error] " + errorDesc;
                    }
                    ShowCustomDialog(errorCode,errorDesc,fullScreenDivId,0,0,0,0,true);
                    if (isOoSEnabled()){
                        stopQoS();  //Stop the QOS
                    }
                    playerWrapper.reset();
			msg = errorDesc;
			console.log(msg);
			onEvent("ReferencePlayer onStatusChange", msg);
                    break;
            }
        },

        loadSourceJSON = function(sourcesFilePathParam) {
            $.getJSON(sourcesFilePathParam).then(function (sourcesObj) {
                var sourceListAddOn = new ReferencePlayer.AddOns.MediaSourceList();
                sourceListAddOn.clearSourceList("source-list","menu-overlay");
                sourceListAddOn.addOnSourceList(sourcesObj, "select-media-button", "source-list", "media-source-textbox", "ad-url-textbox", "forceflash-textbox");
            }, function (status) {
                console.log("Could not load the JSON file " + sourcesFilePathParam);
            });
        },

        // These functions enable the additional functionality of Reference player
        loadAddOns = function () {
            var videoControls = videoDiv.getAttribute("featureAddOnVideoControls") !== null;
            var consoleLogs = videoDiv.getAttribute("debugAddOnConsoleLogs") !== null;
            var additionalParams = videoDiv.getAttribute("debugAddOnAdditionalParams") !== null;
            var qosMetrics = videoDiv.getAttribute("debugAddOnQosMetrics") !== null;
            var sourceList = videoDiv.getAttribute("featureAddOnSourceList") !== null;
            var adEvents = videoDiv.getAttribute("featureAddOnAdEvents") !== null;
            var captions = videoDiv.getAttribute("featureAddOnCaptions") !== null;
            var trickPlay = videoDiv.getAttribute("featureAddOnTrickPlay") !== null;
            var lateBoundAudio = videoDiv.getAttribute("featureAddOnLateBoundAudio") !== null;
            var logEvents = videoDiv.getAttribute("debugAddOnlogEvents") !== null;
            var bufferingOverlay = videoDiv.getAttribute("featureAddOnBufferingOverlay") !== null;
            var drmEvents = videoDiv.getAttribute("featureAddOnDRMEvents") !== null;
            var id3Events = videoDiv.getAttribute("featureAddOnID3Events") !== null;
            var timelineMarkerEvents = videoDiv.getAttribute("featureAddOnTimelineMarkerEvents") !== null;
            var clickableAdsFeature = videoDiv.getAttribute("featureClickableAds") !== null;
            var companionFeature = videoDiv.getAttribute("featureCompanions") !== null;

            // controls on video
            if (videoControls) {
                var videoControlsId = videoDiv.getAttribute("featureAddOnVideoControls");
                this.setVideoControls(document.getElementById(videoControlsId));
                ReferencePlayer.AddOns.PlayerControls.addOnVideoControls(videoControlsId, videoDiv, this);
            }

            if (companionFeature) {
              var companionDivId = videoDiv.getAttribute("featureCompanions");
              ReferencePlayer.AddOns.CompanionAds.enable(companionDivId);
            }


            if (clickableAdsFeature) {
                var clickableAdButtonId = videoDiv.getAttribute("featureClickableAds");
                var clickableAdsAddOn = new ReferencePlayer.AddOns.ClickableAds(clickableAdButtonId);
                clickableAdsAddOn.enableAdEvents();
            }
            
            // console logs
            if (consoleLogs) {
                addOnConsoleLogs("div_console_logs");
            }

            // additional player parameters
            if (additionalParams) {
                addOnAdditionalParams("div_addon_options");
            }

            // performance logs and QoS metrics
            if (qosMetrics) {
                addOnQoSMetrics("div_performanceLogs", "div_qos_metrics");
            }




            // read media sources and build a select list display for users to select a load media
            // Params: The button to select media, the list of the sources, the text box representing the selected source, Ad URL text box
            if (sourceList) {
                loadSourceJSON(sourcesFilePath);
            }

            // Enable the ad events: This will allow special handling of the player while ads are playing
            if (adEvents) {
                var adsAddOn = new ReferencePlayer.AddOns.Ads();
                adsAddOn.enableAdEvents();
            }

            // Enable the captions specific
            if (captions) {
	        var isPIPPlayer = videoDiv.classList.contains("pip-div-style");
		// Passing isPIPPlayer to handle toggling of CC
                captionsAddOn = new ReferencePlayer.AddOns.Captions();
                captionsAddOn.enableCaptions (isPIPPlayer);
            }

            // Trick play
            if (trickPlay) {
                trickplayAddOn = new ReferencePlayer.AddOns.TrickPlay();
                trickplayAddOn.enableTrickPlay ("btn_fastforward", "btn_fastrewind", "btn_slowforward", "btn_slowrewind");
            }

            // Late Bound Audio
            if (lateBoundAudio) {
                lbaAddOn = new ReferencePlayer.AddOns.LBA();
                lbaAddOn.enableLateBoundAudio();
            }

            // event logs
            if (logEvents) {
                addEventLogs();
            }

            if (id3Events){
            	var id3AddOn = new ReferencePlayer.AddOns.ID3();
            	id3AddOn.init();
            }

            if (timelineMarkerEvents){
                var timelineMarkerAddOn = new ReferencePlayer.AddOns.TimelineMarker();
                timelineMarkerAddOn.init();
            }

            if (bufferingOverlay) {
                var bufferingAddOn = new ReferencePlayer.AddOns.BufferingOverlay();
                bufferingAddOn.enableBufferingOverlay(videoDiv);
            }

            if (drmEvents) {
                drmAddOn = new ReferencePlayer.AddOns.DRM();
                drmAddOn.enableDRMEvents ();
            }


       },

        replaceCurrentResource = function (mediaResource, config)
        {
            prevMediaResource = mediaResource;
            prevConfig = config;
            player.replaceCurrentResource(mediaResource, config);
        },

        dispatchEvent = function (event, obj)
        {
            if (typeof eventListeners[event] !== 'undefined')
            {
                eventListeners[event].forEach(function (entry) {
                    if (typeof obj !== 'undefined' && obj !== null)
                    {
                        entry.call(this, obj);
                    }
                    else {
                        entry.call(this);
                    }
                });
            }
        },

        getResourceTypeFromURL = function(resourceUrl) {
            var resourceType = null;
            var endsWith = function (str, suffix) {
                return str.toUpperCase().indexOf(suffix.toUpperCase(), str.length - suffix.length) !== -1;
            };

            var trimmedUrl = resourceUrl.split("?")[0];
            trimmedUrl = trimmedUrl.trim();
            if (endsWith(trimmedUrl, ".mpd") || endsWith(trimmedUrl, "(format=mpd-time-csf)")) {
                resourceType = AdobePSDK.MediaResourceType.DASH;
            } else if (endsWith(trimmedUrl, ".m3u8")) {
                resourceType = AdobePSDK.MediaResourceType.HLS;
            } else if (endsWith(trimmedUrl, ".mp4") || endsWith(trimmedUrl, ".mp3")) {
                resourceType = AdobePSDK.MediaResourceType.ISOBMFF;
            }
            return resourceType;
        },

        loadPrevMediaResource = function () {
             if (prevConfig !== null && prevConfig !== undefined &&
                    prevMediaResource !== null && prevMediaResource !== undefined) {
                 player.reset();
                 replaceCurrentResource (prevMediaResource, prevConfig);
             }
        },

        loadResource = function (resourceUrl, adUrl, resourceType, forceFlash, thumbnailUrl, videoId, videoDuration)
        {
            // set default ccVisibility, default CC is visible
            player.ccVisibility = AdobePSDK.MediaPlayer.VISIBLE;
            adUrl = JSON.parse(adUrl);
            //clear ID3
            var id3Events = videoDiv.getAttribute("featureAddOnID3Events") !== null;
            if (id3Events){
            	var id3AddOn = new ReferencePlayer.AddOns.ID3();
            	id3AddOn.cleanup();
            }

            //clear Ad Markers
            var timelineMarkerEvents = videoDiv.getAttribute("featureAddOnTimelineMarkerEvents") !== null;
            if (timelineMarkerEvents) {
                var timelineMarkerAddOn = new ReferencePlayer.AddOns.TimelineMarker();
                timelineMarkerAddOn.cleanup();
            }

            // Setting Auto Play
            if (isAdditionalParamsAvail() == true) {
				if (isAuto.checked)
					autoPlay = true;
				else
					autoPlay = false;
			}

            // Checking for ABR Policy
            if (isAdditionalParamsAvail())
                loadResource_HandleABR();

            // if type is not set, determine type from url
            if (resourceType === null || typeof resourceType === 'undefined') {
                var startsWith = function (str, prefix) {
                    return str.toUpperCase().indexOf(prefix.toUpperCase()) === 0;
                };

                resourceUrl = resourceUrl.trim();
                // Check if any valid resource type is appended before media url
                if (startsWith(resourceUrl, 'dash:')) {
                    resourceUrl = resourceUrl.substring(resourceUrl.indexOf(':') + 1);
                    resourceType = AdobePSDK.MediaResourceType.DASH;
                } else if (startsWith(resourceUrl, 'hls:')) {
                    resourceUrl = resourceUrl.substring(resourceUrl.indexOf(':') + 1);
                    resourceType = AdobePSDK.MediaResourceType.HLS;
                } else if (startsWith(resourceUrl, 'mp4:') || startsWith(resourceUrl, 'mp3:')) {
                    resourceUrl = resourceUrl.substring(resourceUrl.indexOf(':') + 1);
                    resourceType = AdobePSDK.MediaResourceType.ISOBMFF;
                } else {
                    // Try to find resource type from extension
                    resourceType = getResourceTypeFromURL(resourceUrl);
                }

                if (resourceType === null) {
                    console.log("[ReferencePlayer] Resource type not supported.\n" +
                        "Specify Media as <ResourceType>:<ResourceUrl> where ResourceType can be hls, dash, mp4 or mp3.");
                    return AdobePSDK.PSDKErrorCode.kECInvalidArgument;
                }
            }

            var config = null;
            var mediaResource = null;

            var forceFlashFlag = (forceFlash == "true") || isForceFlashChecked();
            var auditudeSettings = null;
            if((adUrl && adUrl.type &&
            		(adUrl.type.indexOf("Primetime Ads") > -1 ))
            		|| isAdsParamChecked()
            		
            		)
            {
            	if((adUrl.type && adUrl.type.indexOf("Primetime Ads") > -1) || isAdsParamChecked())
            	{
                    auditudeSettings = new AdobePSDK.AuditudeSettings();

                    //settings coming from sources list
                    if(adUrl.type && adUrl.type.indexOf("Primetime Ads") > -1 && adUrl.details) {
                        auditudeSettings.domain = adUrl.details.domain;
                        auditudeSettings.mediaId = adUrl.details.mediaid;
                        auditudeSettings.zoneId = adUrl.details.zoneid;
                    }

                    //some default settings. those provided externally will override sources list
                    auditudeSettings = getAdsSettings(auditudeSettings);

                    // Set CRS required format.
                    auditudeSettings.creativeRepackagingFormat = getMimeTypeStringFromMediaResourceType(resourceType);
                }

            	var adSettings = null;
            	if(auditudeSettings)
            		adSettings = auditudeSettings;
            	/* Unsure from where these settings might be coming
				else if (DashAdSettings)
            		adSettings = DashAdSettings;
				*/
                addVideoAnalyticsTracking(adSettings);

                mediaResource = new AdobePSDK.MediaResource(resourceUrl, resourceType, adSettings, forceFlashFlag);

                config = new AdobePSDK.MediaPlayerItemConfig();
                if(adSettings )
                {
                    // if custom ad policy is checked
                    var adPolicySelector = null;
                    if (isCustomAdPolicyChecked()) {
                        var watchedPolicy = getAdWatchedPolicy();
                        var adBreakPolicy = getAdBreakPolicy();
                        var seekIntoAdPolicy = getSeekIntoAdPolicy();
                        adPolicySelector = new CustomAdPolicySelector (watchedPolicy, adBreakPolicy, seekIntoAdPolicy);
                    }

                	config.advertisingMetadata = adSettings;
                	{
                		config.advertisingFactory = new ExtCueOutContentFactory(auditudeSettings, null, adPolicySelector);
                	}

                    var subscribedTags = [];
                    subscribedTags[0] = "#EXT-X-CUE-OUT";
                    subscribedTags[1] = "#EXT-X-CUE";
                    config.subscribeTags = subscribedTags;
                }
            }
            else {
                var metadata = new AdobePSDK.Metadata();
                addVideoAnalyticsTracking(metadata);
                mediaResource = new AdobePSDK.MediaResource(resourceUrl, resourceType, metadata, forceFlashFlag);

                var config = new AdobePSDK.MediaPlayerItemConfig();
                var subscribedTags = [];
                subscribedTags[0] = "#EXT-X-START";
                config.subscribeTags = subscribedTags;
            }

            var networkConfiguration = new AdobePSDK.NetworkConfiguration();
            networkConfiguration.useRedirectedUrl = (_redirectionOptimization);
            if(isStreamIntegrityChecked())
            {
                networkConfiguration.forceNativeNetworking = true;
            }
            else {
                networkConfiguration.forceNativeNetworking = false;
            }

            if (!config) {
                config = new AdobePSDK.MediaPlayerItemConfig();
            }
            config.networkConfiguration= networkConfiguration;
            
        //    console.log(AdobePSDK.isFlashFallbackSupported(mediaResource.type));

            replaceCurrentResource(mediaResource, config);

            //Adding Label for PlayerTechnology Type
            displayPlayerTechnologyType(mediaResource);

            //Adding for HTML5 Player's current version info
            var currentVersion = player.getVersion();
            console.log("*******Player Version: " + currentVersion + "*******");

        },

        resetAndLoadResource = function(resourceUrl, adUrl, resourceType, forceFlash, thumbnailUrl, videoId, videoDuration) {
            var self = this;
            
            var listener = function(event) {
                if (event.status === AdobePSDK.MediaPlayerStatus.IDLE) {
                    player.removeEventListener(AdobePSDK.MediaPlayer.Events.StatusChangeEvent, listener);

                    loadResource.call(self, resourceUrl, adUrl, resourceType, forceFlash, thumbnailUrl, videoId, videoDuration);
                }
            };

            if(player.status === AdobePSDK.MediaPlayerStatus.IDLE) {
                 this.reset();
                 loadResource.call(self, resourceUrl, adUrl, resourceType, forceFlash, thumbnailUrl, videoId, videoDuration);
            }
            else {
                player.addEventListener(AdobePSDK.MediaPlayer.Events.StatusChangeEvent, listener);
                // first, reset player clear current resource and set state to IDLE
                this.reset();
            }
        },

        addVideoAnalyticsTracking = function(metadata)
        {
            // Video Analytics
            if (videoAnalyticsTracker) {
                videoAnalyticsTracker.detachMediaPlayer();
                videoAnalyticsTracker = null;
            }

            if (isVideoAnalyticsEnabled()) {
                //metadata.setMetadata(AdobePSDK.MetadataKeys.VIDEO_ANALYTICS_METADATA_KEY, getVideoAnalyticsMetadata());
                
                var nielsenMetadata = null;
                if (isNielsenDCREnabled()) {
                    nielsenMetadata = getNielsenTrackerExtension();
                }
                videoAnalyticsTracker = new AdobePSDK.VA.VideoAnalyticsProvider(getVideoAnalyticsMetadata(), nielsenMetadata);
                videoAnalyticsTracker.attachMediaPlayer(player);
            }
        },

        getSeekableRange = function ()
        {
            var range = player.seekableRange;
            if (range === AdobePSDK.PSDKErrorCode.kECIllegalState ||
                range === AdobePSDK.PSDKErrorCode.kECElementNotFound)
            {
                return false;
            }

            return range;
        },

        getPlaybackRange = function ()
        {
            var range = player.playbackRange;
            if (range === AdobePSDK.PSDKErrorCode.kECIllegalState ||
                range === AdobePSDK.PSDKErrorCode.kECElementNotFound)
            {
                return false;
            }

            return range;
        },

        getListeners = function (type)
        {
            if (!(type in eventListeners))
            {
                eventListeners[type] = [];
            }

            return eventListeners[type];
        };

    // set the view
    var video = new AdobePSDK.MediaPlayerView(videoDiv, fullScreenDiv);
    player.view = video;

    // add listeners
    player.addEventListener(AdobePSDK.MediaPlayer.Events.StatusChangeEvent, onStatusChange);

    /* Public functions */

    return {
        constructor: ReferencePlayer,
        _onLoadInitEventFunc : null,
        _onTimeChangeFunc : null,
        _onSeekPositionAdjustedFunc : null,
        _onPlaybackRateSelectedFunc : null,
        _onPlaybackRateChangeEventFunc : null,
        _onFullScreenChangeFunc : null,
        _onClickEventFunc : null,


        /**
         * Set custom video controls to this player. A video container must be set, via setVideoContainer,
         * before calling this method.
         * @param container - DOM element which contains custom video controls.
         */
        setVideoControls: function (container)
        {
            if (typeof player.view !== 'undefined') {
                var view = player.view;
                view.attachVideoControls(container);
            }
        },

        /*
         * Removes all video controls from the player both custom and default controls.
         */
        removeVideoControls: function() {
            if (typeof player.view !== 'undefined') {
                var view = player.view;
                view.removeVideoControls();
            }
        },


        /**
         * Load new media resource to this player. Resets player and releases any current media resource before
         * loading new resource.
         * @param url {string} - URL of manifest to load
         * @param adurl {string} - AD Server URL
         * @param type {string} - Type of media resource to load. If undefined, the media type is determined from the url.
         */
        loadMediaResource: resetAndLoadResource,
        loadPrevMediaResource : loadPrevMediaResource,
        dispatchEventWrapper : dispatchEvent,
        loadAddOns : loadAddOns,

        reset: function() {
            player.removeEventListener(AdobePSDK.MediaPlayer.Events.TimedMetadataEvent, onTimedMetadataEvent);
            player.reset();
        },

        setControlsDisabledInAd : function (val) {
            disableControlsInAd = val;
        },

        areControlsDisabledInAd : function(){
            return disableControlsInAd;
        },

        seekToLocal: function (position)
        {
            player.seekToLocal(position);
        },

        seekToLive: function ()
        {
            player.seek(AdobePSDK.MediaPlayer.LIVE_POINT);
        },

        seek : function (position)
        {
            player.seek(position);
        },

        getSeekableRange: getSeekableRange,
        getPlaybackRange: getPlaybackRange,

        /**
         * Returns the playback time currently buffered.
         * @returns the buffered range as {start, end, duration} or
         * AdobePSDK.PSDKErrorCode.kECIllegalState if the player was released or in error.
         */
        getBufferedRange: function ()
        {
            return player.bufferedRange;
        },

        addEventListener: function (type, listener)
        {
            var listeners = getListeners(type);
            var index = listeners.indexOf(listener);
            if (index === -1)
            {
                listeners.push(listener);
            }
        },

        removeEventListener: function (type, listener)
        {
            var listeners = getListeners(type);
            var index = listeners.indexOf(listener);
            if (index !== -1)
            {
                listeners.splice(index, 1);
            }
        },

        getPlayer : function() {
            return player;
        },

        getVideoDiv : function() {
            return videoDiv;
        },

        getVideoDivID : function() {
            return videoDivID;
        },

        getDRMAddOn: function() {
            return drmAddOn;
        },
	
        getLBAAddOn: function() {
	        return lbaAddOn;
        },
	
        getTrickPlayAddOn: function() {
            return trickplayAddOn;
        },
		
        getCaptionsAddOn: function() {
	        return captionsAddOn;
        },
	
        enableRedirectionOptimization : function(flag) {
            _redirectionOptimization = flag;
        },

        loadSourceJSON: loadSourceJSON
    };
};

ReferencePlayer.Events = {
    /**
     * Dispatched to notify that load has been pressed
     */
     LoadInitiatedEvent : "onLoadInitiated",
    /**
     * Dispatched to notify that load has been pressed
     */
     StatusChangeEvent : "onStatusChange",
     /**
      * Logging event
      */
     LogEvent : "onLogEvent",
     /**
      * Throttling event
      */
     ThrottleEvent : "onThrottleEvent"
};

ReferencePlayer.EventStatus = {
    /**
     * Dispatched to notify that load has been pressed
     */
     PLAYER_STATUS_COMPLETE : 8 //AdobePSDK.MediaPlayerStatus.COMPLETE
};
