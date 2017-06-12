/*
	© 2016 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderHistory
define('SerialNumberReport.List.View'
,	[	'ItemDetails.Model'
	,	'SC.Configuration'
	,	'GlobalViews.Pagination.View'
	,	'GlobalViews.ShowingCurrent.View'
	,	'TrackingServices'
	,	'SerialNumberReport.ListHeader.View'
	,	'ReturnAuthorization.GetReturnableLines'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'RecordViews.View'
	,	'Handlebars'

	,	'serial-number-report_list.tpl'

	,	'Backbone'
	,	'underscore'
	,	'jQuery'
	]
,	function (
		ItemDetailsModel
	,	Configuration
	,	GlobalViewsPaginationView
	,	GlobalViewsShowingCurrentView
	,	TrackingServices
	,	SerialNumberListHeaderView
	,	ReturnLinesCalculator
	,	BackboneCompositeView
	,	BackboneCollectionView

	,	RecordViewsView
	,	Handlebars

	,	serial_number_report_list_tpl

	,	Backbone
	,	_
	,	jQuery
	)
{
	'use strict';

	//@class OrderHistory.List.View view list of orders @extend Backbone.View
	return  Backbone.View.extend({
		//@property {Function} template
		template: serial_number_report_list_tpl
		//@property {String} title
	,	title: _('Serial Number Lookup').translate()
		//@property {String} className
	,	className: 'SerialNumberReportListView'
		//@property {String} page_header
	,	page_header: _('Serial Number Lookup').translate()
		//@property {Object} attributes
	,	attributes: {
			'class': 'SerialNumberReportListView'
		}
		//@property {Object} events
	,	events: {
			'click [data-action="navigate"]': 'navigateToOrder'
		}
		//@method getSelectedMenu
	,	getSelectedMenu: function ()
		{
			return 'invoice_serial';
		}
		//@method getBreadcrumbPages
	,	getBreadcrumbPages: function ()
		{
			return {
					text: this.title
				,	href: '/invoice_serial'
			};
		}
		//@method initialize
	,	initialize: function (options)
		{
			this.application = options.application;
			this.collection = options.collection;
			this.isSCISIntegrationEnabled = Configuration.get('siteSettings.isSCISIntegrationEnabled', false);

			var isoDate = _.dateToString(new Date());

			this.rangeFilterOptions = {
				fromMin: '1800-01-02'
			,	fromMax: isoDate
			,	toMin: '1800-01-02'
			,	toMax: isoDate
			};

			this.listenCollection();

			// Manages sorting and filtering of the collection
			this.listHeader = new SerialNumberListHeaderView({
				view: this
			,	application: this.application
			,	collection: this.collection
			,	sorts: this.sortOptions
			,	rangeFilter: 'date'
			,	rangeFilterLabel: _('From').translate()
			,	hidePagination: true
			});

			this.showStatusFilter = options.showStatusFilter;

			BackboneCompositeView.add(this);

			this.application.getLayout().on('afterAppendView', function (){
				if (_.parseUrlOptions(Backbone.history.fragment).serialnumber && _.parseUrlOptions(Backbone.history.fragment).serialnumber != "") {
                    var searchInput = $('#serialnumber');
                    var strLength = searchInput.val().length * 2;
                    searchInput.focus();
                    searchInput[0].setSelectionRange(strLength, strLength);
                }
            });
            
		}
		//@method navigateToOrder
	,	navigateToOrder: function (e)
		{
			//ignore clicks on anchors and buttons
			if (_.isTargetActionable(e))
			{
				return;
			}

			if (!jQuery(e.target).closest('[data-type="accordion"]').length)
			{
				var order_id = jQuery(e.target).closest('[data-id]').data('id')
				,	recordtype = jQuery(e.target).closest('[data-record-type]').data('record-type');
				Backbone.history.navigate('#invoice_serial/view/' + recordtype + '/' + order_id, {trigger:true});
			}
		}
		//@method listenCollection
	,	listenCollection: function ()
		{
			this.setLoading(true);

			this.collection.on({
				request: jQuery.proxy(this, 'setLoading', true)
			,	reset: jQuery.proxy(this, 'setLoading', false)
			});
		}
		//@method setLoading
	,	setLoading: function (value)
		{
			this.isLoading = value;
		}
		//@property {Array} sortOptions
		// Array of default sort options
		// sorts only apply on the current collection
		// which might be a filtered version of the original
	,	sortOptions: [
			{
				value: 'trandate,internalid'
			,	name: _('Sort By Date').translate()
			,	selected: true
			}
		,	{
				value: 'tranid'
			,	name: _('Sort By Number').translate()
			}
		,	{
				value: 'amount'
			,	name: _('Sort By Amount').translate()
			}
		]
		//@property {Object} childViews
	,	childViews: {
			'ListHeader': function ()
			{
				return this.listHeader;
			}
		,	'GlobalViews.Pagination': function ()
			{
				return new GlobalViewsPaginationView(_.extend({
					totalPages: Math.ceil(this.collection.totalRecordsFound / this.collection.recordsPerPage)
				}, Configuration.defaultPaginationSettings));
			}
		,	'GlobalViews.ShowCurrentPage': function ()
			{
				return new GlobalViewsShowingCurrentView({
					items_per_page: this.collection.recordsPerPage
		 		,	total_items: this.collection.totalRecordsFound
				,	total_pages: Math.ceil(this.collection.totalRecordsFound / this.collection.recordsPerPage)
				});
			}
		,	'SerialNumberReport.Results': function ()
			{
					var records_collection = new Backbone.Collection(this.collection.map(function (invoice)
					{
						var model = new Backbone.Model({
							touchpoint: 'customercenter'
						,	title: new Handlebars.SafeString(_('Invoice #<span class="tranid">$(0)</span>').translate(invoice.get('tranid')))
						,	detailsURL: 'invoices/' + invoice.get('internalid')

						,	id: invoice.get('internalid')
						,	internalid: invoice.get('internalid')

						,	columns: [
								{
									label: _('Date:').translate()
								,	type: 'date'
								,	name: 'date'
								,	value: invoice.get('trandate')
								}
							,	{
									label: _('Amount:').translate()
								,	type: 'currency'
								,	name: 'amount'
								,	value: invoice.get('amount_formatted')
								}
							]

						});

						return model;
					}));

					return new BackboneCollectionView({
						childView: RecordViewsView
					,	collection: records_collection
					,	viewsPerRow: 1
					});
				}
		}

		//@method getContext @return OrderHistory.List.View.Context
	,	getContext: function ()
		{
			//@class OrderHistory.List.View.Context
			return {
				//@property {String} pageHeader
				pageHeader: this.page_header
				//@property {Boolean} collectionLengthGreaterThan0
			,	collectionLengthGreaterThan0: this.collection.length > 0
				//@property {Boolean} isLoading
			,	isLoading: this.isLoading
				// @property {Boolean} showPagination
			,	showPagination: !!(this.collection.totalRecordsFound && this.collection.recordsPerPage)
				// @property {Boolean} showCurrentPage
			,	showCurrentPage: this.options.showCurrentPage
				//@property {Boolean} showBackToAccount
			,	showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD'
				//@property {Boolean} showStatusFilter
			,	showStatusFilter: this.showStatusFilter || false
				//@property {Boolean} isSCISIntegrationEnabled
			,	isSCISIntegrationEnabled: this.isSCISIntegrationEnabled

			};
		}
	});

});