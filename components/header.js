//components/Header.js 
(function () {
	const { el, Icon } = window.App;

	function Header({ cartCount }) {
		return el('header', { className: 'header' },
			el('div', { className: 'brand' },
				el(Icon.logo),
				el('div', null,
					el('h1', { className: 'brand-title' }, 'PROMOFECT'),
					el('p',  { className: 'brand-sub'   }, 'Promote your Brand in Perfect Style')
				)
			),
		);
	}

	window.App = Object.assign(window.App || {}, { Header });
})();
