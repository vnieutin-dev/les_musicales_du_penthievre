async function loadPartial(id, file) {
    const el = document.getElementById(id);
    const response = await fetch(file);
    const html = await response.text();
    el.innerHTML = html;
}

loadPartial("header", "partials/header.html");
loadPartial("footer", "partials/footer.html");