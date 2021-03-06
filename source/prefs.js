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

var prefs =
{

defaults: {
	/* The default set of tabs (panels) is created after creating an account */
	panels:				[],
	accounts:			[],

	fontSize:			"tiny",
	theme:				!window.android ? "light" : "holo-dark",
	toolbar:			"top",
	tabs:				"bottom",

	hideAvatar:			false,
	showUserName:		true,
	showScreenName:		true,
	showVia:			false,
	showTime:			"relative",
	submitOnEnter:		false
},

ready: function(cb)
{
	if (typeof(chrome) !== "undefined" && chrome.storage) {
		/* Load all local and remote settings before continuing */
		chrome.storage.local.get(null, function(items) {
			this.local = items;

			chrome.storage.sync.get(null, function(items) {
				this.sync = items;

				cb();
			}.bind(this));
		}.bind(this));
	} else {
		/* Other storage mechanisms are already ready */
		cb();
	}
},

get: function get(name, account)
{
	var key		= name;
	var result	= null;
	var json	= null;

	if (account) {
		name += account.id;
	}

	if (typeof(chrome) !== "undefined" && chrome.storage) {
		/* Chrome storage is synced at load time */
		if ('undefined' != typeof(this.local[key])) {
			result = this.local[key];
		} else if ('undefined' != typeof(this.sync[key])) {
			result = this.sync[key];
		}
	} else if (window.localStorage) {
		json = window.localStorage.getItem(name);
	} else {
		json = enyo.getCookie(name);
	}

	if (!result) {
		try {
			if (json) {
				result = enyo.json.parse(json);
			} else {
				result = null;
			}
		} catch(e) {
			result = null;
		}
	}

	if (result == null) {
		result = this.defaults[key];
	}

	return(result);
},

set: function set(name, value, account)
{
	if (account) {
		name += account.id;
	}

	if (typeof(chrome) !== "undefined" && chrome.storage) {
		var data = {};

		data[name] = value;

		if ('undefined' != typeof(this.defaults[name])) {
			chrome.storage.sync.set(data);
			this.sync[name] = value;
		} else {
			chrome.storage.local.set(data);
			this.local[name] = value;
		}
	} else if (window.localStorage) {
		window.localStorage.setItem(name,
			enyo.json.stringify(value));
	} else {
		enyo.setCookie(name, enyo.json.stringify(value));
	}

	if ('undefined' != typeof(this.defaults[name])) {
		this.updateClasses();
	}
},

/* Add a class based on the name of each boolean option if enabled */
updateClasses: function(component)
{
	var value;
	var classes	= [];

	if (component) {
		/* Remember the component for future calls */
		this.component = component;
	} else {
		/* Use the remembered component */
		component = this.component;
	}

	if (!component) {
		return;
	}

	for (var key in this.defaults) {
		switch (typeof(this.defaults[key])) {
			case "boolean":
				if (this.get(key)) {
					classes.push(key);
				}
				break;

			case "string":
				if ((value = this.get(key))) {
					classes.push(key + enyo.cap(value));
				}
				break;
		}
	}

	component.setClasses(classes.join(' '));
	console.log('User option classes: ' + component.getClasses());

	/* Ensure that the correct theme stylesheet is loaded */
	if ((value = this.get('theme'))) {
		var head	= document.getElementsByTagName("head")[0];

		value = value.split(',');

		if (this.themeElements) {
			var e;

			while ((e = this.themeElements.pop())) {
				head.removeChild(e);
				delete e;
			}
		}
		this.themeElements = [];

		for (var i = 0, theme; theme = value[i]; i++) {
			var e = document.createElement("link");

			e.setAttribute("rel",	"stylesheet");
			e.setAttribute("type",	"text/css");
			e.setAttribute("href",	"assets/" + theme + ".css");

			head.appendChild(e);
			this.themeElements.push(e);
		}
	}
}

};
