//components/core.js 
(function () {
	// React global is already available via UMD scripts
	const e  = React.createElement;
	const el = (tag, props, ...children) => e(tag, props || null, ...children);

	// App-wide namespace to avoid polluting window too much
	window.App = window.App || {};
	window.App.React = React;
	window.App.ReactDOM = ReactDOM;
	window.App.e = e;
	window.App.el = el;
})();
