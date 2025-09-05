// /components/icons.js
(function () {
  const { el } = window.App;

  // helper: load an <img> pointing to your local SVG
  const svg = (name, label) =>
    el("img", {
      src: `./assets/icons/${name}.svg`,
      alt: label || name,
      className: "icon-svg",
      "aria-hidden": !label
    });

  const Icon = {
    logo: () =>
      el("img", {
        src: "./assets/logo.png",   // already offline
        alt: "Promofect Logo",
        className: "",
      }),
		dashboard: () => svg("dashboard", "Dashboard"),
		calculator: () => svg("calculator", "Calculator"),
		scale: () => svg("scale", "Manual Computation"),
  };

  window.App = Object.assign(window.App || {}, { Icon });
})();
