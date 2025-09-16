/* script.js
   Plain vanilla JS — easy to explain to judges.
   Handles:
   - mobile drawer open/close
   - floating chatbot open/close
   - chat demo replies (fake / explainable)
   - active nav highlighting
   - simple swipe for features on mobile
*/

// Import firebaseConfig from separate file
// Make sure firebaseConfig.js is loaded before this script in HTML
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

document.addEventListener('DOMContentLoaded', function () {
  // AUTH: Register
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const name = document.getElementById('registerName').value.trim();
      const email = document.getElementById('registerEmail').value.trim();
      const phone = document.getElementById('registerPhone').value.trim();
      const password = document.getElementById('registerPassword').value;
      try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName: name });
        // Save user data to Realtime Database
        await db.ref('users/' + userCredential.user.uid).set({
          name: name,
          email: email,
          phone: phone,
          provider: 'email',
          createdAt: new Date().toISOString()
        });
        window.location.href = "index.html";
      } catch (error) {
        document.getElementById('registerError').innerText = error.message;
      }
    });
    // Google Register
    document.getElementById('googleRegisterBtn')?.addEventListener('click', async () => {
      const googleProvider = new firebase.auth.GoogleAuthProvider();
      try {
        const result = await auth.signInWithPopup(googleProvider);
        const user = result.user;
        // Save user data to Realtime Database
        await db.ref('users/' + user.uid).set({
          name: user.displayName || '',
          email: user.email || '',
          phone: user.phoneNumber || '',
          provider: 'google',
          createdAt: new Date().toISOString()
        });
        window.location.href = "index.html";
      } catch (error) {
        document.getElementById('registerError').innerText = error.message;
      }
    });
  }

  // AUTH: Login
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      try {
        await auth.signInWithEmailAndPassword(email, password);
        window.location.href = "index.html";
      } catch (error) {
        document.getElementById('loginError').innerText = error.message;
      }
    });
    // Google Login
    document.getElementById('googleLoginBtn')?.addEventListener('click', async () => {
      const googleProvider = new firebase.auth.GoogleAuthProvider();
      try {
        await auth.signInWithPopup(googleProvider);
        window.location.href = "index.html";
      } catch (error) {
        document.getElementById('loginError').innerText = error.message;
      }
    });
  }
  // show year in footer
  const yearEls = document.querySelectorAll('#year');
  yearEls.forEach(el => el.textContent = new Date().getFullYear());

  // NAV: mobile drawer
  const mobileMenuBtns = document.querySelectorAll('#mobileMenuBtn');
  const drawer = document.getElementById('mobileDrawer');
  const closeDrawer = document.getElementById('closeDrawer');
  mobileMenuBtns.forEach(btn => btn && btn.addEventListener('click', () => drawer.classList.add('open')));
  closeDrawer && closeDrawer.addEventListener('click', () => drawer.classList.remove('open'));

  // NAV: mark active link using body data-page
  const cur = document.body.getAttribute('data-page');
  const navLinks = document.querySelectorAll('.main-nav a');
  navLinks.forEach(a => {
    if (a.getAttribute('href') && a.getAttribute('href').includes(cur)) a.classList.add('active');
  });

  // CHATBOT: floating
  const botBtn = document.getElementById('botBtn');
  const chatWindow = document.getElementById('chatWindow');
  const closeChat = document.getElementById('closeChat');
  if (botBtn) botBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('open');
    chatWindow.setAttribute('aria-hidden', chatWindow.classList.contains('open') ? 'false' : 'true');
  });
  if (closeChat) closeChat.addEventListener('click', ()=> {
    chatWindow.classList.remove('open');
    chatWindow.setAttribute('aria-hidden','true');
  });

  // CHAT: shared chat form behavior (floating)
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatBody = document.getElementById('chatBody');
  if (chatForm) {
    chatForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const txt = chatInput.value && chatInput.value.trim();
      if (!txt) return;
      const u = document.createElement('div');
      u.className = 'user-msg';
      u.textContent = txt;
      chatBody.appendChild(u);
      chatInput.value = '';
      // fake reply (explainable)
      setTimeout(() => {
        const r = document.createElement('div');
        r.className = 'bot-msg';
        r.textContent = 'Suggestion: Explore STEM streams → Check Career Roadmap → Visit College Hub.';
        chatBody.appendChild(r);
        chatBody.scrollTop = chatBody.scrollHeight;
      }, 600);
    });
  }

  // CHAT DEMO (on chatbot.html) — larger chat area
  const chatDemoForm = document.getElementById('chatDemoForm');
  const chatDemo = document.getElementById('chatDemo');
  if (chatDemoForm && chatDemo) {
    chatDemoForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = document.getElementById('chatDemoInput');
      const text = input.value && input.value.trim();
      if (!text) return;
      const um = document.createElement('div'); um.className = 'user-msg'; um.textContent = text;
      chatDemo.appendChild(um);
      input.value = '';
      setTimeout(()=> {
        const bm = document.createElement('div'); bm.className = 'bot-msg';
        // Simple deterministic mapping — easy to explain to judges.
        if (/pcm|physics|math/i.test(text)) {
          bm.textContent = 'You might like: Aeronautical / Mechanical / CS (PCM paths).';
        } else if (/pcb|bio|biology/i.test(text)) {
          bm.textContent = 'You might like: Medicine, Biotechnology, Pharmacy.';
        } else if (/design|art|creative/i.test(text)) {
          bm.textContent = 'You might like: UI/UX, Product Design, Architecture.';
        } else {
          bm.textContent = 'Try typing a stream (PCM/PCB) or interest (Design) for targeted suggestions.';
        }
        chatDemo.appendChild(bm);
        chatDemo.scrollTop = chatDemo.scrollHeight;
      }, 700);
    });
  }

  // CONTACT: simple form submit (no backend) — show friendly message (explainable)
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      // read fields (explainable): no network calls
      const name = document.getElementById('cname').value.trim();
      const email = document.getElementById('cemail').value.trim();
      const msg = document.getElementById('cmsg').value.trim();
      alert('Message received —\\nName: ' + name + '\\nEmail: ' + email + '\\n(For demo, we just simulate send.)');
      contactForm.reset();
    });
  }

  // FEATURES: mobile swipe support (basic) — explains event handling
  const fg = document.getElementById('featuresGrid');
  if (fg) {
    let startX=0, isDown=false, scrollLeft=0;
    fg.addEventListener('touchstart', (e)=> { isDown=true; startX = e.touches[0].pageX - fg.offsetLeft; scrollLeft = fg.scrollLeft }, {passive:true});
    fg.addEventListener('touchmove', (e)=> { if(!isDown) return; const x = e.touches[0].pageX - fg.offsetLeft; fg.scrollLeft = scrollLeft + (startX - x) }, {passive:true});
    fg.addEventListener('touchend', ()=> isDown=false);
    // mouse drag for desktop convenience
    fg.addEventListener('mousedown', (e)=> { isDown=true; startX=e.pageX - fg.offsetLeft; scrollLeft=fg.scrollLeft; fg.classList.add('dragging')});
    fg.addEventListener('mouseup', ()=> { isDown=false; fg.classList.remove('dragging')});
    fg.addEventListener('mouseleave', ()=> { isDown=false; fg.classList.remove('dragging')});
    fg.addEventListener('mousemove', (e)=> { if(!isDown) return; const x=e.pageX - fg.offsetLeft; fg.scrollLeft = scrollLeft + (startX - x) });
  }
});




