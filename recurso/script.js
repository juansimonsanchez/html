document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.dropdown').forEach(dd => {
        const btn = dd.querySelector('.dropbtn');
        const content = dd.querySelector('.dropdown-content');
        if (btn && content) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = content.style.display === 'block';
                document.querySelectorAll('.dropdown-content').forEach(c => c.style.display = 'none');
                document.querySelectorAll('.dropbtn').forEach(b => b.classList.remove('active'));
                if (!isOpen) {
                    content.style.display = 'block';
                    btn.classList.add('active');
                }
            });
        }
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-content').forEach(c => c.style.display = '');
        document.querySelectorAll('.dropbtn').forEach(b => b.classList.remove('active'));
    });

    // Controlador universal de clics en enlaces ancla (#...)
    document.querySelectorAll('a[href*="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const rawHref = this.getAttribute('href') || '';
            const hashIdx = rawHref.indexOf('#');
            if (hashIdx === -1) return;
            const hash = rawHref.substring(hashIdx + 1);
            if (!hash) return;
            
            let targetId = hash;
            try { targetId = decodeURIComponent(hash); } catch(err) {}

            let targetEl = document.getElementById(targetId) || document.querySelector('[name="' + targetId + '"]');
            if (!targetEl) {
                for (let el of document.querySelectorAll('[id]')) {
                    if (el.id === targetId || decodeURIComponent(el.id) === targetId) {
                        targetEl = el;
                        break;
                    }
                }
            }

            if (targetEl) {
                e.preventDefault();
                const headerOffset = 75;
                const elementPosition = targetEl.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                if (history.pushState) {
                    history.pushState(null, null, '#' + targetId);
                }
            }
        });
    });
});

function copyCode(btn) {
    const code = btn.nextElementSibling ? btn.nextElementSibling.innerText : '';
    navigator.clipboard.writeText(code).then(() => {
        const orig = btn.innerText;
        btn.innerText = '✅ ¡Copiado!';
        btn.style.background = '#16a34a';
        setTimeout(() => {
            btn.innerText = orig;
            btn.style.background = '#334155';
        }, 2000);
    });
}