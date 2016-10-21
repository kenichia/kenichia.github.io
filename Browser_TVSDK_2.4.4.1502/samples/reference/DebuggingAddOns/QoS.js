// QoS
function getPlayer() {
    return playerWrapper.getPlayer();
}

var qosSectionVisible = false;
var qosProvider = null;
var justOneTime = true;
var qosTimerEvent = "qosTimerEvent";

ReferencePlayer.AddOns = ReferencePlayer.AddOns || {}
ReferencePlayer.AddOns.QoS = {}
function isQoSMetricsEnabled () {return qosSectionVisible;}
function isOoSEnabled () {return document.getElementById("isQoSEnabled").checked;}

// Timer for updating QoS
var qosTimer = (function () {
    var ref = null,
            qosChangeInterval = 500, // milliseconds

            startTimer = function () {
                if (typeof playerWrapper !== "undefined")
                    playerWrapper.dispatchEventWrapper(qosTimerEvent, {target: this});
                    ref = window.setTimeout(startTimer, qosChangeInterval);
                };

        return {
            start: function () {
                if (ref !== null) {
                    // don't start another timeout if one already exists.
                    return;
                }
                startTimer();
            },

            stop: function () {
                window.clearTimeout(ref);
                ref = null;
            }
        };
    })();
function startQoS() {
    qosTimer.start();
    // register for events
    playerWrapper.addEventListener(qosTimerEvent, metricsUpdateEvent);
    playerWrapper.addEventListener(ReferencePlayer.Events.LoadInitiatedEvent, ReferencePlayer.AddOns.QoS.onLoadInitEvent);
    playerWrapper.addEventListener(ReferencePlayer.Events.LogEvent, appendLogEvent);
}

function stopQoS() {
    qosTimer.stop();
    //qosProvider.detachMediaPlayer();
    playerWrapper.removeEventListener(qosTimerEvent, metricsUpdateEvent);
    playerWrapper.removeEventListener(ReferencePlayer.Events.LoadInitiatedEvent, ReferencePlayer.AddOns.QoS.onLoadInitEvent);
    playerWrapper.removeEventListener(ReferencePlayer.Events.LogEvent, appendLogEvent);
}

function toggleQoS() {
    if (isOoSEnabled()) {
        startQoS();
    } else {
        stopQoS();
    }
}

function addOnQoSMetrics (performanceLogsDivId, qosMetricsDivId) {
    qosSectionVisible = true;
    insertQoSMetrics(performanceLogsDivId, qosMetricsDivId);
    qosProvider = new AdobePSDK.QOSProvider();
    qosProvider.attachMediaPlayer(getPlayer());
    /*
    if (isOoSEnabled()) {
        startQoS();
    }
    */
}

function resetPerformanceLogs () {
    if (isQoSMetricsEnabled())
        document.getElementById("perf_log").value = "";
}

function appendLogs (message) {
    document.getElementById("perf_log").value += message;
    var perfId = document.getElementById("perf_log");
    perfId.scrollTop = perfId.scrollHeight;
}

function appendLogEvent (event) {
    if (isQoSMetricsEnabled()) {
        if (document.getElementById("isEvents") && document.getElementById("isEvents").checked) {
            appendLogs (event.message);
        }
    }
}

function insertQoSMetrics (performanceLogsDivId, qosMetricsDivId) {

    var qosMetricsHTML = '<div class="panel">'
            + '<div class="panel-heading">'
            + '<input type="checkbox" id="isQoSEnabled" checked onclick="toggleQoS()"/>'
            + '<span class="panel-title">Enable QoS Metrics</span>'
            + '<br>'
            + '<button type="button" onclick="dumpQoS()" style="padding:5px;margin:5px;margin-top:10px">Dump QoS Metric in Console Log</button>'
            + '<hr class="hr-style">'
            + '<span class="panel-title">Player Metrics</span>'
            + '</div>'
            + '<div class="panel-body panel-stats">'
            + '<p class="text-primary">'
            + 'Initialization time:'
            + '<span id="player-initTime">0</span> ms'
            + '</p>'
            + '<p class="text-primary">'
            + 'Preparing time:'
            + '<span id="player-prepareTime">0</span> ms'
            + '</p>'
            + '<p class="text-primary">'
            + 'Time to start:'
            + '<span id="player-startTime">0</span> ms'
            + '</p>'
            + '<p class="text-primary">'
            + 'Initial Bitrate:'
            + '<span id="player-initBitrate">0</span> bps'
            + '</p>'
            + '<p class="text-primary">'
            + 'Total time buffering:'
            + '<span id="player-totalBufferingTime">0</span> ms'
            + '</p>'
            + '<p class="text-primary">'
            + 'Empty buffer count:'
            + '<span id="player-emptyBufferCount">0</span>'
            + '</p>'
            + '<p class="text-primary">'
            + 'Seek times:'
            + 'last <span id="player-seekCount">0</span> seeks'
            + '<ul style="margin:0">'
            + '<li>avg: <span id="player-seekAvg">0</span> ms</li>'
            + '<li>high: <span id="player-seekHigh">0</span> ms</li>'
            + '<li>low: <span id="player-seekLow">0</span> ms</li>'
            + '</ul>'
            + '</p>'
            + '<p class="text-primary">'
            + 'timeToFirstByte:'
            + '<span id="player-timeToFirstByte">0</span> ms'
            + '</p>'
            + '<p class="text-primary">'
            + 'timeToLoad:'
            + '<span id="player-timeToLoad">0</span> ms'
            + '</p>'
            + '<p class="text-primary">'
            + 'timeToStart:'
            + '<span id="player-timeToStart">0</span> ms'
            + '</p>'
            + '<p class="text-primary">'
            + 'timeToFail:'
            + '<span id="player-timeToFail">0</span> ms'
            + '</p>'
            + '<p class="text-primary">'
            + 'totalSecondsPlayed:'
            + '<span id="player-totalSecondsPlayed">0</span> s'
            + '</p>'
            + '<p class="text-primary">'
            + 'totalSecondsSpent:'
            + '<span id="player-totalSecondsSpent">0</span> s'
            + '</p>'
            + '<p class="text-primary">'
            + 'frameRate:'
            + '<span id="player-frameRate">0</span>'
            + '</p>'
            + '<p class="text-primary">'
            + 'droppedFrameCount:'
            + '<span id="player-droppedFrameCount">0</span>'
            + '</p>'
            + '<p class="text-primary">'
            + 'perceivedBandwidth:'
            + '<span id="player-perceivedBandwidth">0</span>'
            + '</p>'
            + '<p class="text-primary">'
            + 'bitrate:'
            + '<span id="player-bitrate">0</span>'
            + '</p>'
            + '<p class="text-primary">'
            + 'bufferTime:'
            + '<span id="player-bufferTime">0</span> ms'
            + '</p>'
            + '</div>'
            + '<hr class="hr-style">'
            + '<div class="panel-heading">'
            + '<span class="panel-title">Video Metrics</span>'
            + '</div>'
            + '<div class="panel-body panel-stats">'
            + '<p class="text-primary">'
            + 'BitRate:'
            + '<span id="video-bitrate-index">0</span>' ///<span id="video-bitrate-pending"></span>/<span id="video-bitrate-max">0</span>'
            + '</p>'
            + '<p class="text-primary">'
            + 'Bandwidth:'
            + '<span id="video-bandwidth">0</span> bps'
            + '</p>'
            + '<p class="text-primary">'
            + 'Buffer Length:'
            + '<span id="video-bufferLength">0</span>'
            + '</p>'
            + '<p class="text-primary">'
            + 'Dropped Frame Count:'
            + '<span id="video-droppedFrames">0</span>'
            + '</p>'
            /*+ '<p class="text-primary">'
            + 'Latency:'
            + 'last <span id="video-latencyCount">0</span> segments'
            + '<ul style="margin:0">'
            + '<li>avg: <span id="video-latencyAvg">0</span> ms</li>'
            + '<li>high: <span id="video-latencyHigh">0</span> ms</li>'
            + '<li>low: <span id="video-latencyLow">0</span> ms</li>'
            + '</ul>'
            + '</p>'
            + '<p class="text-primary">'
            + 'Download:'
            + 'last <span id="video-downloadCount">0</span> segments'
            + '<ul style="margin:0">'
            + '<li>avg: <span id="video-downloadAvg">0</span> ms</li>'
            + '<li>high: <span id="video-downloadHigh">0</span> ms</li>'
            + '<li>low: <span id="video-downloadLow">0</span> ms</li>'
            + '</ul>'
            + '</p>'*/
            + '</div>'
            + '<hr class="hr-style">'
            + '<div class="panel-heading">'
            + '<span class="panel-title">Audio Metrics</span>'
            + '</div>'
            + '<div class="panel-body panel-stats">'
            + '<p class="text-primary">'
            + 'Profile:'
            + '<span id="audio-bitrate-index">0</span>' //<span id="audio-bitrate-pending"></span>/<span id="audio-bitrate-max">0</span>'
            + '</p>'
            + '<p class="text-primary">'
            + 'Bandwidth:'
            + '<span id="audio-bandwidth">0</span> bps'
            + '</p>'
            + '<p class="text-primary">'
            + 'Buffer Length:'
            + '<span id="audio-bufferLength">0</span>'
            + '</p>'
            + '<p class="text-primary">'
            + 'Dropped Frames:'
            + '<span id="audio-droppedFrames">0</span>'
            + '</p>'
            /*+ '<p class="text-primary">'
            + 'Latency:'
            + 'last <span id="audio-latencyCount">0</span> segments'
            + '<ul style="margin:0">'
            + '<li>avg: <span id="audio-latencyAvg">0</span> ms</li>'
            + '<li>high: <span id="audio-latencyHigh">0</span> ms</li>'
            + '<li>low: <span id="audio-latencyLow">0</span> ms</li>'
            + '</ul>'
            + '</p>'
            + '<p class="text-primary">'
            + 'Download:'
            + 'last <span id="audio-downloadCount">0</span> segments'
            + '<ul style="margin:0">'
            + '<li>avg: <span id="audio-downloadAvg">0</span> ms</li>'
            + '<li>high: <span id="audio-downloadHigh">0</span> ms</li>'
            + '<li>low: <span id="audio-downloadLow">0</span> ms</li>'
            + '</ul>'
            + '</p>'
            + '</div>'*/
            + '</div>';

    var targetIdElement = this.window.document.getElementById(qosMetricsDivId);
    targetIdElement.innerHTML = qosMetricsHTML;

    // Logs
    var performanceLogsHTML = '<b>Performance Logs</b>'
            + '<table style="width:100%">'
            + '<tr height="30px">'
            + '<td>'
            + '   <input type="checkbox" id="isEvents" checked="true" class="checkbox"/> Events'
            + '   <input type="checkbox" id="isQOS"  class="checkbox"/> QoS Data'
            + '</td>'
            + '  <td>'
            + '<button style="width:100%;height:100%" onclick="resetPerformanceLogs();">Clear</button>'
            + '</td> '
            + '</tr>'
            + '</table>'
            + '<textarea id="perf_log" rows="30%" columns="50%" disabled="true"></textarea>';

	if(document.getElementById(performanceLogsDivId)){
    	 document.getElementById(performanceLogsDivId).removeAttribute("style");
   	 var targetIdElement = this.window.document.getElementById(performanceLogsDivId);
   	 targetIdElement.innerHTML = performanceLogsHTML;
	}
}

ReferencePlayer.AddOns.QoS.onLoadInitEvent = function (event) {
    justOneTime = true;
}

function metricsUpdateEvent (event)
{
    var metrics = qosProvider.playbackInformation;
    if (metrics === null || typeof metrics === 'undefined' || metrics === AdobePSDK.PSDKErrorCode.kECIllegalState) {
        return;
    }

    var letsLog = "";

    // QoS Metrics
    if (isQoSMetricsEnabled() == false)
        return;

    if (metrics)
    {
        document.getElementById("player-timeToFirstByte").innerHTML = (metrics.timeToFirstByte).toFixed(3);
        document.getElementById("player-timeToLoad").innerHTML = (metrics.timeToLoad).toFixed(3);
        document.getElementById("player-timeToStart").innerHTML = (metrics.timeToStart).toFixed(3);
        document.getElementById("player-timeToFail").innerHTML = (metrics.timeToFail).toFixed(3);
        document.getElementById("player-totalSecondsPlayed").innerHTML = (metrics.totalSecondsPlayed).toFixed(3);
        document.getElementById("player-totalSecondsSpent").innerHTML = (metrics.totalSecondsSpent).toFixed(3);
        document.getElementById("player-frameRate").innerHTML = (metrics.frameRate).toFixed(3);
        document.getElementById("player-droppedFrameCount").innerHTML = metrics.droppedFrameCount? (metrics.droppedFrameCount).toFixed(2): 0;
        document.getElementById("player-perceivedBandwidth").innerHTML = (metrics.perceivedBandwidth).toFixed(2);
        var bitrate = 0;
        if (metrics.bitRate != null)
            bitrate = (metrics.bitRate).toFixed(2);
        document.getElementById("player-bitrate").innerHTML = bitrate;
        document.getElementById("player-bufferTime").innerHTML = (metrics.bufferTime).toFixed(3);

        document.getElementById("player-initTime").innerHTML = (metrics.timeToInitialize).toFixed(3);
        document.getElementById("player-prepareTime").innerHTML = (metrics.timeToPrepare).toFixed(3);
        document.getElementById("player-startTime").innerHTML = (metrics.timeToPlay).toFixed(3);
        document.getElementById("player-totalBufferingTime").innerHTML = (metrics.totalBufferingTime).toFixed(3);
        document.getElementById("player-emptyBufferCount").innerHTML = metrics.emptyBufferCount;

        if ((metrics.timeToLoad).toFixed(0) > 0 && justOneTime)
        {
            justOneTime = false;
            letsLog = "["+getDate()+"] [Initialize]";
            letsLog += " [TimeToFirstByte:"+(metrics.timeToFirstByte).toFixed(3)+"]";
            letsLog += " [TimeToLoad:"+(metrics.timeToLoad).toFixed(3)+"]";
            letsLog += " [TimeToStart:"+(metrics.timeToStart).toFixed(3)+"]";
            letsLog += " [TimeToFail:"+(metrics.timeToFail).toFixed(3)+"]";
            var bitrate = 0;
            if (metrics.bitRate != null)
                bitrate = (metrics.bitRate).toFixed(2);
            letsLog += " [InitialBitrate:"+(bitrate)+"]";
            letsLog += "\n";
            if (document.getElementById("isQOS") && document.getElementById("isQOS").checked)
                appendLogs (letsLog);
            document.getElementById("player-initBitrate").innerHTML = metrics.bitRate?(metrics.bitRate).toFixed(2) : 0;
        }

        letsLog = "["+getDate()+"] [Player Metrics]";
        letsLog += " [totalSecondsPlayed:"+(metrics.totalSecondsPlayed).toFixed(2)+"]";
        letsLog += " [totalSecondsSpent:"+(metrics.totalSecondsSpent).toFixed(2)+"]";
        letsLog += " [FrameRate:"+(metrics.frameRate).toFixed(2)+"]";
        var bitrate = 0;
        if (metrics.bitRate != null)
            bitrate = (metrics.bitRate).toFixed(2);

        letsLog += " [Bitrate:"+ bitrate+"]";
        letsLog += " [totalBufferingTime:"+(metrics.totalBufferingTime).toFixed(2)+"]";
        if (metrics.droppedFrameCount && (metrics.droppedFrameCount).toFixed(2)>0) { letsLog+=" [droppedFrameCount:"+(metrics.droppedFrameCount).toFixed(2)+"]" }
        if ((metrics.perceivedBandwidth).toFixed(2)>0) { letsLog+=" [perceivedBandwidth:"+(metrics.perceivedBandwidth).toFixed(2)+"]" }
        if ((metrics.bufferTime).toFixed(3)>0) { letsLog+=" [bufferTime:"+(metrics.bufferTime).toFixed(2)+"]" }
        if ((metrics.emptyBufferCount).toFixed(2)>0) { letsLog+=" [emptyBufferCount:"+(metrics.emptyBufferCount).toFixed(2)+"]" }

        if (metrics.seekTimes)
        {
            document.getElementById("player-seekCount").innerHTML = metrics.seekTimes.count;
            document.getElementById("player-seekAvg").innerHTML = (metrics.seekTimes.average).toFixed(2);
            document.getElementById("player-seekHigh").innerHTML = (metrics.seekTimes.high).toFixed(2);
            document.getElementById("player-seekLow").innerHTML = (metrics.seekTimes.low).toFixed(2);

            if ((metrics.seekTimes.count).toFixed(3)>0) { letsLog+=" [seekTimes:"+(metrics.seekTimes.count).toFixed(3) }
            if ((metrics.seekTimes.average).toFixed(3)>0) { letsLog+=" Avg:"+(metrics.seekTimes.average).toFixed(3) }
            if ((metrics.seekTimes.high).toFixed(3)>0) { letsLog+=" High:"+(metrics.seekTimes.high).toFixed(3) }
            if ((metrics.seekTimes.low).toFixed(3)>0) { letsLog+=" Low:"+(metrics.seekTimes.low).toFixed(3)+"]" }
        }
        letsLog += "\n";
        if (document.getElementById("isQOS") && document.getElementById("isQOS").checked)
            appendLogs (letsLog);
    }

    if (metrics && metrics.playbackMetrics)
    {
    	var audioVideoMetrics = metrics.playbackMetrics;
        //for video
        var videoBitrateValue, videoPerceivedBandwidthValue, videoBufferLengthValue, videoDroppedFramesCountValue, videoBufferedRangeValue;
        if(typeof audioVideoMetrics.bitRate === 'object') //MSE + MediaElements
        {
            videoBitrateValue = audioVideoMetrics.bitRate.video ? audioVideoMetrics.bitRate.video : 0;
            videoPerceivedBandwidthValue = audioVideoMetrics.perceivedBandwidth.video ? audioVideoMetrics.perceivedBandwidth.video : 0;
            videoBufferLengthValue = audioVideoMetrics.bufferLength.video ? audioVideoMetrics.bufferLength.video : 0;
            videoDroppedFramesCountValue = audioVideoMetrics.droppedFramesCount.video ? audioVideoMetrics.droppedFramesCount.video : 0;
        }
        else //flash fallback
        {
            videoBitrateValue = audioVideoMetrics.bitRate ? audioVideoMetrics.bitRate : 0;
            videoPerceivedBandwidthValue = audioVideoMetrics.perceivedBandwidth ? audioVideoMetrics.perceivedBandwidth : 0;
            videoBufferLengthValue = audioVideoMetrics.bufferLength ? audioVideoMetrics.bufferLength : 0;
            videoDroppedFramesCountValue = audioVideoMetrics.droppedFramesCount ? audioVideoMetrics.droppedFramesCount : 0;
        }
        videoBufferedRangeValue = audioVideoMetrics.bufferedRange ? audioVideoMetrics.bufferedRange : 0;

    	document.getElementById("video-bitrate-index").innerHTML = videoBitrateValue;
        document.getElementById("video-bandwidth").innerHTML = videoPerceivedBandwidthValue;
        document.getElementById("video-bufferLength").innerHTML = videoBufferLengthValue;
        document.getElementById("video-droppedFrames").innerHTML = videoDroppedFramesCountValue;
        letsLog = "["+getDate()+"] [Video Metrics]";
        letsLog += " [Bitrate:"+videoBitrateValue+"]";
        letsLog += " [Bandwidth:"+videoPerceivedBandwidthValue+"]";
        letsLog += " [BufferedRange:"+videoBufferedRangeValue+"]";
        if (videoDroppedFramesCountValue && (videoDroppedFramesCountValue).toFixed(0)>0) { letsLog+=" [droppedFrameCount:"+(videoDroppedFramesCountValue).toFixed(0)+"]" }

        letsLog += "\n";
        if (document.getElementById("isQOS") && document.getElementById("isQOS").checked)
            appendLogs (letsLog);

        //for audio
        var audioBitrateValue, audioPerceivedBandwidthValue, audioBufferLengthValue, audioDroppedFramesCountValue, audioBufferedRangeValue;
        if(typeof audioVideoMetrics.bitRate === 'object') //MSE + MediaElements
        {
            audioBitrateValue = audioVideoMetrics.bitRate.audio ? audioVideoMetrics.bitRate.audio : 0;
            audioPerceivedBandwidthValue = audioVideoMetrics.perceivedBandwidth.audio ? audioVideoMetrics.perceivedBandwidth.audio : 0;
            audioBufferLengthValue = audioVideoMetrics.bufferLength.audio ? audioVideoMetrics.bufferLength.audio : 0;
            audioDroppedFramesCountValue = audioVideoMetrics.droppedFramesCount.audio ? audioVideoMetrics.droppedFramesCount.audio : 0;
        }
        else //flash fallback
        {
            audioBitrateValue = audioVideoMetrics.bitRate ? audioVideoMetrics.bitRate : 0;
            audioPerceivedBandwidthValue = audioVideoMetrics.perceivedBandwidth ? audioVideoMetrics.perceivedBandwidth : 0;
            audioBufferLengthValue = audioVideoMetrics.bufferLength ? audioVideoMetrics.bufferLength : 0;
            audioDroppedFramesCountValue = audioVideoMetrics.droppedFramesCount ? audioVideoMetrics.droppedFramesCount : 0;
        }
        audioBufferedRangeValue = audioVideoMetrics.bufferedRange ? audioVideoMetrics.bufferedRange : 0;
        document.getElementById("audio-bitrate-index").innerHTML = audioBitrateValue;
        document.getElementById("audio-bandwidth").innerHTML = audioPerceivedBandwidthValue;
        document.getElementById("audio-bufferLength").innerHTML = audioBufferLengthValue;
        document.getElementById("audio-droppedFrames").innerHTML = audioDroppedFramesCountValue;

        letsLog = "["+getDate()+"] [Audio Metrics]";
        letsLog += " [Profile:"+audioBitrateValue+"]";
        letsLog += " [Bandwidth:"+audioPerceivedBandwidthValue+"]";
        letsLog += " [BufferLength:"+audioBufferLengthValue+"]";
        if ((audioDroppedFramesCountValue) && (audioDroppedFramesCountValue).toFixed(0)>0) { letsLog+=" [droppedFramesValue:"+(audioDroppedFramesCountValue).toFixed(0)+"]" }

        letsLog += "\n";
        if (document.getElementById("isQOS") && document.getElementById("isQOS").checked)
            appendLogs (letsLog);
    }
}

function dumpQoS() {
    // if (!isOoSEnabled()) {
    //     qosProvider.attachMediaPlayer(getPlayer());
    // }
    var metrics = qosProvider.playbackInformation;
    if (metrics === null || typeof metrics === 'undefined' || metrics === AdobePSDK.PSDKErrorCode.kECIllegalState) {
        return;
    }

    var letsLog = "["+getDate()+"]";

    if (metrics)
    {
        letsLog += " [timeToFirstByte:" + (metrics.timeToFirstByte).toFixed(2)+"]";
        letsLog += " [timeToLoad:" + (metrics.timeToLoad).toFixed(2)+"]";
        letsLog += " [timeToStart:" + (metrics.timeToStart).toFixed(2)+"]";
        letsLog += " [timeToFail:" + (metrics.timeToFail).toFixed(2)+"]";
        letsLog += " [totalSecondsPlayed:" + (metrics.totalSecondsPlayed).toFixed(2)+"]";
        letsLog += " [totalSecondsSpent:" + (metrics.totalSecondsSpent).toFixed(2)+"]";
        letsLog += " [frameRate:" + (metrics.frameRate).toFixed(2)+"]";
        letsLog += " [droppedFrameCount:" + (metrics.droppedFrameCount? (metrics.droppedFrameCount).toFixed(2): 0) +"]";
        letsLog += " [perceivedBandwidth:" + (metrics.perceivedBandwidth).toFixed(2)+"]";
        letsLog += " [totalBufferingTime:" + (metrics.totalBufferingTime).toFixed(3)+"]";
        letsLog += " [emptyBufferCount:" + metrics.emptyBufferCount+"]";
        letsLog += "\n";
    }

    if (metrics && metrics.playbackMetrics)
    {
        var audioVideoMetrics = metrics.playbackMetrics;
        //for video
        var videoBitrateValue, videoPerceivedBandwidthValue, videoBufferLengthValue, videoDroppedFramesCountValue;
        if(typeof audioVideoMetrics.bitRate === 'object') //MSE + MediaElements
        {
            videoBitrateValue = audioVideoMetrics.bitRate.video ? audioVideoMetrics.bitRate.video : 0;
            videoPerceivedBandwidthValue = audioVideoMetrics.perceivedBandwidth.video ? audioVideoMetrics.perceivedBandwidth.video : 0;
            videoBufferLengthValue = audioVideoMetrics.bufferLength.video ? audioVideoMetrics.bufferLength.video : 0;
            videoDroppedFramesCountValue = audioVideoMetrics.droppedFramesCount.video ? audioVideoMetrics.droppedFramesCount.video : 0;
        }
        else //flash fallback
        {
            videoBitrateValue = audioVideoMetrics.bitRate ? audioVideoMetrics.bitRate : 0;
            videoPerceivedBandwidthValue = audioVideoMetrics.perceivedBandwidth ? audioVideoMetrics.perceivedBandwidth : 0;
            videoBufferLengthValue = audioVideoMetrics.bufferLength ? audioVideoMetrics.bufferLength : 0;
            videoDroppedFramesCountValue = audioVideoMetrics.droppedFramesCount ? audioVideoMetrics.droppedFramesCount : 0;
        }

        letsLog += " [video-bitrate-index:" + videoBitrateValue+"]";
        letsLog += " [video-bandwidth:" + videoPerceivedBandwidthValue+"]";
        letsLog += " [video-bufferLength:" + videoBufferLengthValue+"]";
        letsLog += " [video-droppedFrames:" + videoDroppedFramesCountValue+"]";

        //for audio
        var audioBitrateValue, audioPerceivedBandwidthValue, audioBufferLengthValue, audioDroppedFramesCountValue;
        if(typeof audioVideoMetrics.bitRate === 'object') //MSE + MediaElements
        {
            audioBitrateValue = audioVideoMetrics.bitRate.audio ? audioVideoMetrics.bitRate.audio : 0;
            audioPerceivedBandwidthValue = audioVideoMetrics.perceivedBandwidth.audio ? audioVideoMetrics.perceivedBandwidth.audio : 0;
            audioBufferLengthValue = audioVideoMetrics.bufferLength.audio ? audioVideoMetrics.bufferLength.audio : 0;
            audioDroppedFramesCountValue = audioVideoMetrics.droppedFramesCount.audio ? audioVideoMetrics.droppedFramesCount.audio : 0;
        }
        else //flash fallback
        {
            audioBitrateValue = audioVideoMetrics.bitRate ? audioVideoMetrics.bitRate : 0;
            audioPerceivedBandwidthValue = audioVideoMetrics.perceivedBandwidth ? audioVideoMetrics.perceivedBandwidth : 0;
            audioBufferLengthValue = audioVideoMetrics.bufferLength ? audioVideoMetrics.bufferLength : 0;
            audioDroppedFramesCountValue = audioVideoMetrics.droppedFramesCount ? audioVideoMetrics.droppedFramesCount : 0;
        }

        letsLog += " [audio-bitrate-index:" + audioBitrateValue+"]";
        letsLog += " [audio-bandwidth:" + audioPerceivedBandwidthValue+"]";
        letsLog += " [audio-bufferLength:" + audioBufferLengthValue+"]";
        letsLog += " [audio-droppedFrames:" + audioDroppedFramesCountValue+"]";
        letsLog += "\n";
    }
    console.log(letsLog);
    // if (!isOoSEnabled()) {
    //     //qosProvider.detachMediaPlayer();
    // }
}
