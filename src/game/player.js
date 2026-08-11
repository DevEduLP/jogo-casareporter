// player.js — locomoção em primeira pessoa, colisão e a lanterna.
// Nada de física genérica: um cilindro deslizando contra AABBs é exatamente o
// que este jogo precisa, e é trivial de reproduzir num CharacterBody3D.

import { clamp, damp, forwardFromAngles } from '../core/math.js';
import { EVENTS } from '../core/bus.js';

const RADIUS = 0.32;
const EYE_STAND = 1.68;
const EYE_CROUCH = 1.02;

export class Player {
  constructor(world, input, bus, audio) {
    this.world = world;
    this.input = input;
    this.bus = bus;
    this.audio = audio;

    const spawn = world.data.spawn;
    this.position = new Float32Array([spawn.position[0], spawn.position[1], spawn.position[2]]);
    this.yaw = spawn.yaw || 0;
    this.pitch = 0;
    this.velocity = new Float32Array(3);

    this.walkSpeed = 2.05;
    this.runSpeed = 3.55;
    this.crouchSpeed = 1.05;
    this.eyeHeight = EYE_STAND;
    this.targetEye = EYE_STAND;
    this.groundY = 0;

    this.bobPhase = 0;
    this.bobAmount = 0;
    this.stepDistance = 0;
    this.leanRoll = 0;

    this.canMove = true;
    this.crouching = false;

    // Estado interno de tensão: sobe com o escuro e com eventos, e alimenta
    // respiração, batimento e pós-processamento.
    this.tension = 0;

    this.flashlight = {
      on: false,
      position: new Float32Array(3),
      direction: new Float32Array(3),
      color: [1.0, 0.94, 0.82],
      intensity: 1.5,
      inner: 0.22,
      outer: 0.46,
      range: 13,
      hasIt: true,
      health: 1,      // 1 = firme; abaixo disso, oscila
    };

    this._fwd = new Float32Array(3);
    this._axis = [0, 0];
  }

  get eyePosition() {
    return [this.position[0], this.position[1], this.position[2]];
  }

  teleport(x, z, yaw) {
    this.position[0] = x;
    this.position[2] = z;
    this.groundY = this.world.floorHeightAt(x, z);
    this.position[1] = this.groundY + this.eyeHeight;
    if (yaw !== undefined) this.yaw = yaw;
    this.velocity.fill(0);
  }

  update(dt) {
    this._look(dt);
    this._move(dt);
    this._flashlight(dt);
  }

  _look(dt) {
    if (!this.canMove) return;
    const [dx, dy] = this.input.consumeLook();
    this.yaw -= dx;
    this.pitch = clamp(this.pitch - dy, -1.45, 1.45);
    // Mantém o yaw num intervalo estável para evitar perda de precisão em
    // sessões longas (e para que o save fique legível).
    if (this.yaw > Math.PI) this.yaw -= Math.PI * 2;
    else if (this.yaw < -Math.PI) this.yaw += Math.PI * 2;
  }

  _move(dt) {
    const input = this.input;
    let [ax, az] = this.canMove ? input.moveAxis(this._axis) : [0, 0];

    this.crouching = this.canMove && input.isDown('crouch');
    const running = this.canMove && input.isDown('run') && az > 0 && !this.crouching;
    this.targetEye = this.crouching ? EYE_CROUCH : EYE_STAND;

    const speed = this.crouching ? this.crouchSpeed : (running ? this.runSpeed : this.walkSpeed);

    // Direção no plano: o strafe é perpendicular ao olhar.
    const sinY = Math.sin(this.yaw), cosY = Math.cos(this.yaw);
    const wishX = (-sinY * az) + (cosY * ax);
    const wishZ = (-cosY * az) + (-sinY * ax);

    // Aceleração/atrito exponenciais: Laura não é ágil, e o peso do corpo é
    // parte da sensação de estar num lugar onde não deveria estar.
    const accel = (ax || az) ? 11 : 14;
    this.velocity[0] = damp(this.velocity[0], wishX * speed, accel, dt);
    this.velocity[2] = damp(this.velocity[2], wishZ * speed, accel, dt);

    const moved = this._collideAndSlide(this.velocity[0] * dt, this.velocity[2] * dt);

    // Altura do piso com suavização — sobe degraus sem física vertical.
    this.groundY = damp(this.groundY, this.world.floorHeightAt(this.position[0], this.position[2]), 9, dt);
    this.eyeHeight = damp(this.eyeHeight, this.targetEye, 9, dt);

    // Balanço da câmera proporcional à velocidade real (não à intenção): parar
    // contra uma parede não deve continuar balançando.
    const horizSpeed = Math.hypot(moved.dx, moved.dz) / Math.max(dt, 0.0001);
    this.bobAmount = damp(this.bobAmount, Math.min(horizSpeed / this.runSpeed, 1), 8, dt);
    this.bobPhase += horizSpeed * dt * (running ? 6.4 : 5.2);

    const bobY = Math.sin(this.bobPhase * 2) * 0.028 * this.bobAmount;
    const bobRoll = Math.sin(this.bobPhase) * 0.012 * this.bobAmount;
    this.leanRoll = damp(this.leanRoll, bobRoll, 12, dt);

    // Respiração: sempre presente, mais funda quando a tensão sobe.
    const breath = Math.sin(performance.now() * 0.0011) * (0.006 + this.tension * 0.012);

    this.position[1] = this.groundY + this.eyeHeight + bobY + breath;

    // Passos disparados por distância percorrida, não por tempo.
    this.stepDistance += Math.hypot(moved.dx, moved.dz);
    const stride = this.crouching ? 1.05 : (running ? 0.82 : 0.68);
    if (this.stepDistance >= stride) {
      this.stepDistance = 0;
      const surface = this.world.surfaceAt(this.position[0], this.position[2]);
      this.audio.footstep(surface, running);
    }
  }

  /**
   * Move em X e Z separadamente contra os AABBs. Resolver um eixo por vez é o
   * que produz o deslizamento suave ao raspar numa parede em diagonal.
   */
  _collideAndSlide(dx, dz) {
    const colliders = this.world.activeColliders();
    const startX = this.position[0], startZ = this.position[2];

    this.position[0] += dx;
    for (const c of colliders) {
      if (!this._overlaps(c)) continue;
      // Empurra para fora pela face mais próxima no eixo X.
      const cx = (c.min[0] + c.max[0]) / 2;
      if (this.position[0] < cx) this.position[0] = c.min[0] - RADIUS;
      else this.position[0] = c.max[0] + RADIUS;
    }

    this.position[2] += dz;
    for (const c of colliders) {
      if (!this._overlaps(c)) continue;
      const cz = (c.min[1] + c.max[1]) / 2;
      if (this.position[2] < cz) this.position[2] = c.min[1] - RADIUS;
      else this.position[2] = c.max[1] + RADIUS;
    }

    return { dx: this.position[0] - startX, dz: this.position[2] - startZ };
  }

  _overlaps(c) {
    // Colisores muito baixos (tapetes, degraus) não bloqueiam.
    if (c.height !== undefined && c.height < 0.35) return false;
    const x = this.position[0], z = this.position[2];
    const nx = clamp(x, c.min[0], c.max[0]);
    const nz = clamp(z, c.min[1], c.max[1]);
    const ddx = x - nx, ddz = z - nz;
    return (ddx * ddx + ddz * ddz) < RADIUS * RADIUS;
  }

  _flashlight(dt) {
    const f = this.flashlight;
    if (this.input.justPressed('flashlight') && f.hasIt && this.canMove) {
      f.on = !f.on;
      this.audio.click(1.4, 0.16);
      this.bus.emit(EVENTS.NOTIFY, { text: f.on ? 'Lanterna ligada' : 'Lanterna desligada', quiet: true });
    }
    f.position[0] = this.position[0];
    f.position[1] = this.position[1] - 0.12;
    f.position[2] = this.position[2];
    forwardFromAngles(f.direction, this.yaw, this.pitch);

    // A lanterna falha conforme a realidade se degrada. Nunca apaga de vez:
    // uma escuridão total é frustrante; uma luz que hesita é assustadora.
    if (f.health < 1) {
      const t = performance.now() * 0.004;
      const n = Math.sin(t) * Math.sin(t * 3.7) * Math.sin(t * 0.9);
      f.intensity = 1.5 * (f.health * 0.6 + 0.4) * (0.75 + 0.25 * n);
    } else {
      f.intensity = 1.5;
    }
  }

  serialize() {
    return {
      position: Array.from(this.position),
      yaw: this.yaw,
      pitch: this.pitch,
      flashlightOn: this.flashlight.on,
      hasFlashlight: this.flashlight.hasIt,
    };
  }

  deserialize(s) {
    if (!s) return;
    this.position.set(s.position);
    this.yaw = s.yaw;
    this.pitch = s.pitch;
    this.flashlight.on = !!s.flashlightOn;
    this.flashlight.hasIt = s.hasFlashlight !== false;
    this.groundY = this.world.floorHeightAt(this.position[0], this.position[2]);
  }
}
