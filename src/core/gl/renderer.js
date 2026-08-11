// renderer.js — forward renderer minimalista com um passe de pós-processamento.
// Estrutura de cena deliberadamente declarativa (meshes + lights) para mapear
// diretamente em nós do Godot numa portagem futura.

import { SCENE_VS, SCENE_FS, POST_VS, POST_FS, MAX_LIGHTS } from './shaders.js';
import { m4, m4identity, m4perspective, m4trs, m4viewFPS } from '../math.js';

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error('Falha ao compilar shader: ' + gl.getShaderInfoLog(sh));
  }
  return sh;
}

function link(gl, vsSrc, fsSrc) {
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vsSrc));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fsSrc));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error('Falha ao linkar programa: ' + gl.getProgramInfoLog(p));
  }
  // Coleta automática de localizações de uniforms/atributos.
  const uniforms = {}, attribs = {};
  const nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < nu; i++) {
    const info = gl.getActiveUniform(p, i);
    const name = info.name.replace(/\[0\]$/, '');
    uniforms[name] = gl.getUniformLocation(p, name);
  }
  const na = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < na; i++) {
    const info = gl.getActiveAttrib(p, i);
    attribs[info.name] = gl.getAttribLocation(p, info.name);
  }
  return { program: p, uniforms, attribs };
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    const opts = { antialias: false, alpha: false, depth: true, powerPreference: 'high-performance' };
    const gl = canvas.getContext('webgl2', opts) || canvas.getContext('webgl', opts);
    if (!gl) throw new Error('WebGL não está disponível neste navegador.');
    this.gl = gl;
    this.isGL2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;

    this.scenePS = link(gl, SCENE_VS, SCENE_FS);
    this.postPS = link(gl, POST_VS, POST_FS);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // Quad de tela cheia para o pós-processamento.
    this.quadVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    this.proj = m4();
    this.view = m4();
    this.model = m4();
    m4identity(this.model);

    // Renderizar abaixo da resolução nativa dá dois ganhos: performance e uma
    // suavidade "de filme" que combina com o grão.
    this.renderScale = 0.85;
    // Além disto a névoa já engoliu tudo (ver fogDensity em game.js).
    this.cullDistance = 58;
    this.fb = null;
    this.fbWidth = 0;
    this.fbHeight = 0;

    this.post = {
      grain: 0.075, vignette: 0.85, aberration: 0.0016,
      distort: 0, pulse: 0, fade: 1, grade: [1.0, 0.99, 1.02],
    };

    this._textures = new Map();
    this._lightPos = new Float32Array(MAX_LIGHTS * 3);
    this._lightColor = new Float32Array(MAX_LIGHTS * 3);
    this._lightRange = new Float32Array(MAX_LIGHTS);
    this.drawCalls = 0;

    this.resize();
  }

  /* ------------------------------- recursos ------------------------------ */

  createMesh(data) {
    const gl = this.gl;
    const mesh = {
      vbo: gl.createBuffer(), nbo: gl.createBuffer(),
      tbo: gl.createBuffer(), ibo: gl.createBuffer(),
      count: data.indices.length,
    };
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, data.positions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.nbo);
    gl.bufferData(gl.ARRAY_BUFFER, data.normals, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.tbo);
    gl.bufferData(gl.ARRAY_BUFFER, data.uvs, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data.indices, gl.STATIC_DRAW);
    return mesh;
  }

  /** Cria (ou substitui) uma textura a partir de um canvas 2D. */
  createTexture(name, canvas, { repeat = true, mipmap = true } = {}) {
    const gl = this.gl;
    let tex = this._textures.get(name);
    if (!tex) { tex = gl.createTexture(); this._textures.set(name, tex); }
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

    // WebGL1 não aceita REPEAT nem mipmaps em texturas de dimensões que não
    // sejam potências de 2 — e as fotografias são 320x240. Sem esta guarda a
    // textura sai preta em qualquer contexto que caia para WebGL1.
    const isPOT = (n) => (n & (n - 1)) === 0;
    const npot = !isPOT(canvas.width) || !isPOT(canvas.height);
    const allowAdvanced = this.isGL2 || !npot;

    const wrap = (repeat && allowAdvanced) ? gl.REPEAT : gl.CLAMP_TO_EDGE;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (mipmap && allowAdvanced) {
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    return tex;
  }

  getTexture(name) { return this._textures.get(name); }

  /* ------------------------------ framebuffer ---------------------------- */

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(320, Math.floor(this.canvas.clientWidth * dpr));
    const h = Math.max(240, Math.floor(this.canvas.clientHeight * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    const fw = Math.max(320, Math.floor(w * this.renderScale));
    const fh = Math.max(240, Math.floor(h * this.renderScale));
    if (fw === this.fbWidth && fh === this.fbHeight && this.fb) return;

    const gl = this.gl;
    if (this.fb) {
      gl.deleteFramebuffer(this.fb.handle);
      gl.deleteTexture(this.fb.color);
      gl.deleteRenderbuffer(this.fb.depth);
    }
    const handle = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, handle);
    const color = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, color);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fw, fh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, color, 0);
    const depth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, fw, fh);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.fb = { handle, color, depth };
    this.fbWidth = fw;
    this.fbHeight = fh;
  }

  /* -------------------------------- desenho ------------------------------ */

  /**
   * @param {object} scene  { meshes:[], lights:[], ambient, moonDir, moonColor,
   *                          fogColor, fogDensity, flashlight }
   * @param {object} camera { position:[x,y,z], yaw, pitch, fov }
   */
  render(scene, camera, time) {
    const gl = this.gl;
    this.resize();
    this.drawCalls = 0;

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb.handle);
    gl.viewport(0, 0, this.fbWidth, this.fbHeight);
    const fc = scene.fogColor;
    gl.clearColor(fc[0], fc[1], fc[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);

    const ps = this.scenePS;
    gl.useProgram(ps.program);

    const aspect = this.fbWidth / this.fbHeight;
    m4perspective(this.proj, (camera.fov || 68) * Math.PI / 180, aspect, 0.05, 120);
    m4viewFPS(this.view, camera.position[0], camera.position[1], camera.position[2],
      camera.yaw, camera.pitch);

    gl.uniformMatrix4fv(ps.uniforms.uProjection, false, this.proj);
    gl.uniformMatrix4fv(ps.uniforms.uView, false, this.view);
    gl.uniform3fv(ps.uniforms.uEyePos, camera.position);
    gl.uniform3fv(ps.uniforms.uAmbient, scene.ambient);
    gl.uniform3fv(ps.uniforms.uMoonDir, scene.moonDir);
    gl.uniform3fv(ps.uniforms.uMoonColor, scene.moonColor);
    gl.uniform3fv(ps.uniforms.uFogColor, scene.fogColor);
    gl.uniform1f(ps.uniforms.uFogDensity, scene.fogDensity);

    this._uploadLights(ps, scene, camera);

    // Culling: a casa mobiliada tem ~1000 peças, mas a névoa e as paredes
    // deixam poucas dezenas realmente visíveis a cada instante. Descartar por
    // distância e por hemisfério de trás da câmera custa quase nada e corta a
    // maior parte das draw calls.
    const cam = camera.position;
    const fx = -Math.sin(camera.yaw), fz = -Math.cos(camera.yaw);
    const maxDist = this.cullDistance;
    const meshes = scene.meshes;
    for (let i = 0; i < meshes.length; i++) {
      const obj = meshes[i];
      if (obj.visible === false) continue;
      const dx = obj.position[0] - cam[0];
      const dy = obj.position[1] - cam[1];
      const dz = obj.position[2] - cam[2];
      const r = obj.radius || 1;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > (maxDist + r) * (maxDist + r)) continue;
      // Atrás da câmera (com folga do raio) — o pitch é ignorado de propósito:
      // testar só o eixo horizontal evita cortar chão e teto ao olhar para cima.
      if (dx * fx + dz * fz < -r - 1.2) continue;
      this._drawMesh(ps, obj);
    }

    this._postPass(time);
  }

  _uploadLights(ps, scene, camera) {
    const gl = this.gl;
    const cam = camera.position;

    // Só cabem MAX_LIGHTS luzes: escolhe as mais relevantes (proximidade
    // ponderada pelo alcance) a cada frame. Barato e visualmente estável.
    const active = [];
    for (const L of scene.lights) {
      if (L.enabled === false) continue;
      const intensity = L.intensity === undefined ? 1 : L.intensity;
      if (intensity <= 0.001) continue;
      const dx = L.position[0] - cam[0], dy = L.position[1] - cam[1], dz = L.position[2] - cam[2];
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d > L.range + 12) continue;
      active.push({ L, score: d - L.range * 0.5 - intensity * 2 });
    }
    active.sort((a, b) => a.score - b.score);
    const n = Math.min(active.length, MAX_LIGHTS);
    for (let i = 0; i < n; i++) {
      const L = active[i].L;
      const k = L.intensity === undefined ? 1 : L.intensity;
      this._lightPos[i * 3] = L.position[0];
      this._lightPos[i * 3 + 1] = L.position[1];
      this._lightPos[i * 3 + 2] = L.position[2];
      this._lightColor[i * 3] = L.color[0] * k;
      this._lightColor[i * 3 + 1] = L.color[1] * k;
      this._lightColor[i * 3 + 2] = L.color[2] * k;
      this._lightRange[i] = L.range;
    }
    gl.uniform1i(ps.uniforms.uLightCount, n);
    if (n > 0) {
      gl.uniform3fv(ps.uniforms.uLightPos, this._lightPos);
      gl.uniform3fv(ps.uniforms.uLightColor, this._lightColor);
      gl.uniform1fv(ps.uniforms.uLightRange, this._lightRange);
    }

    const f = scene.flashlight;
    if (f && f.on) {
      gl.uniform3fv(ps.uniforms.uFlashPos, f.position);
      gl.uniform3fv(ps.uniforms.uFlashDir, f.direction);
      gl.uniform3f(ps.uniforms.uFlashColor, f.color[0] * f.intensity,
        f.color[1] * f.intensity, f.color[2] * f.intensity);
      gl.uniform2f(ps.uniforms.uFlashCone, Math.cos(f.outer), Math.cos(f.inner));
      gl.uniform1f(ps.uniforms.uFlashRange, f.range);
    } else {
      gl.uniform3f(ps.uniforms.uFlashColor, 0, 0, 0);
      gl.uniform2f(ps.uniforms.uFlashCone, 0.9, 0.95);
      gl.uniform1f(ps.uniforms.uFlashRange, 1);
      gl.uniform3f(ps.uniforms.uFlashPos, 0, 0, 0);
      gl.uniform3f(ps.uniforms.uFlashDir, 0, 0, -1);
    }
  }

  _drawMesh(ps, obj) {
    const gl = this.gl;
    const mesh = obj.mesh;
    const mat = obj.material;

    m4trs(this.model, obj.position[0], obj.position[1], obj.position[2], obj.rotationY || 0);
    gl.uniformMatrix4fv(ps.uniforms.uModel, false, this.model);

    const tex = this._textures.get(mat.texture) || this._textures.get('white');
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(ps.uniforms.uTex, 0);
    gl.uniform2f(ps.uniforms.uUVScale, mat.uvScale ? mat.uvScale[0] : 1, mat.uvScale ? mat.uvScale[1] : 1);
    const t = mat.tint || [1, 1, 1];
    gl.uniform3f(ps.uniforms.uTint, t[0], t[1], t[2]);
    gl.uniform1f(ps.uniforms.uEmissive, mat.emissive || 0);
    gl.uniform1f(ps.uniforms.uRoughGloss, mat.gloss || 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vbo);
    gl.enableVertexAttribArray(ps.attribs.aPosition);
    gl.vertexAttribPointer(ps.attribs.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.nbo);
    gl.enableVertexAttribArray(ps.attribs.aNormal);
    gl.vertexAttribPointer(ps.attribs.aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.tbo);
    gl.enableVertexAttribArray(ps.attribs.aUV);
    gl.vertexAttribPointer(ps.attribs.aUV, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.ibo);
    gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
    this.drawCalls++;
  }

  _postPass(time) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.disable(gl.DEPTH_TEST);

    const ps = this.postPS;
    gl.useProgram(ps.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.fb.color);
    gl.uniform1i(ps.uniforms.uScene, 0);
    gl.uniform2f(ps.uniforms.uResolution, this.fbWidth, this.fbHeight);
    gl.uniform1f(ps.uniforms.uTime, time);
    gl.uniform1f(ps.uniforms.uGrain, this.post.grain);
    gl.uniform1f(ps.uniforms.uVignette, this.post.vignette);
    gl.uniform1f(ps.uniforms.uAberration, this.post.aberration);
    gl.uniform1f(ps.uniforms.uDistort, this.post.distort);
    gl.uniform1f(ps.uniforms.uPulse, this.post.pulse);
    gl.uniform1f(ps.uniforms.uFade, this.post.fade);
    gl.uniform3fv(ps.uniforms.uGrade, this.post.grade);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVBO);
    gl.enableVertexAttribArray(ps.attribs.aPosition);
    gl.vertexAttribPointer(ps.attribs.aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
