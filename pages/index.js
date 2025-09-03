//pages/index.js
(function () {
	const { el, ReactDOM, Header, Sidebar } = window.App;

	function App() {
		const [cart] = React.useState([]);
		return el('div', { className: 'app' },
			el(Header, { cartCount: cart.length }),
			el(Sidebar),
			// Page-specific content goes here...
			el('main', { className: 'content' }, 
				el('h2', null, 'Welcome to Dashboard')
			)
		);
	}

	const root = ReactDOM.createRoot(document.getElementById('root'));
	root.render(el(App));
})();
