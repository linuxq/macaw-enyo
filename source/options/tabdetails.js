/*
	Copyright (c) 2010, Micah N Gorrell
	All rights reserved.

	THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED
	WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
	MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
	EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
	SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
	PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
	OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
	WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
	OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
	ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
enyo.kind({

name:												"TabDetails",
classes:											"tabdetails",

events: {
	onTabsChanged:									"",
	onCloseToaster:									""
},

published: {
	tabs:											null,
	tabIndex:										-1
},

// TODO	Show a toaster/popup to create a new tab. It should have the
//		following fields.
//			- label
//			- account (allow selecting from any configured account)
//			- type
//			- type specific data (search string, list name, etc)
//			- auto refresh time (or disabled)
//			- notification options

components: [
	{
		classes:									"section",

		components: [
			{
				content:							"Account",
				classes:							"label"
			},
			{
				kind:								onyx.PickerDecorator,
				classes:							"value picker",
				components: [
					{
						classes:					"button"
					},

					{
						kind:						onyx.Picker,
						name:						"accounts",
						components: [
						]
					}
				]
			},
			{
				tag:								"br"
			},

			{
				content:							"Type",
				classes:							"label"
			},
			{
				kind:								onyx.PickerDecorator,
				classes:							"value picker",
				components: [
					{
						classes:					"button"
					},

					{
						kind:						onyx.Picker,
						name:						"types",
						components: [
						]
					}
				]
			},
			{
				tag:								"br"
			},

			{
				content:							"Refresh Every",
				classes:							"label"
			},
			{
				kind:								onyx.PickerDecorator,
				classes:							"value picker",
				components: [
					{
						classes:					"button"
					},

					{
						kind:						onyx.Picker,
						name:						"refresh",
						components: [
						]
					}
				]
			},
			{
				tag:								"br"
			},

			{
				content:							"Notifications",
				classes:							"label"
			},
			{
				kind:								onyx.ToggleButton,
				name:								"notify",
				classes:							"value"
			},
			{
				tag:								"br"
			},


			{
				kind:								onyx.Button,
				content:							"Cancel",
				ontap:								"cancel",
				classes:							"button onyx-negative cancel"
			},
			{
				kind:								onyx.Button,
				content:							"Save",
				ontap:								"save",
				classes:							"button onyx-affirmative save"
			}
		]
	}
],

create: function()
{
	var	tab = null;

	this.inherited(arguments);

	if (!this.tabs) {
		this.tabs = prefs.get('panels');
	}

	if (!isNaN(this.tabIndex)) {
		tab = this.tabs[this.tabIndex];
	} else {
		tab = null;
	}

	if (tab) {
		this.$.notify.setValue(tab.notify);
	}

	this.accounts = prefs.get('accounts');
	for (var i = 0, a; a = this.accounts[i]; i++) {
		this.$.accounts.createComponent({
			content:			'@' + a.screen_name,
			value:				a.user_id,
			active:				!tab ? (i == 0) : (a.user_id == tab.user_id)
		}, { owner: this });
	}

	var types = [
		{ content: "Home",			value: "timeline"	},
		{ content: "Mentions",		value: "mentions"	},
		{ content: "Messages",		value: "messages"	},
		{ content: "Favorites",		value: "favorites"	}
	];

	for (var i = 0, t; t = types[i]; i++) {
		if (tab) {
			t.active = t.value == tab.type;
		} else {
			t.active = i == 0;
		}

		this.$.types.createComponent(t, { owner: this });
	}

	var times = [
		{ content: "1 minute",		value: 60	},
		{ content: "5 minutes",		value: 300	},
		{ content: "15 minutes",	value: 900	},
		{ content: "30 minutes",	value: 1800 },
		{ content: "1 hour",		value: 3600 },
		{ content: "Never",			value: -1	}
	];

	for (var i = 0, t; t = times[i]; i++) {
		if (tab) {
			t.active = t.value == tab.refresh;
		} else {
			t.active = i == 0;
		}

		this.$.refresh.createComponent(t, { owner: this });
	}
},

save: function()
{
	var account;

	var tab = {
		type:		this.$.types.getSelected().value,
		user_id:	this.$.accounts.getSelected().value,
		refresh:	this.$.refresh.getSelected().value,
		notify:		this.$.notify.getValue(),
		label:		''
	};

	for (var i = 0, a; a = this.accounts[i]; i++) {
		if (tab.user_id == a.user_id) {
			account = a;
			break;
		}
	}

	if (account) {
		tab.label = '@' + account.screen_name;
	}

	switch (tab.type) {
		case "timeline":	tab.label += ' home';			break;
		case "messages":	tab.label += ' DMs';			break;
		default:			tab.label += ' ' + tab.type;	break;
	}

	if (isNaN(this.tabIndex) || !this.tabs[this.tabIndex]) {
		this.tabs.push(tab);
	} else {
		this.tabs[this.tabIndex] = tab;
	}

	prefs.set('panels', this.tabs);

	this.doTabsChanged();
	this.doCloseToaster();
},

cancel: function()
{
	this.doCloseToaster();
}

});
