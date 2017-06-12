/*
	© 2016 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Overview
// Defines the Overview module (Router)
define('SerialNumberReport'
,	[
		'SerialNumberReport.Router'
	,	'underscore'
	,	'Utils'
	]
,	function(
		Router
	,	_
	)
{
	'use strict';
	
	// @class Report @extends ApplicationModule
	var SerialNumberReportModule = 
	{
		MenuItems: 
			[
				function (application)
				{
				
				return { 	
						id:  'reports'
					,	name: _('Reports').translate()
					,	index: 6
					,	children:  [
							{
								parent: 'reports'
							,	id: 'serial_number_lookup'
							,	name: _('Serial Number Lookup').translate()
							,	url: 'invoice_serial'
							,	index: 0
							}
						]
					};
				}
			]

	,	mountToApp: function (application)
		{
			// default behavior for mount to app
			return new Router(application);
		}
	};
	
	return SerialNumberReportModule;
});
