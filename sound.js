/**
 * 댕댕이 땅따먹기 게임 - 귀여운 사운드 엔진 (Web Audio API)
 * 외부 오디오 파일 없이 순수 브라우저 신디사이저로 귀여운 효과음 구현
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  // 브라우저 자동재생 정책 대응: 첫 사용자 인터랙션 시 초기화
  initContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // 1. 플레이어 칸 선택: 통통 튀는 밝은 '퐁!' (Jelly Pop)
  playUserStamp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;

    // 피치 상승 바운스 효과음
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // 2. 컴퓨터 칸 선택: 귀여운 '뾱!' (Bubble Plop)
  playBotStamp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const now = this.ctx.currentTime;

    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(340, now + 0.14);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // 3. 버튼 탭 소리
  playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;

    osc.frequency.setValueAtTime(600, now);
    osc.frequency.setValueAtTime(900, now + 0.04);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // 4. 승리 팡파레! (도-미-솔-도!)
  playVictory() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.50, d: 0.4 }  // C6
    ];

    let start = this.ctx.currentTime;
    notes.forEach((note, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, start);

      gain.gain.setValueAtTime(0.28, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + note.d + 0.05);

      start += (index === notes.length - 2 ? 0.15 : 0.12);
    });
  }

  // 5. 패배 멜로디 (솔-파-미-도 하강음)
  playDefeat() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [
      { f: 440, d: 0.15 },
      { f: 392, d: 0.15 },
      { f: 349.23, d: 0.15 },
      { f: 293.66, d: 0.35 }
    ];

    let start = this.ctx.currentTime;
    notes.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, start);

      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + note.d + 0.05);

      start += 0.16;
    });
  }

  // 6. 무승부 소리
  playDraw() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [
      { f: 440, d: 0.18 },
      { f: 440, d: 0.3 }
    ];

    let start = this.ctx.currentTime;
    notes.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, start);

      gain.gain.setValueAtTime(0.22, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + note.d + 0.05);

      start += 0.22;
    });
  }
  // 7. 장애물 클릭 시 '통!' 막힘 소리
  playBlocked() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const now = this.ctx.currentTime;

    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // 8. 황금 뼈다귀 찬스 획득 시 '챠랑~' 반짝임 소리
  playBonus() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [659.25, 783.99, 987.77, 1318.51]; // E5, G5, B5, E6
    let start = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start + idx * 0.05);

      gain.gain.setValueAtTime(0.25, start + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, start + idx * 0.05 + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start + idx * 0.05);
      osc.stop(start + idx * 0.05 + 0.2);
    });
  }

  // 9. 주사위 도르륵 굴러가는 소리 (Dice Roll)
  playDiceRoll() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const clicks = 5;
    let start = this.ctx.currentTime;
    for (let i = 0; i < clicks; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const freq = 450 + Math.random() * 350;
      osc.frequency.setValueAtTime(freq, start + i * 0.07);

      gain.gain.setValueAtTime(0.2, start + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.01, start + i * 0.07 + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start + i * 0.07);
      osc.stop(start + i * 0.07 + 0.06);
    }
  }

  // 10. 대박 추가 점수 (+3, +4점 획득 시 잭팟 효과음)
  playJackpot() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    let start = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start + idx * 0.06);

      gain.gain.setValueAtTime(0.28, start + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, start + idx * 0.06 + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start + idx * 0.06);
      osc.stop(start + idx * 0.06 + 0.25);
    });
  }

  // 11. 마이너스 함정 감점 소리 (미끄러지며 삐융~ 하강하는 소리)
  playTrap() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const now = this.ctx.currentTime;

    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.32);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.38);
  }
}

// 글로벌 사운드 객체 노출
window.soundEngine = new SoundEngine();
