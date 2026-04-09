/* ========================================
   AENDRA — Auth (Login / Registro)
   ======================================== */

const Auth = (() => {

  // ---- DOM helpers ----
  const modal   = () => document.getElementById('auth-modal');
  const overlay = () => document.getElementById('auth-overlay');

  function open(tab = 'login') {
    modal().classList.add('open');
    overlay().classList.add('open');
    document.body.style.overflow = 'hidden';
    switchTab(tab);
  }

  function close() {
    modal().classList.remove('open');
    overlay().classList.remove('open');
    document.body.style.overflow = '';
    clearErrors();
  }

  function switchTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t =>
      t.classList.toggle('active', t.dataset.tab === tab));
    document.querySelectorAll('.auth-form').forEach(f =>
      f.classList.toggle('active', f.id === `form-${tab}`));
    clearErrors();
  }

  function clearErrors() {
    document.querySelectorAll('.auth-error').forEach(e => e.textContent = '');
  }

  function setError(formId, msg) {
    const el = document.querySelector(`#form-${formId} .auth-error`);
    if (el) el.textContent = msg;
  }

  function setLoading(btn, loading) {
    btn.disabled = loading;
    btn.textContent = loading ? 'Procesando...' : btn.dataset.label;
  }

  // ---- Supabase Auth ----
  async function login(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  }

  async function register(name, email, password, phone) {
    // 1. Create auth user
    const { data, error } = await sb.auth.signUp({ email, password });
    if (error) throw error;
    const user = data.user;

    // 2. Insert into clientes
    await sb.from('clientes').insert({
      auth_user_id: user.id,
      name,
      email,
      phone: phone || null
    });

    return user;
  }

  async function logout() {
    await sb.auth.signOut();
    updateNavUI(null);
    Cart.clear();
  }

  // ---- UI update after auth ----
  function updateNavUI(user) {
    const btnLogin  = document.getElementById('nav-login-btn');
    const btnUser   = document.getElementById('nav-user-btn');
    const userName  = document.getElementById('nav-user-name');

    if (user) {
      btnLogin.style.display  = 'none';
      btnUser.style.display   = 'flex';
      // get name from clientes table
      sb.from('clientes').select('name').eq('auth_user_id', user.id).single()
        .then(({ data }) => {
          if (data) userName.textContent = data.name.split(' ')[0];
        });
    } else {
      btnLogin.style.display  = 'inline-flex';
      btnUser.style.display   = 'none';
    }
  }

  // ---- Event listeners ----
  function init() {
    // overlay click closes
    overlay()?.addEventListener('click', close);

    // tab switch
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // LOGIN form
    document.getElementById('form-login')?.addEventListener('submit', async e => {
      e.preventDefault();
      const btn   = e.target.querySelector('button[type=submit]');
      const email = e.target.email.value.trim();
      const pass  = e.target.password.value;
      setLoading(btn, true);
      try {
        const user = await login(email, pass);
        updateNavUI(user);
        close();
        showToast('Bienvenida de vuelta 🤍');
      } catch (err) {
        setError('login', err.message === 'Invalid login credentials'
          ? 'Email o contraseña incorrectos.'
          : err.message);
      } finally {
        setLoading(btn, false);
      }
    });

    // REGISTER form
    document.getElementById('form-register')?.addEventListener('submit', async e => {
      e.preventDefault();
      const btn   = e.target.querySelector('button[type=submit]');
      const name  = e.target.fullname.value.trim();
      const email = e.target.email.value.trim();
      const pass  = e.target.password.value;
      const phone = e.target.phone.value.trim();

      if (pass.length < 6) {
        setError('register', 'La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      setLoading(btn, true);
      try {
        await register(name, email, pass, phone);
        close();
        showToast('Cuenta creada. Revisa tu email para confirmar 📩');
      } catch (err) {
        setError('register', err.message);
      } finally {
        setLoading(btn, false);
      }
    });

    // logout btn
    document.getElementById('nav-logout-btn')?.addEventListener('click', async () => {
      await logout();
      showToast('Sesion cerrada');
    });

    // Check session on load
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session) updateNavUI(session.user);
    });

    // Listen to auth changes
    sb.auth.onAuthStateChange((_event, session) => {
      updateNavUI(session?.user || null);
    });
  }

  return { open, close, init, updateNavUI };
})();
