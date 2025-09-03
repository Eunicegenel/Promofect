//components/Header.js 
(function () {
	const { el, Icon } = window.App;

	function Header({ cartCount }) {
		return el('header', { className: 'header' },
			el('div', { className: 'brand' },
				el(Icon.logo),
				el('div', null,
					el('h1', { className: 'brand-title' }, 'Thread & Co.'),
					el('p',  { className: 'brand-sub'   }, 'Everyday essentials, thoughtfully made')
				)
			),
			el('div', { className: 'search' },
				el('label', { className: 'visually-hidden', htmlFor: 'search' }, 'Search'),
				el('input', { id: 'search', className: 'search-input', placeholder: 'Search clothing, sizes, colors…', type: 'search' }),
				el('button', { className: 'btn ghost', type: 'button', title: 'Search' }, el(Icon.search))
			)
		);
	}

	window.App = Object.assign(window.App || {}, { Header });
})();
