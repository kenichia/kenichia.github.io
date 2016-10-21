/*************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2015 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

(function() {

var _adWatchedPolicy,
	_adBreakPolicy,
	_adSeekPolicy;

CustomAdPolicySelector = function(adWatchedPolicy, adBreakPolicy, adSeekPolicy) {
	"use strict";
	_adWatchedPolicy = adWatchedPolicy;
	_adBreakPolicy = adBreakPolicy;
	_adSeekPolicy = adSeekPolicy;
	return this;
};

CustomAdPolicySelector.prototype =
{
	constructor: CustomAdPolicySelector,

	selectPolicyForAdBreakCallbackFunc : function(adPolicyInfo) {
		return _adBreakPolicy;
	},

	selectWatchedPolicyForAdBreakCallbackFunc : function(adPolicyInfo) {
		return _adWatchedPolicy;
	},

	selectPolicyForSeekIntoAdCallbackFunc : function (adPolicyInfo) {
		return _adSeekPolicy;
    },

    selectAdBreaksToPlayCallbackFunc : function (adPolicyInfo) {
		var adBreakTimeLineItems = adPolicyInfo.adBreakTimelineItems;
		var newAdBreakTimelineItems = [];
		if (adBreakTimeLineItems && adBreakTimeLineItems.length > 0) {
            var size = adBreakTimeLineItems.length;
			if (size > 0 && adPolicyInfo.currentTime <= adPolicyInfo.seekToTime) {
            	var adBreakTimeLineItem = adBreakTimeLineItems[size - 1];
				var startTime = adBreakTimeLineItem.time / 1000;
				if (startTime < adPolicyInfo.seekToTime && !adBreakTimeLineItem.isWatched) {
					newAdBreakTimelineItems.push(adBreakTimeLineItem);
				}
			}
		}
		return newAdBreakTimelineItems;
	}
};

})();
