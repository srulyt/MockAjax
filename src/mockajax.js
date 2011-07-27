/*
options = {
	callback: function,
	responseStatus: "success", "error", undefined = no response callback
	responseData: {},
	wait: milliseconds to pretend async,
	triggerCallbacks: bool,
	triggerGlobals: bool
}
*/
MockAjax = (function($, undefined){
	var originalAjax = $.ajax;
	var defaultMockOptions = {
		responseStatus: "success",
		wait: 50,
		triggerCallbacks: true,
		triggerGlobals: true //not implemented yet
	};
	
	function createMockedAjax(mockOptions){
		//new 1.5 signature TODO create and return promise
		$.ajax = function(url, options){
			var scopedOptions = $.extend({}, defaultMockOptions, mockOptions);
			if(typeof url === "object"){
				options = url;
				url = undefined;
			}
			var s = jQuery.ajaxSetup( {}, options );
			
			if(scopedOptions.callback && $.isFunction(scopedOptions.callback)){
				var callbackResponse = scopedOptions.callback(options);
				if(typeof callbackResponse !== "undefined"){
					if(callbackResponse.status && typeof callbackResponse.data !== "undefined"){
						scopedOptions.responseStatus = callbackResponse.status;
						scopedOptions.reponseData = callbackResponse.data;
					}
					else
					{
						scopedOptions.responseData = callbackResponse;
					}
				}
			}
			
			function doResponse(){
				if(!scopedOptions.triggerCallbacks){
					return;
				}
				if(scopedOptions.responseStatus && options[scopedOptions.responseStatus] && $.isFunction(options[scopedOptions.responseStatus])){
					options[scopedOptions.responseStatus].call(s, scopedOptions.responseData);
				}
				
				if(options.complete && $.isFunction(options.complete)){
					options.complete.call(s, scopedOptions.responseStatus, scopedOptions.responseData);
				}
			}
			
			if(options.async){
				setTimeout(doResponse, scopedOptions.wait);
			}
			else{
				doResponse();
			}

		};
	};
	
	
	return {
		mock: function(options){
			createMockedAjax(options);
		},
		reset: function(){
			$.ajax = originalAjax;
		}
	};
})(jQuery);