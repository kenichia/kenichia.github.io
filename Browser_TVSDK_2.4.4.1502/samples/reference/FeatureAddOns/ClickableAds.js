ReferencePlayer.AddOns = ReferencePlayer.AddOns || {};
ReferencePlayer.AddOns.ClickableAds = function (id) {
	var buttonId = id;
	var clickAddButton = document.getElementById(buttonId);
	var getPlayer = function () {
		return playerWrapper.getPlayer();
	},
	onAdStarted	= function (event) {
		if (clickAddButton && event && event.ad) {
			var adClick = event.ad.primaryAsset && event.ad.primaryAsset.adClick;
			if (adClick && adClick.isValid) {
				var title = "Ad Click";
				if (adClick.title && adClick.title.length > 0) {
					title = adClick.title;
				}
				clickAddButton.removeAttribute('hidden');
				clickAddButton.innerText  = title;
			}
		}
	},
	onAdCompleted = function (event) {
		if (clickAddButton) {
			clickAddButton.setAttribute('hidden', 'true');
		}
	},
	onAdClickedEvent =  function (event) {
		if (event && event.ad) {
			var adClick = event.adClick;
			if (!(adClick && adClick.isValid)) {
				adClick = event.ad.primaryAsset && event.ad.primaryAsset.adClick;
			}
			if (adClick && adClick.isValid)
			{
				var player = getPlayer();
				if (player)
				{
					player.pause();
				}
				window.open(adClick.url);
			}
		}
	},
	onAdClick = function (event) {
		var player = getPlayer();
		if (player)
		{
			player.notifyClick();
		}
	},

	enableAdEvents = function () {
		
		getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.AdStartedEvent, onAdStarted);
		getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.AdCompletedEvent, onAdCompleted);
		getPlayer().addEventListener(AdobePSDK.MediaPlayer.Events.AdClickedEvent, onAdClickedEvent);
		document.getElementById(buttonId).addEventListener("click", onAdClick);
		
	};

	return {
		enableAdEvents : enableAdEvents
	};
};