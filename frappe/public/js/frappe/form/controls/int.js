frappe.ui.form.ControlInt = frappe.ui.form.ControlData.extend({
	make: function () {
		this._super();
		// $(this.label_area).addClass('pull-right');
		// $(this.disp_area).addClass('text-right');
	},
	make_input: function () {
		var me = this;
		this._super();
		this.$input
			// .addClass("text-right")
			.on("focus", function () {
				setTimeout(function () {
					if (!document.activeElement) return;
					document.activeElement.value
						= me.validate(document.activeElement.value);
					document.activeElement.select();
				}, 100);
				return false;
			});
	},
<<<<<<< HEAD
	validate: function (value) {
		return this.parse(value);
	},
	eval_expression: function (value) {
=======
	eval_expression: function(value) {
>>>>>>> 57cc556de61c52f8d0600aeaae657bdf1ded8fbe
		if (typeof value === 'string') {
			if (value.match(/^[0-9+\-/* ]+$/)) {
				// If it is a string containing operators
				try {
					return eval(value);
				} catch (e) {
					// bad expression
					return value;
				}
			}
		}
		return value;
	},
	parse: function (value) {
		return cint(this.eval_expression(value), null);
	}
});
