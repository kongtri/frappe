// Copyright (c) 2019, Frappe Technologies Pvt. Ltd. and Contributors
// MIT License. See license.txt

frappe.provide('frappe.dashboards');
frappe.provide('frappe.dashboards.chart_sources');


frappe.pages['dashboard'].on_page_load = function(wrapper) {
	frappe.ui.make_app_page({
		parent: wrapper,
		title: __("Dashboard"),
		single_column: true
	});

	frappe.dashboard = new Dashboard(wrapper);
	$(wrapper).bind('show', function() {
		frappe.dashboard.show();
	});
};

class Dashboard {
	constructor(wrapper) {
		this.wrapper = $(wrapper);
		$(`<div class="dashboard" style="overflow-y: hidden">
			<div class="dashboard-graph"></div>
		</div>`).appendTo(this.wrapper.find(".page-content").empty());
		this.container = this.wrapper.find(".dashboard-graph");
		this.page = wrapper.page;
	}

	show() {
		this.route = frappe.get_route();
		if (this.route.length > 1) {
			// from route
			this.show_dashboard(this.route.slice(-1)[0]);
		} else {
			// last opened
			if (frappe.last_dashboard) {
				frappe.set_route('dashboard', frappe.last_dashboard);
			} else {
				// default dashboard
				frappe.db.get_list('Dashboard', {filters: {is_default: 1}}).then(data => {
					if (data && data.length) {
						frappe.set_route('dashboard', data[0].name);
					} else {
						// no default, get the latest one
						frappe.db.get_list('Dashboard', {limit: 1}).then(data => {
							if (data && data.length) {
								frappe.set_route('dashboard', data[0].name);
							} else {
								// create a new dashboard!
								frappe.new_doc('Dashboard');
							}
						});
					}
				});
			}
		}
	}

	show_dashboard(current_dashboard_name) {
		if (this.dashboard_name !== current_dashboard_name) {
			this.dashboard_name = current_dashboard_name;
			let title = this.dashboard_name;
			if (!this.dashboard_name.toLowerCase().includes(__('dashboard'))) {
				// ensure dashboard title has "dashboard"
				title = __('{0} Dashboard', [title]);
			}
			this.page.set_title(title);
			this.set_dropdown();
			this.container.empty();
			this.refresh();
		}
		this.charts = {};
		frappe.last_dashboard = current_dashboard_name;
	}

	refresh() {
<<<<<<< HEAD
		frappe.run_serially([
			() => this.render_cards(),
			() => this.render_charts()
		]);
	}

	render_charts() {
		return this.get_permitted_items(
			'frappe.desk.doctype.dashboard.dashboard.get_permitted_charts'
		).then(charts => {
			if (!charts.length) {
				frappe.msgprint(__('No Permitted Charts on this Dashboard'), __('No Permitted Charts'))
			}
=======
		this.get_dashboard_doc().then((doc) => {
			this.dashboard_doc = doc;
			this.charts = this.dashboard_doc.charts;
			this.chart_objects = [];
>>>>>>> 57cc556de61c52f8d0600aeaae657bdf1ded8fbe

			frappe.dashboard_utils.get_dashboard_settings().then((settings) => {
				let chart_config = settings.chart_config? JSON.parse(settings.chart_config): {};
				this.charts =
					charts.map(chart => {
						return {
							chart_name: chart.chart,
							label: chart.chart,
							chart_settings: chart_config[chart.chart] || {},
							...chart
						}
					});

<<<<<<< HEAD
				this.chart_group = new frappe.widget.WidgetGroup({
					title: null,
					container: this.container,
					type: "chart",
					columns: 2,
					options: {
						allow_sorting: false,
						allow_create: false,
						allow_delete: false,
						allow_hiding: false,
						allow_edit: false,
					},
					widgets: this.charts,
				});
			})
		});
	}

	render_cards() {
		return this.get_permitted_items(
			'frappe.desk.doctype.dashboard.dashboard.get_permitted_cards'
		).then(cards => {
			if (!cards.length) {
				return;
=======
				frappe.model.with_doc("Dashboard Chart", chart.chart).then( chart_doc => {
					let dashboard_chart = new DashboardChart(chart_doc, chart_container);
					this.chart_objects.push(dashboard_chart);
					dashboard_chart.show();
				});
			});
		});
	}

	get_dashboard_doc() {
		return frappe.model.with_doc('Dashboard', this.dashboard_name);
	}

	set_dropdown() {
		this.page.clear_menu();

		this.page.add_menu_item(__('Edit'), () => {
			frappe.set_route('Form', 'Dashboard', frappe.dashboard.dashboard_name);
		});

		this.page.add_menu_item(__('New'), () => {
			frappe.new_doc('Dashboard');
		});

		this.page.add_menu_item(__('Refresh All'), () => {
			this.chart_objects.forEach(chart => {
				chart.refresh(true);
			});
		});

		frappe.db.get_list("Dashboard").then(dashboards => {
			dashboards.map(dashboard => {
				let name = dashboard.name;
				if(name != this.dashboard_name){
					this.page.add_menu_item(name, () => frappe.set_route("dashboard", name), 1);
				}
			});
		});
	}
}

class DashboardChart {
	constructor(chart_doc, chart_container) {
		this.chart_doc = chart_doc;
		this.container = chart_container;
	}

	show() {
		this.get_settings().then(() => {
			this.prepare_chart_object();
			this.prepare_container();
			this.prepare_chart_actions();
			this.refresh();
		});
	}

	refresh(refresh_data) {
		this.fetch(this.filters, refresh_data).then(data => {
			this.update_chart_object();
			this.data = data;
			this.render();
		});
	}

	prepare_container() {
		const column_width_map = {
			"Half": "6",
			"Full": "12",
		};
		let columns = column_width_map[this.chart_doc.width];
		this.chart_container = $(`<div class="col-sm-${columns} chart-column-container">
			<div class="chart-wrapper">
				<div class="chart-loading-state text-muted">${__("Loading...")}</div>
				<div class="chart-empty-state hide text-muted">${__("No Data")}</div>
			</div>
		</div>`);
		this.chart_container.appendTo(this.container);

		let last_synced_text = $(`<span class="text-muted last-synced-text"></span>`);
		last_synced_text.prependTo(this.chart_container);
	}

	prepare_chart_actions() {
		let actions = [
			{
				label: __("Refresh"),
				action: 'action-refresh',
				handler: () => {
					this.refresh(true);
				}
			},
			{
				label: __("Edit..."),
				action: 'action-edit',
				handler: () => {
					frappe.set_route('Form', 'Dashboard Chart', this.chart_doc.name);
				}
>>>>>>> 57cc556de61c52f8d0600aeaae657bdf1ded8fbe
			}

			this.number_cards =
				cards.map(card => {
					return {
						name: card.card,
					};
				});

			this.number_card_group = new frappe.widget.WidgetGroup({
				container: this.container,
				type: "number_card",
				columns: 3,
				options: {
					allow_sorting: false,
					allow_create: false,
					allow_delete: false,
					allow_hiding: false,
					allow_edit: false,
				},
				widgets: this.number_cards,
			});
		});
	}

	get_permitted_items(method) {
		return frappe.xcall(
			method,
			{
				dashboard_name: this.dashboard_name
			}
		).then(items => {
			return items;
		});
	}

	set_dropdown() {
		this.page.clear_menu();

		this.page.add_menu_item(__('Edit'), () => {
			frappe.set_route('Form', 'Dashboard', frappe.dashboard.dashboard_name);
		});

		this.page.add_menu_item(__('New'), () => {
			frappe.new_doc('Dashboard');
		});

		this.page.add_menu_item(__('Refresh All'), () => {
			this.chart_group &&
				this.chart_group.widgets_list.forEach(chart => chart.refresh());
			this.number_card_group &&
				this.number_card_group.widgets_list.forEach(card => card.render_card());
		});

		frappe.db.get_list('Dashboard').then(dashboards => {
			dashboards.map(dashboard => {
				let name = dashboard.name;
				if(name != this.dashboard_name){
					this.page.add_menu_item(name, () => frappe.set_route("dashboard", name), 1);
				}
			});
		});
	}
}
