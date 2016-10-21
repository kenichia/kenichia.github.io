// Additional Parameters to the player
function getPlayer () {
    return playerWrapper.getPlayer();
}

var additionalParamsVisible = false;
var vaObj;

function isAdditionalParamsAvail () {return additionalParamsVisible;}
function addOnAdditionalParams (optionsDivId) {
    additionalParamsVisible = true;
    insertAdditionalParams(optionsDivId);


}

function seekAbsolute() {
    var seek_value = (document.getElementById("seek_val").value).trim()*1000;
    playerWrapper.seekToLocal(seek_value);
}

function seekRelative() {
    var seek_value = (document.getElementById("seek_val").value).trim()*1000;
    playerWrapper.seek(seek_value);
}

function seekRelative2() {
    var seek_value = (document.getElementById("seek_val").value).trim()*1000;
    playerWrapper.seek(getPlayer().currentTime + seek_value);
}

// ABR settings
function loadResource_HandleABR () {
    if (additionalParamsVisible == false)
        return;

    if (document.getElementById("isABR").checked)
    {
        var pol;
        switch (document.getElementById("abr_pol").value)
        {
            case "0": pol = AdobePSDK.ABRControlParameters.CONSERVATIVE_POLICY; break;
            case "1": pol = AdobePSDK.ABRControlParameters.MODERATE_POLICY; break;
            case "2": pol = AdobePSDK.ABRControlParameters.AGGRESSIVE_POLICY; break;
            default:  pol = AdobePSDK.ABRControlParameters.AUTO_OFF_POLICY; break;
        }

        var initial = parseInt((document.getElementById("ini_bit").value).trim());
        var min = parseInt((document.getElementById("min_bit").value).trim());
        var max = parseInt((document.getElementById("max_bit").value).trim());

        var abrParams = new AdobePSDK.ABRControlParameters(initial, min, max, pol);
        getPlayer().abrControlParameters = abrParams;
    }
}

// Auditude Ads
function isAdsParamChecked () {
    if (isAdditionalParamsAvail()) {
        return document.getElementById("isAds").checked;
    }
    return false;
}

function getAdsSettings(auditudeSettings) {

    // Default Settings
    auditudeSettings.validMimeTypes = ["application/x-mpegURL", "vnd.apple.mpegURL", "video/mp4", "application/dash+xml"];
    auditudeSettings.responseType = "Auditude 1.4";
    auditudeSettings.creativeRepackagingEnabled = true;

    if (isAdsParamChecked()) {
        auditudeSettings.domain = (document.getElementById("val_domain").value).trim();
        auditudeSettings.mediaId = (document.getElementById("val_mediaid").value).trim();
        auditudeSettings.zoneId = (document.getElementById("val_zoneid").value).trim();
        if(document.getElementById("val_responseType_vmap").checked){
            auditudeSettings.responseType = "VMAP";
        }
        auditudeSettings.creativeRepackagingEnabled = document.getElementById('val_crs').checked;

        // Targeting Info
        if (document.getElementById("val_targeting_info").checked) {
          auditudeSettings.targetingInfo = new AdobePSDK.Metadata();
          var keyValDiv = document.getElementById("targetingInfo_keyValDiv"),
              table = keyValDiv.querySelector("table"),
              rows = table.querySelectorAll("tr"), i;
          for (i=0; i<rows.length; ++i) {
            var inputs = rows[i].querySelectorAll("input");
            if (inputs.length < 2)
              continue;

            // Check if both key and value are non-empty strings.
            var key = (inputs[0].value).trim(), value = (inputs[1].value).trim();
            if (key.length > 0 && value.length > 0) {
              auditudeSettings.targetingInfo.setValue(key, value);
            }
          }
        }
    }
    return auditudeSettings;
}



// Video Analytics
function isVideoAnalyticsEnabled () {
    if (isAdditionalParamsAvail()) {
        return document.getElementById("isVideoAnalytics").checked;
    }
    return false;
}

function isNielsenDCREnabled () {
    if (isAdditionalParamsAvail()) {
        return document.getElementById("isNielsenAnalytics").checked;
    }
    return false;
}

function getVideoAnalyticsMetadata() {
    // Set-up the Visitor ID component.
    var visitor = new Visitor('sample-marketing-cloud-org-id');
    visitor.trackingServer = 'example-vis.com';

    // Set-up the AppMeasurement component.
    var appMeasurement = new AppMeasurement();
    appMeasurement.visitor = visitor;
    appMeasurement.trackingServer = 'example-appm.com';
    appMeasurement.account = 'sample-account';
    appMeasurement.pageName = 'Sample Page Name';
    appMeasurement.charSet = "UTF-8";
    appMeasurement.visitorID = "test-vid";

    // Set-up VA Tracking Metadata.
	vaObj = new AdobePSDK.VA.VideoAnalyticsMetadata();
	vaObj.appMeasurement = appMeasurement;
	vaObj.trackingServer = 'example-hb.com';
	vaObj.publisher = 'sample-publisher';
	vaObj.channel = 'sample-channel';
	vaObj.playerName = 'TVSDK-HTML';
	vaObj.appVersion = '1.0.0';
	vaObj.videoName = 'sample-video';
	vaObj.videoId = 'sample-video-id';
	vaObj.debugLogging = false;
    //vaObj.assetDuration = 10000;
    vaObj.enableChapterTracking = true;

    /*  Sample code to enable chapter tracking
    vaObj.enableChapterTracking = true;

    var chapters = [];
    var chapterDuration = 60;
    for (var i = 0; i < 3; i++) {
        var chapterData = new AdobePSDK.VA.VideoAnalyticsChapterData("chapter_" + (i+1), i * chapterDuration, chapterDuration, (i+1));
        chapters.push(chapterData);
    }
    vaObj.chapters= chapters;
    */

    vaObj.videoMetadataBlock = function() {
        return {
            "name" : "my-video",
            "genre" : "comedy"
        };
    }

    vaObj.adMetadataBlock = function() {
        return {
            "name" : "my-ad",
            "category" : "automotive"
        };
    }

    vaObj.chapterMetadataBlock = function() {
        return {
            "name" : "my-chapter",
            "type" : "quartile"
        };
    }

	return vaObj;
}

function getNielsenTrackerExtension() {
    var nielsenTracker = new AdobePSDK.VA.VideoAnalyticsNielsenMetadata();
    nielsenTracker.appInfo = {
        "sfcode": "dcr",
        "clientid" : "Adobe",
        "apid": "000000000-0000-0000-0000-000000000000",
        "apn": "Sample Nielsen Player",
        "nol_sdkDebug":"console"
    };
    nielsenTracker.configKey = "0000000000000000000000000000000000000000/000000000000000000000000";

    nielsenTracker.contentMetadataBlock = function() {
        return {
            "type": "content",
            "assetid": "X5432-79567-JJ345-324FT",
            "program": "myProgram-content",
            "title": "MyEpisodeTitle",
            "category": "Sample category name",
            "title": "The First Episode",
            "length": 60,
            "adloadtype" : "2"
        }
    }

    nielsenTracker.adMetadataBlock = function() {
        return {
            "type": "ad",
            "assetid": "assetId-ad"
        }
    }

    nielsenTracker.channelMetadataBlock = function() {
        return {
            "channelName": "Adobe"
        }
    }

    return nielsenTracker;
}


function isForceFlashChecked () {
    if (isAdditionalParamsAvail()) {
        return document.getElementById("isForceFlash").checked;
    }
    return false;
}

function displayPlayerTechnologyType (mediaResource) {
    var playerTechType = AdobePSDK.PlayerTechnology.getSupportedTechnology(mediaResource);
    if(document.getElementById("player-tech-type"))
        document.getElementById("player-tech-type").innerHTML = "    Player Type:  " + playerTechType;
    console.log("*******Player Type:  " + playerTechType + "********\n");
}

// ABR
function loadABRSettings() {
    var pol;
    switch (document.getElementById("abr_pol").value)
    {
        case "0": pol = AdobePSDK.ABRControlParameters.CONSERVATIVE_POLICY; break;
        case "1": pol = AdobePSDK.ABRControlParameters.MODERATE_POLICY; break;
        case "2": pol = AdobePSDK.ABRControlParameters.AGGRESSIVE_POLICY; break;
        default:  pol = AdobePSDK.ABRControlParameters.AUTO_OFF_POLICY; break;
    }

    var initial = parseInt((document.getElementById("ini_bit").value).trim());
    var min = parseInt((document.getElementById("min_bit").value).trim());
    var max = parseInt((document.getElementById("max_bit").value).trim());

    var abrParams = new AdobePSDK.ABRControlParameters(initial, min, max, pol);
    if ((getPlayer().abrControlParameters = abrParams) === "undefined")
    {
        throw "SetABRControlParameters throw undefined.";
    }
}

function OpenInNewTab() {
    var win = window.open('https://helpx.adobe.com/flash-player.html', '_blank');
    win.focus();
}




function getDrmJson() {
    if (isAdditionalParamsAvail()) {
        return (document.getElementById("drmJson").value).trim();
    }
    return "";
}

function validateDrmJson() {
    var txt = getDrmJson();
    try{
        JSON.parse(txt);
        alert("json ok");
    }catch(e){
        alert(e.message);
    }
}
// Custom Ad Policy
function isCustomAdPolicyChecked () {
    if (isAdditionalParamsAvail()) {
        return document.getElementById("CustomAdBehaviors").checked;
    }
    return false;
}

function getAdWatchedPolicy() {
    var watchedPolicy = AdobePSDK.AdBreakWatchedPolicy.WATCHED_ON_BEGIN;
    if (isAdditionalParamsAvail()) {
        switch (document.getElementById("adbeh_watched_ad").value) {
        case "0":
            watchedPolicy = AdobePSDK.AdBreakWatchedPolicy.WATCHED_ON_BEGIN;
            break;
        case "1":
            watchedPolicy = AdobePSDK.AdBreakWatchedPolicy.WATCHED_ON_END;
            break;
        case "2":
            watchedPolicy = AdobePSDK.AdBreakWatchedPolicy.NEVER
            break;
        }
    }
    return watchedPolicy;
}

function getAdBreakPolicy() {
    var adBreakPolicy = AdobePSDK.AdBreakPolicy.PLAY;
    if (isAdditionalParamsAvail()) {
        switch (document.getElementById("adbeh_ad_break_policy").value) {
            case "0":
                adBreakPolicy = AdobePSDK.AdBreakPolicy.SKIP;
                break;
            case "1":
                adBreakPolicy = AdobePSDK.AdBreakPolicy.PLAY;
                break;
        }
    }
    return adBreakPolicy;
}

function getSeekIntoAdPolicy() {
    var adPolicy = AdobePSDK.AdPolicy.PLAY;
    if (isAdditionalParamsAvail()) {
        switch (document.getElementById("adbeh_ad_policy").value) {
            case "0":
                adPolicy = AdobePSDK.AdPolicy.PLAY;
                break;
            case "1":
                adPolicy = AdobePSDK.AdPolicy.PLAY_FROM_AD_BEGIN;
                break;
            case "2":
                adPolicy = AdobePSDK.AdPolicy.PLAY_FROM_AD_BREAK_BEGIN;
                break;
            case "3":
                adPolicy = AdobePSDK.AdPolicy.SKIP_TO_NEXT_AD_IN_AD_BREAK;
                break;
            case "4":
                adPolicy = AdobePSDK.AdPolicy.SKIP_AD_BREAK;
        }
    }
    return adPolicy;
}


// Stream Integrity
function isStreamIntegrityChecked () {
    if (isAdditionalParamsAvail()) {
        return document.getElementById("StreamIntegrity").checked;
    }
    return false;
}

// DRM settings
function loadResource_HandleDRM () {
    if (additionalParamsVisible == false)
        return;

    if (document.getElementById("isDRM").checked)
    {
        var DRMSettings = {};
        var drmJsonText = (document.getElementById("drmJson").value).trim();
        try {
           DRMSettings = JSON.parse(drmJsonText);
        }catch(e){
            alert("Error in parsing DRM json" + e.message);
        }
        var drm = playerWrapper.getDRMAddOn();
        if(drm != null)
            drm.setDRMSettings(DRMSettings);
    }
}

//DRM User Authenticate
function getDRMAuthenticate () {
	var authenticateData = {};
    authenticateData.userName = (document.getElementById("drm_content_username").value).trim();
    authenticateData.pwd = (document.getElementById("drm_content_password").value).trim();

    return authenticateData;
}

// UI part
function insertAdditionalParams (optionsDivId) {
    var additionalParam = '<div class="panel">'
                    //Enable Auto Playback
                    + '<input type="checkbox" id="isAuto" checked="true" />'
                    + '<span class="panel-title">Enable Auto Playback</span>'
                    // ABR Settings
                    + '<hr class="hr-style">'
                    + '<input type="checkbox" id="isABR" />'
                    + '<span class="panel-title">ABR Settings</span>'
                    + '<br>'
                    + '<span class="panel-param">Policy:</span>'
                    + '<select id="abr_pol">'
                        + '<option value="0">Conservative</option>'
                        + '<option value="1">Moderate</option>'
                        + '<option value="2">Aggresive</option>'
                    + '</select>'
                    + '<br>'
                    + '<span class="panel-param">Initial Bitrate:</span>'
                    + '<input type="text" id="ini_bit" value="0"><br>'
                    + '<span class="panel-param">Min. Bitrate:</span>'
                    + '<input type="text" id="min_bit" value="0"><br>'
                    + '<span class="panel-param">Max. Bitrate:</span>'
                    + '<input type="text" id="max_bit" value="10000000"><br>'
                    + '<button type="button" id="load-abr" onclick="loadABRSettings()" style="padding:5px;margin:5px;margin-top:10px">Load during Playback</button>'
                    + '<hr class="hr-style">'
                    // Auditude Ads Settings
                    + '<input type="checkbox" id="isAds" />'
                    + '<span class="panel-title">Auditude Ads Settings</span>'
                    + '<br>'
                    + '<span class="panel-param">Domain:</span>'
                    + '<input type="text" id="val_domain" value="auditude.com"><br>'
                    + '<span class="panel-param">Media ID:</span>'
                    + '<input type="text" id="val_mediaid" value="noidaPT_asset_15Seconds_2Slots_RequestId4"><br>'
                    + '<span class="panel-param">Zone ID:</span>'
                    + '<input type="text" id="val_zoneid" value="264573"><br>'
                    + '<span class="panel-param">Response Type:</span><br>'
                    + '<input type="radio" name="val_responseType" id="val_responseType_aud1.4" value="Auditude 1.4" checked="checked">'
                    + '<span class="panel-param">Auditude 1.4</span>'
                    + '<input type="radio" name="val_responseType" id="val_responseType_vmap" value="VMAP">'
                    + '<span class="panel-param">VMAP</span><br>'
                    + '<input type="checkbox" name="val_crs" id="val_crs" checked="checked">'
                    + '<span class="panel-param">Repackage MP4 ads to HLS</span><br>'
                    + '<input type="checkbox" name="val_targeting_info" id="val_targeting_info">'
                    + '<span class="panel-param">Targeting Info</span><br>'
                    + '<hr class="hr-style">'
                    // Flash Fallback
                    + '<input type="checkbox" id="isForceFlash" />'
                    + '<span class="panel-title">Force Flash Fallback</span>'
                    + '<br>'
                    + '<button type="button" onclick="OpenInNewTab()" style="padding:5px;margin:5px;margin-top:10px">Check Flash Version</button>'
                    + '<hr class="hr-style">'
                    // Seek Settings
                    + '<span class="panel-title">Seek</span><br>'
                    + 'In Seconds: <input type="text" id="seek_val" value="0"><br>'
                    + '<button type="button" onclick="seekAbsolute()" style="padding:5px;margin:5px;margin-top:10px">SeekToLocal</button>'
                    + '<button type="button" onclick="seekRelative()" style="padding:5px;margin:5px;margin-top:10px">Seek</button>'
                    + '<button type="button" onclick="seekRelative2()" style="padding:5px;margin:5px;margin-top:10px">Relative Seek</button>'
					// Startup at an Offset
					+ '<hr class="hr-style">'
					+ '<input type="checkbox" id="StartAtOffset" />'
					+ '<span class="panel-title">Start At offset</span><br>'
                    + 'Offset In Seconds: <input type="text" id="offset" value="0"><br>'
                    // Video Analytics Settings
					+ '<hr class="hr-style">'
                    + '<input type="checkbox" id="isVideoAnalytics" />'
                    + '<span class="panel-title">Video Analytics Tracking</span>'
                    + '<br>'
                    + '<input type="checkbox" id="isNielsenAnalytics" />'
                    + '<span class="panel-title">Nielsen DCR Tracking</span>'
					// Custom Ad Behaviors
					+ '<hr class="hr-style">'
					+ '<input type="checkbox" id="CustomAdBehaviors" />'
					+ '<span class="panel-title">Custom Ad Behaviors</span><br>'
                    + '<br>'
                    + '<span class="panel-param">AD_BREAK_AS_WATCHED Policy:</span>'
                    + '<select id="adbeh_watched_ad">'
                        + '<option value="0">ON_BEGIN</option>'
                        + '<option value="1">ON_END</option>'
                        + '<option value="2">NEVER</option>'
                    + '</select><br>'
                    + '<span class="panel-param">AD_BREAK_POLICY:</span>'
                    + '<select id="adbeh_ad_break_policy">'
                        + '<option value="1">PLAY</option>'
                        + '<option value="0">SKIP</option>'
                    + '</select><br>'
                    + '<span class="panel-param">Policy For Seek Into Ad:</span>'
                    + '<select id="adbeh_ad_policy">'
                        + '<option value="0">PLAY</option>'
                        + '<option value="1">PLAY_FROM_AD_BEGIN</option>'
                        + '<option value="2">PLAY_FROM_AD_BREAK_BEGIN</option>'
                        + '<option value="3">SKIP_TO_NEXT_AD_IN_BREAK</option>'
                        + '<option value="4">SKIP_AD_BREAK</option>'
                    + '</select>'
                    + '<br>'
                    // Stream Integrity
                    + '<hr class="hr-style">'
                    + '<input type="checkbox" id="StreamIntegrity" />'
                    + '<span class="panel-title">Stream Integrity</span><br>'+
                    // 302 Redirect Handling
                    '<hr class="hr-style">' +
                    '<span class="panel-title">Enable 302 Redirect Optimization</span><br>' +
                    '<input type="radio" name="val_302redirect" id="val_302redirect_yes" value="yes" checked="checked">' +
                    '<span class="panel-param">Yes</span>' +
                    '<input type="radio" name="val_302redirect" id="val_302redirect_no" value="no">' +
                    '<span class="panel-param">No</span><br>'
                    //DRM User Authenticate
                    + '<hr class="hr-style">'
                    + '<span class="panel-title">DRM User Authenticate</span><br>'
                    + '<span class="panel-param">UserName:</span>'
                    + '<input type="text" id="drm_content_username" cols="15" value="testuser"><br>'
                    + '<span class="panel-param">Password:</span>'
                    + '<input type="text" id="drm_content_password" cols="15" value="testpass">'
                    // DRM Settings
                    + '<hr class="hr-style">'
                    + '<input type="checkbox" id="isDRM" />'
                    + '<span class="panel-title">DRM Settings</span>'
                    + '<br>'
                    + '<textarea rows="10" cols="50" id="drmJson"></textarea>'
                    + '<br>'
                    + '<button type="button" id="validate-drm-json" onclick="validateDrmJson()">Validate DRM json</button>'
            + '</div>';

    var targetIdElement = this.window.document.getElementById(optionsDivId);
    targetIdElement.innerHTML = additionalParam;

    // 302 Redirect
    var radios = document.querySelectorAll('input[type=radio][name="val_302redirect"]');
    var redirectChangeHandler = function (event) {
        var flag;
        switch (this.value) {
            case "yes" :
                flag = true;
                break;
            case "no" :
            default :
                flag = false;
        }
        playerWrapper.enableRedirectionOptimization(flag);
    };
    for (var i = 0; i < radios.length; ++i) {
        radios[i].addEventListener('change', redirectChangeHandler);
    }

    // Targeting Info
    var keyValDiv = document.createElement("div"), table = document.createElement("table"),
        targetingInfo = document.getElementById("val_targeting_info");
    keyValDiv.style.display = "none";
    keyValDiv.setAttribute("id", "targetingInfo_keyValDiv");

    var createSpan = function (text) {
      var span = document.createElement("span");
      span.appendChild( document.createTextNode(text) );
      return span;
    },
    createRemoveButton = function () {
      var button = document.createElement("button");
      button.appendChild( document.createTextNode("Remove") );
      button.onclick = function () {
        var parentRow = button.parentNode;
        table.removeChild(parentRow);
      };
      return button;
    },
    createRow = function (row, isRemovable) {
      var rowTag = document.createElement("tr"), i;

      for (i=0; i<row.length; ++i) {
        var tag = document.createElement(row[i].tag);
        tag.appendChild(row[i].content);
        rowTag.appendChild(tag);
      }

      if (isRemovable) {
        rowTag.appendChild( createRemoveButton() );
      }
      return rowTag;
    };


    // Create table header
    var header = [
      {
        "tag" : "th",
        "content" : createSpan("Key")
      },
      {
        "tag" : "th",
        "content" : createSpan("Value")
      }
    ];
    table.appendChild( createRow(header) );

    // Create First Row by Default. This row is non-removable.
    var firstRow = [
      {
        "tag" : "td",
        "content" : document.createElement("input")
      },
      {
        "tag" : "td",
        "content" : document.createElement("input")
      }
    ];
    table.appendChild( createRow(firstRow) );
    keyValDiv.appendChild(table);

    var addButton = document.createElement("button");
    addButton.appendChild( document.createTextNode("Add Row") );
    addButton.onclick = function () {
      // Add a new row, which is removable.
      var row = [
        {
          "tag" : "td",
          "content" : document.createElement("input")
        },
        {
          "tag" : "td",
          "content" : document.createElement("input")
        }
      ];
      table.appendChild( createRow(row, true) );
    };
    keyValDiv.appendChild(addButton);

    // Insert a keyValDiv tag after the targeting info checkbox.
    targetingInfo.parentNode.insertBefore(keyValDiv, targetingInfo.nextSibling.nextSibling);


    targetingInfo.onchange = function () {
      if (targetingInfo.checked) {
        keyValDiv.style.display = "block";
      }
      else {
        keyValDiv.style.display = "none";
      }
    };
}
