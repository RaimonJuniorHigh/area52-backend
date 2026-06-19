// ==========================================
// AREA52 ADMIN LAYOUT - HERBRUIKBARE COMPONENTEN
// Doel: Sidebar, topbar en auth-logica voor admin-pagina's (medewerkers).
// ==========================================

const AdminLayout = (() => {
    const NAV_ITEMS = [
        { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'grid' },
        { id: 'guests',    label: 'Guests',    href: '#',         icon: 'users' },
        { id: 'bookings',  label: 'Bookings',  href: '#',         icon: 'calendar' },
        { id: 'rentals',   label: 'Rentals',   href: '#',         icon: 'bike' },
        { id: 'settings',  label: 'Settings',  href: '#',         icon: 'settings' },
    ];

    const ICONS = {
        grid: '<svg class="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
        users: '<svg class="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        calendar: '<svg class="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
        bike: '<svg class="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M9 17.5h6M5.5 14V9l3-4h7l3 4v5"/></svg>',
        settings: '<svg class="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
    };

    function requireAdminAccess() {
        if (!AuthUtils.getToken()) {
            window.location.href = '/login';
            return false;
        }
        const role = AuthUtils.getRole();
        if (role === 'guest') {
            window.location.href = '/portal';
            return false;
        }
        if (role !== 'admin') {
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

        return `<aside class="admin-sidebar">
            <div class="admin-brand">
                <div class="admin-brand__logo">🌲</div>
                <span class="admin-brand__title">Area52 Admin</span>
            </div>
            <nav class="admin-nav">${links}</nav>
        </aside>`;
    }

    function renderTopbar() {
        const email = AuthUtils.getEmail() || 'Onbekend';
        return `<header class="admin-topbar">
            <span class="role-badge role-badge--admin">Admin</span>
            <button class="admin-topbar__btn" title="Notificaties" aria-label="Notificaties">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
            </button>
            <div class="admin-profile" id="admin-profile">
                <div class="admin-profile__avatar"></div>
                <span class="admin-profile__name" title="${email}">${email}</span>
                <span class="admin-profile__chevron">▼</span>
                <div class="admin-dropdown" id="admin-dropdown">
                    <button class="admin-dropdown__item" id="admin-logout">Uitloggen</button>
                </div>
            </div>
        </header>`;
    }

    function bindTopbarEvents() {
        const profile = document.getElementById('admin-profile');
        const dropdown = document.getElementById('admin-dropdown');
        if (profile && dropdown) {
            profile.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('open');
            });
            document.addEventListener('click', () => dropdown.classList.remove('open'));
        }

        const logoutBtn = document.getElementById('admin-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                AuthUtils.clearAuth();
                window.location.href = '/login';
            });
        }
    }

    function mount() {
        const shell = document.getElementById('admin-shell');
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
    }

    async function verifyApiAccess() {
        try {
            const res = await fetch('/api/admin/dashboard', {
                headers: { Authorization: `Bearer ${AuthUtils.getToken()}` },
            });
            if (res.status === 403) window.location.href = '/portal';
            else if (!res.ok) window.location.href = '/login';
        } catch {
            window.location.href = '/login';
        }
    }

    function init(options = {}) {
        if (!requireAdminAccess()) return;
        mount();
        if (options.verifyApi !== false) verifyApiAccess();
    }

    return { init };
})();
