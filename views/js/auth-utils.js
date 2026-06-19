// ==========================================
// AREA52 AUTH UTILS
// Doel: Token en rol centraal uitlezen voor login, guest- en admin-pagina's.
// ==========================================

const AuthUtils = (() => {
    function getToken() {
        return localStorage.getItem('area52_token') || localStorage.getItem('token');
    }

    function clearAuth() {
        localStorage.removeItem('area52_token');
        localStorage.removeItem('token');
    }

    function decodeToken(token) {
        try {
            const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            return JSON.parse(atob(base64));
        } catch {
            return null;
        }
    }

    function getRole() {
        const token = getToken();
        if (!token) return null;
        return decodeToken(token)?.role || null;
    }

    function getEmail() {
        const token = getToken();
        if (!token) return null;
        return decodeToken(token)?.email || null;
    }

    function homeForRole(role) {
        return role === 'admin' ? '/dashboard' : '/portal';
    }

    function requireRole(allowedRoles) {
        const role = getRole();
        if (!role || !allowedRoles.includes(role)) {
            window.location.href = role === 'admin' ? '/dashboard' : '/login';
            return false;
        }
        return true;
    }

    return { getToken, clearAuth, decodeToken, getRole, getEmail, homeForRole, requireRole };
})();
