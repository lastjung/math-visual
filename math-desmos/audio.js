class AudioManager {
  constructor() {
    this.audio = new Audio();
    this.audio.loop = false;
    this.audio.volume = 0;
    this.targetVolume = 0.15;
    this.fadeInterval = null;
    this.isMuted = true;
    this.currentTrack = null;
    this.onEnded = null;

    this.audio.addEventListener("ended", () => {
      if (!this.isMuted && typeof this.onEnded === "function") {
        this.onEnded();
      }
    });
  }

  play(trackUrl, options = {}) {
    if (!trackUrl) return;
    const forceSwitch = options.forceSwitch === true;
    if (this.isMuted) {
      if (forceSwitch || this.currentTrack !== trackUrl) {
        this.currentTrack = trackUrl;
        this.audio.src = trackUrl;
        this.audio.load();
      }
      return;
    }

    if (!forceSwitch && this.currentTrack === trackUrl) {
      if (this.audio.paused) this.fadeIn();
      return;
    }

    this.currentTrack = trackUrl;
    this.fadeOut(() => {
      this.audio.src = trackUrl;
      this.audio.load();
      this.audio.currentTime = 0;
      this.audio.play().then(() => this.fadeIn()).catch(() => {});
    });
  }

  toggleMute() {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.audio.pause();
      this.audio.volume = 0;
    } else if (this.currentTrack && this.audio.paused) {
      this.audio.play().then(() => this.fadeIn()).catch(() => {});
    } else {
      this.audio.volume = this.targetVolume;
    }
    return this.isMuted;
  }

  setTargetVolume(volume) {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    const parsed = Number(volume);
    if (Number.isNaN(parsed)) return this.targetVolume;
    this.targetVolume = Math.max(0, Math.min(1, parsed));

    if (this.targetVolume > 0 && this.isMuted) {
      this.isMuted = false;
    } else if (this.targetVolume === 0 && !this.isMuted) {
      this.isMuted = true;
    }

    if (this.isMuted) {
      this.audio.volume = 0;
      this.audio.pause();
    } else {
      this.audio.volume = this.targetVolume;
      if (this.currentTrack && this.audio.paused) {
        this.audio.play().catch(() => {});
      }
    }
    return this.targetVolume;
  }

  getTargetVolume() {
    return this.targetVolume;
  }

  fadeIn() {
    if (this.isMuted) return;
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    this.fadeInterval = null;
    this.audio.volume = 0;
    this.audio.play().catch(() => {});

    let volume = 0;
    this.fadeInterval = setInterval(() => {
      volume += 0.05;
      if (volume >= this.targetVolume) {
        volume = this.targetVolume;
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
      }
      this.audio.volume = volume;
    }, 50);
  }

  fadeOut(callback) {
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    this.fadeInterval = null;
    if (this.audio.paused) {
      if (callback) callback();
      return;
    }

    let volume = this.audio.volume;
    this.fadeInterval = setInterval(() => {
      volume -= 0.1;
      if (volume <= 0) {
        volume = 0;
        this.audio.pause();
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        if (callback) callback();
      } else {
        this.audio.volume = volume;
      }
    }, 30);
  }
}

window.audioManager = new AudioManager();
