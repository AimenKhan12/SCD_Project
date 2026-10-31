// landing-icons.js: landing page par logo aur icons lagata hai (app.js ke ic() aur LOGO se)

// Logo: jis element par data-logo likha ho wahan logo aata hai
document.querySelectorAll('[data-logo]').forEach(el => el.innerHTML = LOGO);

// Icons: <span data-ic="user"></span> ki jagah user icon aata hai. Size badalna ho to data-size likho
document.querySelectorAll('[data-ic]').forEach(el => el.innerHTML = ic(el.dataset.ic, Number(el.dataset.size) || 16));