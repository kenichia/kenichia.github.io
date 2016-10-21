ReferencePlayer.AddOns = ReferencePlayer.AddOns || {};
ReferencePlayer.AddOns.Ads = function () {
	var videoDiv = playerWrapper.getVideoDiv(),
		adRow = videoDiv.querySelector("#ad-row"),
		adRemainingTime = videoDiv.querySelector("#ad-remaining-time"),
		adProgressElm = videoDiv.querySelector("#ad-progress"),
		adBackerElm = videoDiv.querySelector("#ad-backer"),
		getPlayer = function () {
			return playerWrapper.getPlayer();
		},

		onAdbreakStarted = function (){
			playerWrapper.setControlsDisabledInAd (true);
			console.log("onAdBreakStartedEvent");
		},

		onAdbreakCompleted = function (){
			playerWrapper.setControlsDisabledInAd (false);
			console.log("onAdBreakCompletedEvent");
		},

		onAdStarted = function (){
			if(adRemainingTime && adProgressElm)
			{
				adRemainingTime.innerHTML = "Ad";
				adProgressElm.style.width = "0px";
			}
			playerWrapper.setControlsDisabledInAd (true);
			console.log("onAdStartedEvent");
		},

		onAdProgress = function (event){
			if(adRow && adRemainingTime && adBackerElm && adProgressElm)
			{
				if(adRow.hasAttribute("hidden"))
					adRow.removeAttribute("hidden");
				var duration = 1000*Math.round(event.ad.duration/1000);
				var time = 1000*Math.round(event.time/1000);
			    var formatted_time = ReferencePlayer.AddOns.PlayerControls.formatDisplayTime(duration-time, duration);
		        adRemainingTime.innerHTML = "Ad &nbsp;"+formatted_time;
		        var bounds = adBackerElm.getBoundingClientRect();
		        var pos = (event.progress/100) * (bounds.right - bounds.left);
		        adProgressElm.style.width = (pos).toString() + "px";
		    }
	        console.log("onAdProgressEvent = " + event.progress);
	    },

		onAdCompleted = function (){
			if(adRow)
		    	adRow.setAttribute("hidden",true);
			playerWrapper.setControlsDisabledInAd (false);
			console.log("onAdCompletedEvent");
		},

		enableAdEvents = function () {
			getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.AdBreakStartedEvent, onAdbreakStarted);
			getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.AdBreakCompletedEvent, onAdbreakCompleted);
			getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.AdStartedEvent, onAdStarted);
			getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.AdProgressEvent, onAdProgress);
			getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.AdCompletedEvent, onAdCompleted);
		}
		return {
			enableAdEvents : enableAdEvents
		};
};