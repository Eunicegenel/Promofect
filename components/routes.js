//components/routes.js 
(function () {
  const routes = {
    dashboard: 'index.html',
    computationPage: 'computationPage.html',
    manualComputationPage: 'manualComputationPage.html',
  };

  const categories = [
    { id: 'dashboard',       name: 'Dashboard' },
    { id: 'computationPage', name: 'Computation Page' },
    { id: 'manualComputationPage', name: 'Manual Computation Page' },
  ];

  function currentFile() {
    const last = location.pathname.split('/').pop();
    return last && last.length ? last : 'index.html';
  }

  function getActiveCat() {
    const file = currentFile();
    const match = Object.entries(routes).find(([_, href]) => href === file);
    return match ? match[0] : 'dashboard';
  }

  window.App = Object.assign(window.App || {}, {
    routes, categories, getActiveCat, currentFile
  });
})();
