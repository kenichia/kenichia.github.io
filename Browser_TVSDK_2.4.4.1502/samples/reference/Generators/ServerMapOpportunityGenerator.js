var ServerMapOpportunityGenerator = function(metadata) {
    this.metadata = metadata;
	return this;
};


ServerMapOpportunityGenerator.prototype = {
		constructor : ServerMapOpportunityGenerator,

		configureCallbackFunc : function (item, client, mode, playhead, playbackRange) {
			var placement =  new AdobePSDK.Placement(AdobePSDK.PlacementType.SERVER_MAP,
                    AdobePSDK.Placement.UNKNOWN_POSITION,
					AdobePSDK.Placement.UNKNOWN_DURATION,
					AdobePSDK.PlacementMode.DEFAULT);

        var opportunity = new AdobePSDK.Opportunity(
            "initial_opportunity", placement, this.metadata, null);

            client.resolve(opportunity);
		},

    updateCallbackFunc: function(playhead, playbackRange) {},

    cleanupCallbackFunc: function() {}
};
