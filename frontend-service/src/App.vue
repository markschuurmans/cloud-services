<script setup>
import { computed, onMounted, reactive, ref } from 'vue';

const token = ref(localStorage.getItem('token') || '');
const message = ref('');
const error = ref('');
const loading = ref(false);
const competitions = ref([]);
const profile = ref(null);
const ranking = ref([]);
const health = reactive({
  auth: null,
  register: null,
  target: null,
  score: null,
  clock: null,
  mail: null,
  read: null
});

const authForm = reactive({
  mode: 'login',
  email: '',
  password: '',
  displayName: '',
  role: 'participant'
});

const competitionForm = reactive({
  title: '',
  description: '',
  deadline: ''
});

const rankingCompetitionId = ref('');

const isAuthenticated = computed(() => token.value.length > 0);

async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token.value) {
    headers.Authorization = `Bearer ${token.value}`;
  }

  const response = await fetch(path, {
    ...options,
    headers
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const details = payload?.message || payload?.error || response.statusText;
    throw new Error(details);
  }

  return payload;
}

function persistToken(newToken) {
  token.value = newToken;
  if (newToken) {
    localStorage.setItem('token', newToken);
  } else {
    localStorage.removeItem('token');
  }
}

async function submitAuth() {
  loading.value = true;
  message.value = '';
  error.value = '';

  try {
    if (authForm.mode === 'register') {
      await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password,
          displayName: authForm.displayName,
          role: authForm.role
        })
      });
      message.value = 'Gebruiker geregistreerd. Log nu in.';
      authForm.mode = 'login';
      return;
    }

    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: authForm.email,
        password: authForm.password
      })
    });

    persistToken(data.token || '');
    message.value = 'Ingelogd.';
    await refreshProfile();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

function logout() {
  persistToken('');
  profile.value = null;
  message.value = 'Uitgelogd.';
}

async function refreshProfile() {
  if (!isAuthenticated.value) {
    profile.value = null;
    return;
  }

  try {
    profile.value = await api('/api/auth/profile');
  } catch (err) {
    error.value = err.message;
  }
}

async function refreshCompetitions() {
  error.value = '';
  try {
    competitions.value = await api('/api/register/competitions');
  } catch (err) {
    error.value = err.message;
  }
}

async function createCompetition() {
  loading.value = true;
  message.value = '';
  error.value = '';

  try {
    await api('/api/register/competitions', {
      method: 'POST',
      body: JSON.stringify({ ...competitionForm })
    });

    competitionForm.title = '';
    competitionForm.description = '';
    competitionForm.deadline = '';

    message.value = 'Competitie aangemaakt.';
    await refreshCompetitions();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function registerForCompetition(id) {
  loading.value = true;
  message.value = '';
  error.value = '';

  try {
    await api(`/api/register/competitions/${id}/register`, {
      method: 'POST'
    });
    message.value = 'Inschrijving gelukt.';
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function fetchRanking() {
  if (!rankingCompetitionId.value) {
    return;
  }

  loading.value = true;
  ranking.value = [];
  error.value = '';

  try {
    ranking.value = await api(`/api/score/scores/ranking/${rankingCompetitionId.value}`);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function checkServiceHealth() {
  const checks = [
    ['auth', '/api/auth/login'],
    ['register', '/api/register/competitions'],
    ['target', '/api/target/targets'],
    ['score', '/api/score/scores/ranking/unknown-id'],
    ['clock', '/api/clock/status'],
    ['mail', '/api/mail/registration'],
    ['read', '/api/read/competitions/active']
  ];

  await Promise.all(
    checks.map(async ([name, path]) => {
      try {
        const res = await fetch(path, { method: 'GET' });
        health[name] = res.status < 500;
      } catch {
        health[name] = false;
      }
    })
  );
}

onMounted(async () => {
  await Promise.all([refreshCompetitions(), refreshProfile(), checkServiceHealth()]);
});
</script>

<template>
  <main>
    <h1>Photo Prestiges Frontend</h1>
    <p class="small">
      Deze Vue app praat met alle microservices via uniforme frontend-routes
      (`/api/auth`, `/api/register`, `/api/target`, `/api/score`, `/api/clock`, `/api/mail`, `/api/read`).
    </p>

    <p v-if="message">{{ message }}</p>
    <p v-if="error" class="error">{{ error }}</p>

    <section class="container">
      <article class="card">
        <h2>Authenticatie</h2>
        <form @submit.prevent="submitAuth">
          <select v-model="authForm.mode">
            <option value="login">Inloggen</option>
            <option value="register">Registreren</option>
          </select>
          <input v-model="authForm.email" type="email" placeholder="E-mail" required />
          <input v-model="authForm.password" type="password" placeholder="Wachtwoord" required />
          <input
            v-if="authForm.mode === 'register'"
            v-model="authForm.displayName"
            type="text"
            placeholder="Display name"
            required
          />
          <select v-if="authForm.mode === 'register'" v-model="authForm.role">
            <option value="participant">participant</option>
            <option value="owner">owner</option>
          </select>
          <div class="actions">
            <button type="submit" :disabled="loading">Verstuur</button>
            <button type="button" @click="logout" :disabled="!isAuthenticated">Uitloggen</button>
          </div>
        </form>
      </article>

      <article class="card">
        <h2>Mijn profiel</h2>
        <div v-if="profile?.user">
          <p><strong>ID:</strong> {{ profile.user.id || profile.user._id }}</p>
          <p><strong>E-mail:</strong> {{ profile.user.email }}</p>
          <p><strong>Rol:</strong> {{ profile.user.role }}</p>
        </div>
        <p v-else class="small">Log in om profielgegevens te zien.</p>
        <button @click="refreshProfile" :disabled="!isAuthenticated || loading">Ververs profiel</button>
      </article>

      <article class="card">
        <h2>Service status</h2>
        <div>
          <span :class="['badge', health.auth ? 'badge-ok' : 'badge-down']">auth</span>
          <span :class="['badge', health.register ? 'badge-ok' : 'badge-down']">register</span>
          <span :class="['badge', health.target ? 'badge-ok' : 'badge-down']">target</span>
          <span :class="['badge', health.score ? 'badge-ok' : 'badge-down']">score</span>
          <span :class="['badge', health.clock ? 'badge-ok' : 'badge-down']">clock</span>
          <span :class="['badge', health.mail ? 'badge-ok' : 'badge-down']">mail</span>
          <span :class="['badge', health.read ? 'badge-ok' : 'badge-down']">read</span>
        </div>
        <p class="small">Groen betekent bereikbaar (geen 5xx response).</p>
        <button @click="checkServiceHealth" :disabled="loading">Check opnieuw</button>
      </article>

      <article class="card">
        <h2>Competities</h2>
        <div class="actions">
          <button @click="refreshCompetitions" :disabled="loading">Ververs lijst</button>
        </div>
        <ul class="list" v-if="competitions.length">
          <li v-for="competition in competitions" :key="competition._id">
            <strong>{{ competition.title }}</strong>
            <p class="small">{{ competition.description }}</p>
            <p class="small">Status: {{ competition.status }}</p>
            <p class="small">Deadline: {{ competition.deadline }}</p>
            <button
              @click="registerForCompetition(competition._id)"
              :disabled="loading || !isAuthenticated"
            >
              Inschrijven
            </button>
          </li>
        </ul>
        <p v-else class="small">Geen competities gevonden.</p>
      </article>

      <article class="card">
        <h2>Competitie aanmaken (owner)</h2>
        <form @submit.prevent="createCompetition">
          <input v-model="competitionForm.title" type="text" placeholder="Titel" required />
          <textarea v-model="competitionForm.description" placeholder="Beschrijving" required />
          <input v-model="competitionForm.deadline" type="datetime-local" required />
          <button type="submit" :disabled="!isAuthenticated || loading">Aanmaken</button>
        </form>
        <p class="small">De backend controleert of de ingelogde gebruiker owner is.</p>
      </article>

      <article class="card">
        <h2>Ranking ophalen</h2>
        <form @submit.prevent="fetchRanking">
          <input
            v-model="rankingCompetitionId"
            type="text"
            placeholder="Competition ID"
            required
          />
          <button type="submit" :disabled="loading">Ophalen</button>
        </form>
        <ul class="list" v-if="ranking.length">
          <li v-for="item in ranking" :key="item._id || item.submissionId">
            <strong>{{ item.displayName || item.userId || 'Onbekend' }}</strong>
            <p class="small">Score: {{ item.score }}</p>
          </li>
        </ul>
        <p v-else class="small">Nog geen rankingdata geladen.</p>
      </article>
    </section>
  </main>
</template>

