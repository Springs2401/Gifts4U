const bar = document.getElementById('bar');
const nav = document.getElementById('navbar');

if (bar && nav) {
    bar.addEventListener('click', () => {
        nav.classList.toggle('active');
        bar.textContent = nav.classList.contains('active') ? '✕' : '☰';
    });

    document.querySelectorAll('#navbar a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            bar.textContent = '☰';
        });
    });
}