// ==========================================
// AREA52 GUEST LAYOUT
// Doel: Beveiligde shell voor gasten (parkbezoekers) — geen admin-toegang.
// ==========================================

const GuestLayout = (() => {
    const NAV_ITEMS = [
        { id: 'portal', label: 'Overzicht', href: '/portal', icon: 'home' },
    ];

    const ICONS = {
        home: '<svg class="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z"/></svg>',
    };

    function requireGuestAccess() {
        if (!AuthUtils.getToken()) {
            window.location.href = '/login';
            return false;
        }
        const role = AuthUtils.getRole();
        if (role === 'admin') {
            window.location.href = '/dashboard';
            return false;
        }
        if (role !== 'guest') {
            window.location.href = '/login';
            return false;
        }
        return true;
    }

    function renderSidebar(activePage) {
        const links = NAV_ITEMS.map(item => {
            const active = item.id === activePage ? ' active' : '';
            return `<a href="${item.href}" class="admin-nav__link${active}" data-nav="${item.id}">
                ${ICONS[item.icon]}${item.label}
            </a>`;
        }).join('');

        return `<aside class="admin-sidebar guest-sidebar">
            <div class="admin-brand">
                <div class="admin-brand__logo">🌲</div>
                <span class="admin-brand__title">Area52</span>
            </div>
            <nav class="admin-nav">${links}</nav>
        </aside>`;
    }

    function renderTopbar() {
        const email = AuthUtils.getEmail() || 'Onbekend';
        return `<header class="admin-topbar">
            <span class="role-badge role-badge--guest">Gast</span>
            <div class="admin-profile" id="guest-profile">
                <div class="admin-profile__avatar"></div>
                <span class="admin-profile__name" title="${email}">${email}</span>
                <span class="admin-profile__chevron">▼</span>
                <div class="admin-dropdown" id="guest-dropdown">
                    <button class="admin-dropdown__item" id="guest-logout">Uitloggen</button>
                </div>
            </div>
        </header>`;
    }

    function bindTopbarEvents() {
        const profile = document.getElementById('guest-profile');
        const dropdown = document.getElementById('guest-dropdown');
        if (profile && dropdown) {
            profile.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('open');
            });
            document.addEventListener('click', () => dropdown.classList.remove('open'));
        }

        const logoutBtn = document.getElementById('guest-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                AuthUtils.clearAuth();
                window.location.href = '/login';
            });
        }
    }

    function mount() {
        const shell = document.getElementById('guest-shell');
        if (!shell) return;

        const activePage = document.body.dataset.page || '';
        const contentEl = shell.querySelector('.admin-content');
        if (!contentEl) return;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = renderSidebar(activePage) + `<div class="admin-main">${renderTopbar()}</div>`;

        const sidebar = wrapper.querySelector('.admin-sidebar');
        const main = wrapper.querySelector('.admin-main');
        main.appendChild(contentEl);

        shell.innerHTML = '';
        shell.appendChild(sidebar);
        shell.appendChild(main);

        bindTopbarEvents();

        const intro = shell.querySelector('.guest-intro');
        if (intro) {
            const email = AuthUtils.getEmail();
            intro.textContent = email
                ? `Ingelogd als ${email} (gast)`
                : 'Ingelogd als gast';
        }
    }

    async function verifyApiAccess() {
        try {
            const res = await fetch('/api/guest/portal', {
                headers: { Authorization: `Bearer ${AuthUtils.getToken()}` },
            });
            if (res.status === 403) window.location.href = '/dashboard';
            else if (!res.ok) window.location.href = '/login';
        } catch {
            window.location.href = '/login';
        }
    }

    function init(options = {}) {
        if (!requireGuestAccess()) return;
        mount();
        if (options.verifyApi !== false) verifyApiAccess();
    }

    return { init };
})();
