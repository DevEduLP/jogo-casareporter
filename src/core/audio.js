// audio.js — todo o som é sintetizado em tempo real com a Web Audio API.
// Nenhum arquivo de áudio: o jogo permanece leve, offline e sem licenças.
// Além disso, sons sintetizados são *paramétricos* — o mesmo rangido pode
// ficar mais grave e mais lento conforme a realidade se degrada.

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.ready = false;
    this.master = null;
    this.buses = {};
    this.noiseBuffer = null;
    this._ambient = null;
    this._loops = new Map();
    this.volumes = { master: 0.85, ambient: 0.9, sfx: 1.0, voice: 1.0, music: 0.7 };
  }

  /** Deve ser chamado a partir de um gesto do usuário (política de autoplay). */
  init() {
    if (this.ready) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    const ctx = this.ctx;

    this.master = ctx.createGain();
    this.master.gain.value = this.volumes.master;

    // Compressor no master: impede que um rangido próximo estoure quando o
    // ambiente já está tocando. Mantém o silêncio realmente silencioso.
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 12;
    comp.ratio.value = 4;
    comp.attack.value = 0.004;
    comp.release.value = 0.25;
    this.master.connect(comp);
    comp.connect(ctx.destination);

    for (const bus of ['ambient', 'sfx', 'voice', 'music']) {
      const g = ctx.createGain();
      g.gain.value = this.volumes[bus];
      g.connect(this.master);
      this.buses[bus] = g;
    }

    // Reverb curto por convolução — dá à casa um "tamanho" audível.
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this._makeImpulse(1.9, 2.6);
    this.reverbSend = ctx.createGain();
    this.reverbSend.gain.value = 0.24;
    this.reverbSend.connect(this.reverb);
    this.reverb.connect(this.master);

    this.noiseBuffer = this._makeNoise(4);
    this.ready = true;
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  setVolume(bus, value) {
    this.volumes[bus] = value;
    if (!this.ready) return;
    if (bus === 'master') this.master.gain.value = value;
    else if (this.buses[bus]) this.buses[bus].gain.value = value;
  }

  /* ------------------------------ utilidades ----------------------------- */

  _makeNoise(seconds) {
    const ctx = this.ctx;
    const len = ctx.sampleRate * seconds;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  _makeImpulse(duration, decay) {
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * duration);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }

  _noiseSource(loop = true) {
    const s = this.ctx.createBufferSource();
    s.buffer = this.noiseBuffer;
    s.loop = loop;
    return s;
  }

  _env(gain, t0, attack, hold, release, peak) {
    const g = gain.gain;
    g.cancelScheduledValues(t0);
    g.setValueAtTime(0.0001, t0);
    g.exponentialRampToValueAtTime(Math.max(peak, 0.0001), t0 + attack);
    g.setValueAtTime(Math.max(peak, 0.0001), t0 + attack + hold);
    g.exponentialRampToValueAtTime(0.0001, t0 + attack + hold + release);
  }

  /** Atenuação simples por distância — som posicional "suficientemente bom". */
  _spatialGain(distance) {
    if (distance === undefined) return 1;
    return Math.max(0, Math.min(1, 1 / (1 + distance * distance * 0.06)));
  }

  /* ------------------------------- ambiente ------------------------------ */

  /**
   * Camada de fundo contínua: vento fora, drone dentro. Muda de caráter com
   * o estado de realidade — quanto mais alto, mais grave e mais "presente".
   */
  startAmbient(preset = 'outside') {
    if (!this.ready) return;
    this.stopAmbient();
    const ctx = this.ctx;
    const out = ctx.createGain();
    out.gain.value = 0;
    out.connect(this.buses.ambient);

    // Vento: ruído rosa filtrado, com o corte em movimento lento.
    const wind = this._noiseSource();
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = preset === 'outside' ? 420 : 240;
    windFilter.Q.value = 0.7;
    const windGain = ctx.createGain();
    windGain.gain.value = preset === 'outside' ? 0.30 : 0.10;
    wind.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(out);
    wind.start();

    // LFO no filtro: rajadas.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = preset === 'outside' ? 210 : 90;
    lfo.connect(lfoGain);
    lfoGain.connect(windFilter.frequency);
    lfo.start();

    // Drone: duas ondas dente-de-serra levemente desafinadas, bem graves.
    // Quase inaudível de forma consciente; sentida no peito.
    const droneGain = ctx.createGain();
    droneGain.gain.value = preset === 'outside' ? 0.030 : 0.055;
    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    oscA.type = 'sawtooth'; oscB.type = 'sawtooth';
    oscA.frequency.value = 47.5;
    oscB.frequency.value = 48.6; // batimento de ~1.1 Hz: inquietação
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 180;
    oscA.connect(droneFilter); oscB.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(out);
    oscA.start(); oscB.start();

    out.gain.linearRampToValueAtTime(1, ctx.currentTime + 3.5);

    this._ambient = { out, wind, lfo, oscA, oscB, windFilter, droneFilter, windGain, droneGain, preset };
  }

  stopAmbient(fade = 1.5) {
    if (!this._ambient) return;
    const a = this._ambient;
    const t = this.ctx.currentTime;
    a.out.gain.cancelScheduledValues(t);
    a.out.gain.setValueAtTime(a.out.gain.value, t);
    a.out.gain.linearRampToValueAtTime(0, t + fade);
    setTimeout(() => {
      try { a.wind.stop(); a.lfo.stop(); a.oscA.stop(); a.oscB.stop(); } catch (e) { /* já parado */ }
    }, fade * 1000 + 120);
    this._ambient = null;
  }

  /** Reflete o Sistema de Realidade no som: o drone desce, o vento fecha. */
  setRealityLevel(level) {
    if (!this._ambient) return;
    const t = this.ctx.currentTime;
    const a = this._ambient;
    const k = Math.min(level, 5) / 5;
    a.oscA.frequency.linearRampToValueAtTime(47.5 - k * 12, t + 4);
    a.oscB.frequency.linearRampToValueAtTime(48.6 - k * 11.2, t + 4);
    a.droneGain.gain.linearRampToValueAtTime(0.05 + k * 0.075, t + 4);
    a.windFilter.frequency.linearRampToValueAtTime(240 - k * 90, t + 4);
  }

  /* -------------------------------- efeitos ------------------------------ */

  /** Passo. `surface` muda o filtro; `run` altera energia e brilho. */
  footstep(surface = 'wood', run = false) {
    if (!this.ready) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const src = this._noiseSource(false);
    src.playbackRate.value = 0.8 + Math.random() * 0.5;
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    const cfg = {
      wood: { type: 'bandpass', freq: 380, q: 1.1, peak: 0.30, rel: 0.16 },
      tile: { type: 'bandpass', freq: 1500, q: 2.4, peak: 0.22, rel: 0.12 },
      grass: { type: 'lowpass', freq: 900, q: 0.7, peak: 0.16, rel: 0.20 },
      concrete: { type: 'bandpass', freq: 700, q: 1.6, peak: 0.24, rel: 0.13 },
      dirt: { type: 'lowpass', freq: 520, q: 0.6, peak: 0.18, rel: 0.22 },
    }[surface] || { type: 'bandpass', freq: 380, q: 1.1, peak: 0.3, rel: 0.16 };

    filter.type = cfg.type;
    filter.frequency.value = cfg.freq * (0.85 + Math.random() * 0.3);
    filter.Q.value = cfg.q;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.buses.sfx);
    gain.connect(this.reverbSend);
    this._env(gain, t, 0.004, 0.01, cfg.rel, cfg.peak * (run ? 1.35 : 1));

    // Componente grave: o peso do corpo na estrutura da casa.
    const thump = ctx.createOscillator();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(90 + Math.random() * 20, t);
    thump.frequency.exponentialRampToValueAtTime(42, t + 0.09);
    const tg = ctx.createGain();
    thump.connect(tg);
    tg.connect(this.buses.sfx);
    this._env(tg, t, 0.005, 0.01, 0.10, 0.11 * (run ? 1.3 : 1));
    thump.start(t); thump.stop(t + 0.25);

    src.start(t);
    src.stop(t + 0.4);
  }

  /** Rangido de madeira: a casa se acomodando. Ou não. */
  creak(distance = 4, intensity = 1) {
    if (!this.ready) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const dur = 0.5 + Math.random() * 1.4;
    const src = this._noiseSource(false);
    src.playbackRate.value = 0.15 + Math.random() * 0.2;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 14 + Math.random() * 16;
    const base = 130 + Math.random() * 260;
    f.frequency.setValueAtTime(base, t);
    // A varredura de frequência é o que transforma ruído em "madeira cedendo".
    f.frequency.linearRampToValueAtTime(base * (0.55 + Math.random() * 0.8), t + dur);
    const g = ctx.createGain();
    src.connect(f); f.connect(g);
    g.connect(this.buses.sfx);
    g.connect(this.reverbSend);
    this._env(g, t, dur * 0.35, dur * 0.15, dur * 0.5,
      0.30 * intensity * this._spatialGain(distance));
    src.start(t); src.stop(t + dur + 0.3);
  }

  /** Porta: dobradiça arrastando e, opcionalmente, a batida ao fim. */
  door(open = true, slam = false, distance = 2) {
    if (!this.ready) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const sp = this._spatialGain(distance);
    const dur = slam ? 0.35 : 0.9;
    const src = this._noiseSource(false);
    src.playbackRate.value = 0.2;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 9;
    f.frequency.setValueAtTime(open ? 320 : 260, t);
    f.frequency.exponentialRampToValueAtTime(open ? 640 : 180, t + dur);
    const g = ctx.createGain();
    src.connect(f); f.connect(g);
    g.connect(this.buses.sfx); g.connect(this.reverbSend);
    this._env(g, t, 0.05, dur * 0.5, dur * 0.5, 0.22 * sp);
    src.start(t); src.stop(t + dur + 0.2);

    if (slam) {
      const b = ctx.createOscillator();
      b.type = 'sine';
      b.frequency.setValueAtTime(120, t + dur * 0.7);
      b.frequency.exponentialRampToValueAtTime(38, t + dur * 0.7 + 0.22);
      const bg = ctx.createGain();
      b.connect(bg); bg.connect(this.buses.sfx); bg.connect(this.reverbSend);
      this._env(bg, t + dur * 0.7, 0.003, 0.02, 0.3, 0.5 * sp);
      b.start(t + dur * 0.7); b.stop(t + dur + 0.6);
    }
  }

  /** Estática de rádio/fita. Retorna um handle para parar depois. */
  static_(duration = 2, level = 0.18) {
    if (!this.ready) return null;
    const ctx = this.ctx, t = ctx.currentTime;
    const src = this._noiseSource(true);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 900;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 5200;
    const g = ctx.createGain();
    g.gain.value = 0;
    src.connect(hp); hp.connect(lp); lp.connect(g);
    g.connect(this.buses.sfx);
    src.start(t);
    g.gain.linearRampToValueAtTime(level, t + 0.08);
    if (duration > 0) {
      g.gain.setValueAtTime(level, t + duration - 0.2);
      g.gain.linearRampToValueAtTime(0, t + duration);
      src.stop(t + duration + 0.05);
    }
    return {
      stop: (fade = 0.3) => {
        const now = ctx.currentTime;
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.linearRampToValueAtTime(0, now + fade);
        try { src.stop(now + fade + 0.05); } catch (e) { /* já parado */ }
      },
    };
  }

  /**
   * Sussurro: ruído filtrado por formantes que varrem — o cérebro insiste em
   * ouvir palavras onde há apenas ressonância. É o truque mais eficaz do jogo,
   * justamente porque nunca há palavra nenhuma para o jogador citar depois.
   */
  whisper(distance = 5, syllables = 4) {
    if (!this.ready) return;
    const ctx = this.ctx;
    let t = ctx.currentTime;
    const sp = this._spatialGain(distance);
    for (let i = 0; i < syllables; i++) {
      const dur = 0.10 + Math.random() * 0.16;
      const src = this._noiseSource(false);
      const f1 = ctx.createBiquadFilter();
      f1.type = 'bandpass'; f1.Q.value = 11;
      const start = 420 + Math.random() * 500;
      f1.frequency.setValueAtTime(start, t);
      f1.frequency.linearRampToValueAtTime(start * (0.6 + Math.random() * 0.9), t + dur);
      const f2 = ctx.createBiquadFilter();
      f2.type = 'bandpass'; f2.Q.value = 8;
      f2.frequency.setValueAtTime(1200 + Math.random() * 900, t);
      const g = ctx.createGain();
      src.connect(f1); f1.connect(f2); f2.connect(g);
      g.connect(this.buses.voice); g.connect(this.reverbSend);
      this._env(g, t, dur * 0.3, dur * 0.2, dur * 0.5, 0.16 * sp);
      src.start(t); src.stop(t + dur + 0.1);
      t += dur + 0.02 + Math.random() * 0.07;
    }
  }

  /** Batimento cardíaco — dois golpes graves. */
  heartbeat(intensity = 1) {
    if (!this.ready) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const beat = (offset, peak) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(64, t + offset);
      o.frequency.exponentialRampToValueAtTime(32, t + offset + 0.16);
      const g = ctx.createGain();
      o.connect(g); g.connect(this.buses.sfx);
      this._env(g, t + offset, 0.01, 0.04, 0.18, peak * intensity);
      o.start(t + offset); o.stop(t + offset + 0.4);
    };
    beat(0, 0.32);
    beat(0.26, 0.20);
  }

  /** Tom agudo e fino que aparece quando o silêncio "endurece". */
  tinnitus(duration = 3, level = 0.035) {
    if (!this.ready) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = 3100 + Math.random() * 900;
    const g = ctx.createGain();
    o.connect(g); g.connect(this.buses.sfx);
    this._env(g, t, 0.6, duration - 1.4, 0.8, level);
    o.start(t); o.stop(t + duration + 0.2);
  }

  /** Acorde tenso e sustentado para momentos narrativos (não é jumpscare). */
  stinger(root = 55, level = 0.16, duration = 6) {
    if (!this.ready) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const g = ctx.createGain();
    g.connect(this.buses.music);
    g.connect(this.reverbSend);
    // Trítono: instabilidade sem melodrama.
    [root, root * 1.4142, root * 2.0, root * 2.99].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = i % 2 ? 'triangle' : 'sine';
      o.frequency.value = f * (1 + (Math.random() - 0.5) * 0.004);
      const og = ctx.createGain();
      og.gain.value = 1 / (i + 1.4);
      o.connect(og); og.connect(g);
      o.start(t); o.stop(t + duration + 0.5);
    });
    this._env(g, t, 1.4, duration - 3.2, 1.8, level);
  }

  /** Clique mecânico: fechadura, interruptor, botão do gravador. */
  click(pitch = 1, level = 0.2) {
    if (!this.ready) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const src = this._noiseSource(false);
    src.playbackRate.value = 1.6 * pitch;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 2200 * pitch;
    f.Q.value = 6;
    const g = ctx.createGain();
    src.connect(f); f.connect(g); g.connect(this.buses.sfx);
    this._env(g, t, 0.001, 0.004, 0.05, level);
    src.start(t); src.stop(t + 0.12);
  }

  /** Página virando / papel sendo manuseado. */
  paper() {
    if (!this.ready) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const src = this._noiseSource(false);
    src.playbackRate.value = 0.9 + Math.random() * 0.4;
    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 2600;
    const g = ctx.createGain();
    src.connect(f); f.connect(g); g.connect(this.buses.sfx);
    this._env(g, t, 0.02, 0.05, 0.16, 0.13);
    src.start(t); src.stop(t + 0.35);
  }

  /** Fita cassete rodando — chiado + wow/flutter. Handle para parar. */
  tapeHiss(level = 0.06) {
    if (!this.ready) return null;
    const ctx = this.ctx, t = ctx.currentTime;
    const src = this._noiseSource(true);
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 3400;
    f.Q.value = 0.5;
    const g = ctx.createGain();
    g.gain.value = 0;
    src.connect(f); f.connect(g); g.connect(this.buses.sfx);
    // Wow/flutter: a instabilidade mecânica que denuncia mídia analógica.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 2.7;
    const lg = ctx.createGain();
    lg.gain.value = 260;
    lfo.connect(lg); lg.connect(f.frequency);
    lfo.start(t);
    src.start(t);
    g.gain.linearRampToValueAtTime(level, t + 0.3);
    return {
      stop: (fade = 0.4) => {
        const now = ctx.currentTime;
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.linearRampToValueAtTime(0, now + fade);
        try { src.stop(now + fade + 0.1); lfo.stop(now + fade + 0.1); } catch (e) { /* ok */ }
      },
    };
  }

  /**
   * Caixa de música: valsa curta em senoides com decaimento longo. As três
   * últimas notas saem desafinadas de propósito — o mecanismo tem trinta anos
   * e uma caixa de música perfeita não pertence a esta casa.
   */
  musicBox() {
    if (!this.ready) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime;
    // Mi-Sol-Dó-Si-Sol-Mi-Ré-Dó em 5ª/6ª oitavas.
    const notes = [659.3, 784.0, 1046.5, 987.8, 784.0, 659.3, 587.3, 523.3];
    const detune = [1, 1, 1, 1, 1, 0.988, 1.012, 0.981];
    notes.forEach((f, i) => {
      const t = t0 + i * 0.42;
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f * detune[i];
      const g = ctx.createGain();
      o.connect(g);
      g.connect(this.buses.music);
      g.connect(this.reverbSend);
      // Ataque de martelinho + cauda longa: a assinatura do lamelofone.
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
      o.start(t);
      o.stop(t + 1.6);

      // Harmônico metálico curto, uma oitava e meia acima.
      const h = ctx.createOscillator();
      h.type = 'triangle';
      h.frequency.value = f * 3 * detune[i];
      const hg = ctx.createGain();
      h.connect(hg); hg.connect(this.buses.music);
      hg.gain.setValueAtTime(0.0001, t);
      hg.gain.exponentialRampToValueAtTime(0.025, t + 0.004);
      hg.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      h.start(t); h.stop(t + 0.5);
    });
  }

  /** Batida em madeira — alguém do outro lado da porta. */
  knock(times = 3, distance = 6) {
    if (!this.ready) return;
    const ctx = this.ctx;
    const sp = this._spatialGain(distance);
    for (let i = 0; i < times; i++) {
      const t = ctx.currentTime + i * (0.42 + Math.random() * 0.1);
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(180 + Math.random() * 40, t);
      o.frequency.exponentialRampToValueAtTime(70, t + 0.12);
      const g = ctx.createGain();
      o.connect(g); g.connect(this.buses.sfx); g.connect(this.reverbSend);
      this._env(g, t, 0.002, 0.01, 0.2, 0.34 * sp);
      o.start(t); o.stop(t + 0.35);

      const n = this._noiseSource(false);
      const nf = ctx.createBiquadFilter();
      nf.type = 'bandpass'; nf.frequency.value = 900; nf.Q.value = 2;
      const ng = ctx.createGain();
      n.connect(nf); nf.connect(ng); ng.connect(this.buses.sfx);
      this._env(ng, t, 0.001, 0.005, 0.06, 0.16 * sp);
      n.start(t); n.stop(t + 0.15);
    }
  }
}
