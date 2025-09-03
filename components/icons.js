//components/icons.js 
(function () {
	const { el } = window.App;
	const Icon = {
		logo: () => el('span', { 'aria-hidden': true, className: 'logo-mark' }, 'T&Co'),
		search: () => el('span', { className: 'icon', 'aria-hidden': true }, '🔎'),
		cart:   () => el('span', { className: 'icon', 'aria-hidden': true }, '🛒'),
		filter: () => el('span', { className: 'icon', 'aria-hidden': true }, '🧭'),
	};
	window.App = Object.assign(window.App || {}, { Icon });
})();
