/**
 * Include header and footer
 */
async function loadPartial(id, file) {
    const el = document.getElementById(id);
    const response = await fetch(file);
    const html = await response.text();
    el.outerHTML = html;
}

loadPartial("footer", "partials/footer.html");
loadPartial("header", "partials/header.html").then(() => {
    /**
     * Mobile menu logic
     */
    
    const header = document.querySelector("header");
    const menuToggle = document.getElementById("menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");
    const body = document.querySelector("body");
    
    const hamburgerMenuIconUrl = "https://cdn-icons-png.flaticon.com/512/2976/2976215.png";
    const closeMenuIconUrl = "https://cdn-icons-png.flaticon.com/512/1828/1828778.png";
    
    let toggled = false;
    
    menuToggle.addEventListener("click", () => {
        toggled = !toggled;
        mobileMenu.classList.toggle("active");
        body.classList.toggle("no-scroll");
        header.classList.toggle("deployed");
        menuToggle.src = toggled ? closeMenuIconUrl : hamburgerMenuIconUrl;
    });
});

