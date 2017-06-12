{{!
	© 2016 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
}}

{{#if showBackToAccount}}
	<a href="/" class="invoice-paid-list-button-back">
		<i class="invoice-paid-list-button-back-icon"></i>
		{{translate 'Back to Account'}}
	</a>
{{/if}}

<section class="invoice-paid-list">
	<header class="invoice-paid-list-header">
		<h2 class="invoice-paid-list-title">{{pageHeader}}</h3>		
	</header>

	<div data-view="ListHeader"></div>
	
	<div class="invoice-paid-list-body">
		{{#if collectionLengthGreaterThan0}}
			
			<table class="invoice-paid-list-records">
				<thead class="invoice-paid-list-records-head">
					<tr class="invoice-paid-list-records-head-row">
						<th class="invoice-paid-list-head-invoicenumber">{{translate 'Invoice No.'}}</th>
						<th>{{translate 'Date'}}</th>
						<th>{{translate 'Amount'}}</th>
					</tr>
				</thead>
				<tbody class="invoice-paid-list-records-body" data-view="SerialNumberReport.Results"></tbody>
			</table>

		{{else}}
			<!--<p class="invoice-paid-list-no-records">
				{{translate 'You don\'t have any Invoices Paid In Full at the moment,</br> see <a href="/invoices" class="invoice-paid-list-anchor-open" >Open Invoices</a>'}}
			</p>-->
			<p class="invoice-paid-list-no-records">
				{{translate 'Your search returned no results.'}}
			</p>
		{{/if}}
	</div>
</section>