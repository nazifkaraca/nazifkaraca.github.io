// Performance monitoring utility
class PerformanceMonitor {
  constructor() {
    this.stats = {
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
    };
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.startTime = this.lastTime;
  }

  update() {
    const currentTime = performance.now();
    this.frameTime = currentTime - this.lastTime;
    this.frameCount++;

    // Calculate FPS every second
    if (currentTime - this.startTime >= 1000) {
      this.stats.fps = Math.round(
        (this.frameCount * 1000) / (currentTime - this.startTime)
      );
      this.frameCount = 0;
      this.startTime = currentTime;

      // Memory usage (if available)
      if (performance.memory) {
        this.stats.memoryUsage = Math.round(
          performance.memory.usedJSHeapSize / 1048576
        ); // MB
      }

      // Log performance data in development
      if (import.meta.env.DEV) {
        console.log(
          `🚀 FPS: ${this.stats.fps}, Memory: ${this.stats.memoryUsage}MB`
        );
      }
    }

    this.lastTime = currentTime;
  }

  getStats() {
    return { ...this.stats };
  }
}

export default PerformanceMonitor;
