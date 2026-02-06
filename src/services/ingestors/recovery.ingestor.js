export class RecoveryIngestor {
  constructor(memoryService) {
    this.memoryService = memoryService;
  }

  async processSleepEvent(userId, sleepData) {
    const hours = sleepData.hours || 0;
    const quality = sleepData.quality_score || 0;
    const interruptions = sleepData.interruptions || 0;
    
    // Generate compact memory text
    const memoryText = `Sleep: ${this._formatDuration(hours)}, quality ${quality}/10, woke up ${interruptions} times`;

    const metadata = {
      category: 'recovery.sleep',
      source: sleepData.source || 'user_input',
      module_specific: {
        hours: hours,
        quality_score: quality,
        interruptions: interruptions,
        stages: sleepData.stages || {}
      }
    };

    return await this.memoryService.addMemory(userId, memoryText, metadata);
  }

  async processStressEvent(userId, stressData) {
    const stressScore = stressData.stress_score || 0;
    const descriptors = [];
    
    if (stressData.fatigue_level) descriptors.push(`fatigue: ${stressData.fatigue_level}`);
    if (stressData.soreness) descriptors.push(`soreness: ${stressData.soreness}`);
    if (stressData.notes) descriptors.push(stressData.notes);

    // Generate compact memory text
    let memoryText = `Stress level ${stressScore}/10`;
    if (descriptors.length > 0) {
      memoryText += `, ${descriptors.join(', ')}`;
    }

    const metadata = {
      category: 'recovery.stress',
      source: stressData.source || 'user_input',
      module_specific: {
        stress_score: stressScore,
        fatigue_level: stressData.fatigue_level,
        soreness: stressData.soreness
      }
    };

    return await this.memoryService.addMemory(userId, memoryText, metadata);
  }

  _formatDuration(hours) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  }
}
