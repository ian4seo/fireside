CustomerType = new function()
{
	$ = jQuery;

	this.vars = {
	  type: sessionStorage.getItem('customerType'), // STRING: "homeowner" or "professional"
	};

	this.init = function() {

		// Begin by checking if the customer type is in local storage
		CustomerType.setType(CustomerType.vars.type);
		CustomerType.getType();
		CustomerType.showHideCustomerTypeContent();
      
      	// If professional type, we want the homepage logo to link to the professional home page
      	let customerTypeCheck = sessionStorage.getItem('customerType');
        if(customerTypeCheck == "professional") {
          let logoLinkElement = $(".main-nav .header__logo a");
          logoLinkElement.attr("href", "/pages/for-pros");
        }

		// On header nav click set the customer type
		$('body').on('click', 'a.customer-type', function(e) {

			// Get the customer type from the data attribute
			type = $(this).data('customer-type');

			if(type != 'homeowner' && type != 'professional'){
				return;
			}

			// Prevent the anchor from navigating. may need to change this. depends on user flow.
			e.preventDefault();

			// Set the local storage item
			CustomerType.setType(type);

			// Remove the active class
			$('a.customer-type').removeClass('customer-type-active');

			// Get the local storage item to set the active class
			CustomerType.getType();
			CustomerType.showHideCustomerTypeContent();
          
            if(type == 'professional') 
				window.location.href = "/pages/for-pros";
            if (type == 'homeowner') 
              window.location.href = "/";
		});
	}

	// Check the local storage for a customer type
	this.getType = function() {
		CustomerType.vars.type = sessionStorage.getItem('customerType');
	}

	// Set the local storage for a customer type
	this.setType = function(type) {
		// If type hasn't been picked yet then default to homeowner
		if(type === null){
			type = 'homeowner';
			CustomerType.vars.type = 'homeowner';
			CustomerType.showHideCustomerTypeContent();
		}
		sessionStorage.setItem('customerType', type);
	}

	// Toggle "homeowner" vs "pro" content
	this.showHideCustomerTypeContent = function(){

		// Set active class for nav menu trigger
		$('[data-customer-type=' + CustomerType.vars.type + ']').addClass('customer-type-active');

		// Show/Hide content
		if (CustomerType.vars.type == 'homeowner') {
			$('.homeowner-content').show();
			$('.professional-content').hide();
		} else if (CustomerType.vars.type == 'professional') {
			$('.professional-content').show();
			$('.homeowner-content').hide();
		}
	}

}
jQuery(function(){CustomerType.init()});