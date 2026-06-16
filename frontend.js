"use strict";

// ==========================================
// AREA52 NAVIGATIE LOGICA
// ==========================================
const navHome = document.getElementById('nav-home');
const navFiets = document.getElementById('nav-fiets');
const navEnt = document.getElementById('nav-ent');
const navData = document.getElementById('nav-data');
const mainContent = document.getElementById('main-content');

// Regelt de visuele feedback in de navbar en maakt de container leeg
function updateActiveNav(activeElement) {
    const links = [navHome, navFiets, navEnt, navData];
    links.forEach(link => link.classList.remove('active'));
    activeElement.classList.add('active');
    
    // Let op: Voor deze testfase commenten we dit even uit, 
    // anders verdwijnen je inlogformulieren zodra je op een knop klikt!
    // mainContent.innerHTML = ''; 
}

// Event listeners voor het menu
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


// ==========================================
// AREA52 AUTHENTICATIE LOGICA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

    // --- REGISTRATIE LOGICA ---
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Voorkom dat de pagina herlaadt
            
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const messageBox = document.getElementById('register-message');

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, role: 'admin' })
                });

                const data = await response.json();

                if (response.status === 201) {
                    messageBox.style.color = 'green';
                    messageBox.innerText = "Succesvol! Je kunt nu inloggen.";
                } else {
                    messageBox.style.color = 'red';
                    messageBox.innerText = data.message || "Er ging iets mis.";
                }
            } catch (error) {
                messageBox.style.color = 'red';
                messageBox.innerText = "Fout bij verbinden met de server.";
            }
        });
    }

    // --- LOGIN LOGICA ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const messageBox = document.getElementById('login-message');

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.status === 200) {
                    messageBox.style.color = 'green';
                    messageBox.innerText = "Ingelogd! JWT Token succesvol ontvangen.";
                    
                    // Sla het pasje op in de browser
                    localStorage.setItem('area52_token', data.token);
                    console.log("Token opgeslagen:", data.token);
                } else {
                    messageBox.style.color = 'red';
                    messageBox.innerText = data.message || "Inloggen mislukt.";
                }
            } catch (error) {
                messageBox.style.color = 'red';
                messageBox.innerText = "Fout bij inloggen.";
            }
        });
    }
});