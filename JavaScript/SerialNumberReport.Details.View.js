/*
	© 2016 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Report
define('SerialNumberReport.Details.View'
,	[
		'Backbone.CollectionView'
	,	'Backbone.CompositeView'
	,	'SC.Configuration'
	,	'Transaction.Collection'
	,	'serial-number-report_details.tpl'
	,	'Backbone'
	,	'underscore'
	,	'jQuery'
	,	'Tracker'
	,	'LiveOrder.Model'
	,	'bignumber'
	,	'Utils'
	]
,	function (
		BackboneCollectionView
	,	BackboneCompositeView
	,	Configuration
	,	TransactionCollection
	,	serial_number_report_details_tpl
	,	Backbone
	,	_
	,	jQuery
	,	Tracker
	,	LiveOrderModel
	,	BigNumber
	,	Utils
	)
{
	'use strict';

	//@class OrderHistory.Details.View @extend Backbone.View
	return Backbone.View.extend({

		//@property {Function} template
		template: serial_number_report_details_tpl

		//@property {String} title
	,	title: _('Invoice Details').translate()

		//@property {String} page_header
	,	page_header: _('Invoice Details').translate()

		//@property {Object} attributes
	,	attributes: {
			'class': 'SerialNumberReportDetailsView'
		}

		//@property {Object} events
	,	events: {
		}

		//@method getReturnAuthorizations
	,	getReturnAuthorizations: function ()
		{
			var return_authorizations = this.model.get('returnauthorizations')
			,	total_lines = 0;

			return_authorizations.each(function (return_authorization)
			{
				total_lines += return_authorization.get('lines') ? return_authorization.get('lines').length : 0;
			});

			return_authorizations.totalLines = total_lines;

			return return_authorizations;
		}

		//@method getRecipts
	,	getRecipts: function()
		{
			
			if (!this.receipts)
			{
				var receipts_lines = _.values(this.model.get('receipts').models);
				this.receipts = new TransactionCollection();

				if (receipts_lines.length)
				{
					this.receipts.add(receipts_lines);
				}
			}
			return this.receipts;
		}

		//@method isAnyLinePurchasable
	,	getPayments: function()
		{
			return _.where(this.model.get('adjustments'), {recordtype: 'customerpayment'});
		}
	,	getCreditMemos: function()
		{
			return _.where(this.model.get('adjustments'), {recordtype: 'creditmemo'});
		}
	,	getDepositApplications: function()
		{
			return _.where(this.model.get('adjustments'), {recordtype: 'depositapplication'});
		}
		//@method getSelectedMenu
	,	getSelectedMenu: function ()
		{
			return 'invoices';
		}
		//@method getBreadcrumbPages
	,	getBreadcrumbPages: function ()
		{
			return [
				{
						text: _('Invoices').translate()
					,	href: '/invoices'
				}
			, 	{
						text: '#' + this.model.get('tranid')
					,	href :'/invoices/view/' + this.model.get('recordtype') + '/' + this.model.get('id')
				}
			];
		}

		//@method render
	,	render: function ()
		{
			this.paymentmethod = this.model.get('paymentmethods') && this.model.get('paymentmethods').findWhere({primary: true});
			this.billaddress = this.model.get('addresses').get(this.model.get('billaddress'));
			this.shipaddress = this.model.get('addresses').get(this.model.get('shipaddress'));

			Backbone.View.prototype.render.apply(this, arguments);
		}
		//@method initialize
	,	initialize: function (options)
		{
			this.application = options.application;

			this.is_basic = !!this.application.getConfig('isBasic');

			var self = this;

			this.model.on('change:cancel_response', function (model, response_code)
			{
				var message = ''
				,	type = '';

				if (!!response_code)
				{
					if (response_code === 'ERR_ALREADY_APPROVED_STATUS')
					{
						message = _('You cannot cancel this order because it has already been approved.').translate();
						type = 'error';
					}
					else if (response_code === 'ERR_ALREADY_CANCELLED_STATUS')
					{
						message = _('This order has already been cancelled.').translate();
						type = 'warning';
					}
					else if (response_code === 'OK')
					{
						message = _('The order was successfully cancelled.').translate();
						type = 'success';
					}

					if (message && type)
					{
						self.once('afterViewRender', function()	
						{
							this.showError(message, type, true);
						});
					}
				}
			});

			BackboneCompositeView.add(this);
		}



		//@property {Object} childViews
	,	childViews: {
		

		}

		//@method getContext @returns OrderHistory.Details.View.Context
	,	getContext: function()
		{
			this.isInStore = this.model.get('origin') === Configuration.transactionRecordOriginMapping.inStore.origin;

			this.accordionLimit = Configuration.accordionCollapseLimit;

			this.non_shippable_lines = this.getNonShippableLines();
			this.in_store_lines = this.getInStoreLines();

			var return_authorizations = this.getReturnAuthorizations()			
			,	order_ship_method = this.model.get('shipmethod')
			,	delivery_method_name = ''
			,	status = this.model.get('status');

			if (order_ship_method && this.model.get('shipmethods')._byId[order_ship_method])
			{
				delivery_method_name = this.model.get('shipmethods')._byId[order_ship_method].getFormattedShipmethod();
			}
			else if (order_ship_method && order_ship_method.name)
			{
				delivery_method_name = order_ship_method.name;
			}

			//@class OrderHistory.Details.View.Context
			return {
					//@property {OrderHistory.Model} model
					model : this.model
					//@property {Boolean} showNonShippableItems
				,	showNonShippableLines: !!this.non_shippable_lines.length
					//@property {Boolean} showNonShippableLinesAccordion
				,	showNonShippableLinesAccordion: this.non_shippable_lines.length > this.accordionLimit
					//@property {Array} nonShippableItems
				,	nonShippableLines: this.non_shippable_lines
					//@property {Boolean} nonShippableItemsLengthGreaterThan1
				,	nonShippableLinesLengthGreaterThan1: this.non_shippable_lines.length > 1
					//@property {Boolean} showNonShippableItems
				,	showInStoreLines: !!this.in_store_lines.length
					//@property {Boolean} showInStoreLinesAccordion
				,	showInStoreLinesAccordion: this.in_store_lines.length > this.accordionLimit
					//@property {Array} nonShippableItems
				,	inStoreItems: this.in_store_lines
					//@property {Boolean} nonShippableItemsLengthGreaterThan1
				,	inStoreLinesLengthGreaterThan1: this.in_store_lines.length > 1
					//@property {OrderLine.Collection} lines
				,	lines: this.model.get('lines')
					//@property {Boolean} collapseElements
				,	collapseElements: this.application.getConfig('collapseElements')
					//@property {Address.Model} billAddress
				,	showBillAddress: !!this.billaddress
					//@property {Boolean} showOrderShipAddress
				,	showOrderShipAddress: !!this.model.get('shipaddress')
					//@property {Address.Model} orderShipaddress
				,	orderShipaddress: this.model.get('shipaddress') ? this.model.get('addresses').get(this.model.get('shipaddress')) : null
					//@property {Boolean} showReturnAuthorizations
				,	showReturnAuthorizations: !!return_authorizations.length
					//@property {Object} returnAuthorizations
				,	returnAuthorizations: return_authorizations
					//@property {String} deliveryMethodName
				,	deliveryMethodName: delivery_method_name || ''
					//@property {Boolean} showDeliveryMethod
				,	showDeliveryMethod: !!delivery_method_name
					//@property {Boolean} isInStore
				,	isInStore: this.isInStore
					//@property {Boolean} showPaymentMethod
				,	showPaymentMethod: !this.getPayments().length
					//@property {Boolean} initiallyCollapsed
				,	initiallyCollapsed: (_.isPhoneDevice()) ? '' : 'in'
					//@property {Boolean} initiallyCollapsedArrow
				,	initiallyCollapsedArrow: (_.isPhoneDevice()) ? 'collapsed' : ''
					//@property {String} originName
				,	originName: _.findWhere(_.values(Configuration.transactionRecordOriginMapping), {origin: this.model.get('origin')}).name
					//@property {String} title
				,	title: _.findWhere(_.values(Configuration.transactionRecordOriginMapping), {origin: this.model.get('origin')}).detailedName
					//@property {Boolean} showPaymentEventFail
				,	showPaymentEventFail: this.model.get('paymentevent').holdreason === 'FORWARD_REQUESTED' && status.internalid !== 'cancelled' && status.internalid !== 'closed'
			};
		}

	});

});
