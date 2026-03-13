import { UIElements } from './elements.js';

export function setupSidebarChrome() {
    const setupSidebarDrag = (sidebarId, gripId) => {
        const sidebar = UIElements.get(sidebarId);
        const sidebarGrip = UIElements.get(gripId);
        let sidebarDragging = false;
        let sidebarStartX;
        let sidebarStartY;

        if (!sidebar || !sidebarGrip) return;

        sidebarGrip.onmousedown = (e) => {
            sidebarDragging = true;
            sidebarStartX = e.clientX - sidebar.offsetLeft;
            sidebarStartY = e.clientY - sidebar.offsetTop;
            sidebar.style.transition = 'none';
        };

        window.addEventListener('mousemove', (e) => {
            if (!sidebarDragging) return;
            sidebar.style.left = `${e.clientX - sidebarStartX}px`;
            sidebar.style.top = `${e.clientY - sidebarStartY}px`;
            sidebar.style.right = 'auto';
        });

        window.addEventListener('mouseup', () => {
            if (!sidebarDragging) return;
            sidebarDragging = false;
            sidebar.style.transition = 'opacity 0.6s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        });
    };

    setupSidebarDrag('left-sidebar', 'sidebar-grip-left');
    setupSidebarDrag('right-sidebar', 'sidebar-grip-right');

    const setupSidebarClose = (sidebarId, closeBtnId) => {
        const sidebar = UIElements.get(sidebarId);
        const btn = UIElements.get(closeBtnId);
        if (!sidebar || !btn) return;
        btn.onclick = () => {
            sidebar.classList.add('hidden');
        };
    };

    setupSidebarClose('left-sidebar', 'sidebar-close-left');
    setupSidebarClose('right-sidebar', 'sidebar-close-right');
}
