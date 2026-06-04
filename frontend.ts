const navHome = document.getElementById('nav-home') as HTMLAnchorElement;
const navFiets = document.getElementById('nav-fiets') as HTMLAnchorElement;
const navEnt = document.getElementById('nav-ent') as HTMLAnchorElement;
const navData = document.getElementById('nav-data') as HTMLAnchorElement;

const mainContent = document.getElementById('main-content') as HTMLDivElement;

// Regelt de visuele feedback in de navbar en maakt de container leeg
function updateActiveNav(activeElement: HTMLAnchorElement) {
    const links = [navHome, navFiets, navEnt, navData];
    links.forEach(link => link.classList.remove('active'));
    activeElement.classList.add('active');

    // Maakt de container leeg zodat de gekozen module fris kan inladen
    mainContent.innerHTML = ''; 
}

// Event listeners
navHome.addEventListener('click', (e) => {
    e.preventDefault();
    updateActiveNav(navHome);
    // Hier kan de developer voor het dashboard zijn code laden
});

navFiets.addEventListener('click', (e) => {
    e.preventDefault();
    updateActiveNav(navFiets);
    // Hier laadt de fietsverhuur developer zijn interface in
});

navEnt.addEventListener('click', (e) => {
    e.preventDefault();
    updateActiveNav(navEnt);
    // Hier laadt de entertainment developer zijn interface in
});

navData.addEventListener('click', (e) => {
    e.preventDefault();
    updateActiveNav(navData);
    // Hier laadt de data/logging developer zijn interface in
});