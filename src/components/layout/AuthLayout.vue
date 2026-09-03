<template>
  <main class="auth-shell">
    <section class="auth-showcase">
      <div class="showcase-mark"><i></i></div>

      <div class="showcase-copy">
        <p class="overline">OmniNotify</p>
        <h1>
          Notifications that<br />
          <em>move business forward.</em>
        </h1>
        <p>
          Manage every customer alert, delivery channel, and event from one
          calm workspace.
        </p>
      </div>

      <div class="quote-card">
        <span class="quote-mark">“</span>
        <p>
          OmniNotify gives our team the clarity to deliver the right message at
          the right time.
        </p>
        <strong>Operations team</strong>
        <small>OmniNotify workspace</small>
      </div>
    </section>

    <section class="auth-panel">
      <div class="auth-form-wrap">
        <div class="auth-heading">
          <p v-if="overline" class="overline">{{ overline }}</p>
          <h2>{{ title }}</h2>
          <p v-if="subtitle">{{ subtitle }}</p>
        </div>

        <slot />
      </div>
    </section>
  </main>
</template>

<script setup>
defineProps({
  overline: {
    type: String,
    default: 'OmniNotify',
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.auth-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #f7f7fb;
  color: #141827;
}

.auth-showcase {
  position: relative;
  overflow: hidden;
  padding: clamp(40px, 7vw, 100px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(145deg, #f1edff, #fff 58%);
}

.auth-showcase::before,
.auth-showcase::after {
  content: "";
  position: absolute;
  border: 1px solid #ddd4ff;
  border-radius: 50%;
  opacity: 0.8;
}

.auth-showcase::before {
  width: 680px;
  height: 680px;
  right: -250px;
  top: -220px;
}

.auth-showcase::after {
  width: 520px;
  height: 520px;
  left: -260px;
  bottom: -250px;
}

.showcase-mark {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(145deg, #a77bff, #6430df);
  box-shadow: 0 10px 25px #8458ec55;
}

.showcase-mark::before,
.showcase-mark::after,
.showcase-mark i {
  content: "";
  position: absolute;
  background: #fff;
  border-radius: 3px;
  transform: skewY(-20deg);
}

.showcase-mark::before,
.showcase-mark::after {
  width: 25px;
  height: 7px;
  left: 11px;
}

.showcase-mark::before {
  top: 15px;
}

.showcase-mark::after {
  top: 27px;
}

.showcase-mark i {
  width: 12px;
  height: 7px;
  left: 11px;
  top: 27px;
  background: #8b5cf6;
}

.showcase-copy,
.quote-card {
  position: relative;
  z-index: 1;
  max-width: 560px;
}

.overline {
  color: #7650df;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.showcase-copy h1 {
  margin: 22px 0;
  color: #171a27;
  font-size: clamp(38px, 4.5vw, 64px);
  line-height: 1.05;
  letter-spacing: -0.055em;
}

.showcase-copy h1 em {
  color: #7950e9;
  font-style: normal;
}

.showcase-copy > p:last-child {
  max-width: 420px;
  color: #697086;
  font-size: 18px;
  line-height: 1.65;
}

.quote-card {
  padding: 26px 30px;
  border: 1px solid #eceaf5;
  border-radius: 18px;
  background: #fffffff0;
  box-shadow: 0 20px 50px #4d3b9412;
}

.quote-mark {
  color: #8053ed;
  font-size: 40px;
  line-height: 0.5;
}

.quote-card p {
  margin: 14px 0 20px;
  font-size: 17px;
  line-height: 1.55;
}

.quote-card strong,
.quote-card small {
  display: block;
}

.quote-card small {
  margin-top: 4px;
  color: #8a91a3;
}

.auth-panel {
  display: grid;
  place-items: center;
  padding: 40px 28px;
  background: #fff;
}

.auth-form-wrap {
  width: min(100%, 440px);
}

.auth-heading h2 {
  margin: 12px 0 8px;
  font-size: 34px;
  letter-spacing: -0.04em;
}

.auth-heading > p:last-child {
  color: #778096;
}

@media (max-width: 800px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .auth-showcase {
    display: none;
  }

  .auth-panel {
    min-height: 100vh;
    padding: 28px 20px;
  }

  .auth-heading h2 {
    font-size: 30px;
  }
}
</style>
