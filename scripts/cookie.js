cat > scripts/cookie.js << 'EOF'
// show banner if not yet accepted
if (!localStorage.getItem('cookiesAccepted')) {
  document.getElementById('cookie-banner').style.display = 'block';
}
document.getElementById('accept-cookies').onclick = () => {
  localStorage.setItem('cookiesAccepted', 'true');
  document.getElementById('cookie-banner').remove();
};
<script>
  document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const toggle = document.getElementById('menu-toggle')
    const mobile = document.getElementById('mobile-menu')
    toggle.addEventListener('click', () => {
      mobile.classList.toggle('hidden')
    })
  })
</script>

EOF
