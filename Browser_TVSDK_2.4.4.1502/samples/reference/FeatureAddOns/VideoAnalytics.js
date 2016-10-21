ReferencePlayer.AddOns = ReferencePlayer.AddOns || {};
ReferencePlayer.AddOns.VideoAnalytics = function () {

	var getPlayer = function () {
		return playerWrapper.getPlayer();
	},

	enableVideoAnalytics = function () {
		
	}
	
	return {
		enableVideoAnalytics : enableVideoAnalytics
	};
};