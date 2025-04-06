if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const pathname = window.location.pathname;
    if (pathname.includes('/edit/')) {
      const id = pathname.split('/edit/')[1].replace(/\/$/, '');
      window.history.replaceState({}, '', '/');
      setTimeout(() => {
        window.history.pushState({}, '', /edit/);
      }, 100);
    }
  });
}