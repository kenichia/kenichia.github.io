var PreRollOpportunityGenerator = function() {
	return this;
};


PreRollOpportunityGenerator.prototype = {
		constructor : PreRollOpportunityGenerator,

		configureCallbackFunc : function (item, client, mode, playhead, playbackRange) {
			var placement =  new AdobePSDK.Placement(AdobePSDK.PlacementType.PRE_ROLL, 
					playhead,
					AdobePSDK.Placement.UNKNOWN_DURATION,
					AdobePSDK.PlacementMode.DEFAULT);
			
			var opportunity =  new AdobePSDK.Opportunity("initial_opportunity", placement, item.resource.metadata, null);
			client.resolve(opportunity);
		},

		updateCallbackFunc : function(playhead, playbackRange) {
		},

		cleanupCallbackFunc : function() {
		}
};