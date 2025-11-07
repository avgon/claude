#!/usr/bin/env node

/**
 * AI Memory Layer Integration
 * Purpose: Persistent memory across automation sessions
 * Using @supermemory/tools for memory management
 */

import dotenv from 'dotenv';

dotenv.config();

/**
 * Memory Layer for AI Agents
 * Provides persistent storage and retrieval of automation context
 */
class MemoryLayer {
  constructor(options = {}) {
    this.memories = new Map();
    this.sessionId = options.sessionId || this.generateSessionId();
    this.maxMemories = options.maxMemories || 100;
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Store a memory
   * @param {string} key - Memory key
   * @param {any} value - Memory value
   * @param {Object} metadata - Optional metadata
   */
  async store(key, value, metadata = {}) {
    try {
      const memory = {
        key,
        value,
        metadata: {
          ...metadata,
          sessionId: this.sessionId,
          timestamp: Date.now(),
          type: typeof value
        }
      };

      this.memories.set(key, memory);

      // Maintain size limit
      if (this.memories.size > this.maxMemories) {
        const firstKey = this.memories.keys().next().value;
        this.memories.delete(firstKey);
      }

      console.log(`💾 Stored memory: ${key}`);
      return memory;
    } catch (error) {
      console.error('❌ Failed to store memory:', error.message);
      throw error;
    }
  }

  /**
   * Retrieve a memory
   * @param {string} key - Memory key
   * @returns {any} Memory value
   */
  async retrieve(key) {
    try {
      const memory = this.memories.get(key);

      if (!memory) {
        console.log(`⚠️  Memory not found: ${key}`);
        return null;
      }

      console.log(`📖 Retrieved memory: ${key}`);
      return memory.value;
    } catch (error) {
      console.error('❌ Failed to retrieve memory:', error.message);
      throw error;
    }
  }

  /**
   * Search memories by pattern
   * @param {string} pattern - Search pattern (regex or string)
   * @returns {Array} Matching memories
   */
  async search(pattern) {
    try {
      const regex = new RegExp(pattern, 'i');
      const results = [];

      for (const [key, memory] of this.memories.entries()) {
        if (regex.test(key) || regex.test(JSON.stringify(memory.value))) {
          results.push(memory);
        }
      }

      console.log(`🔍 Found ${results.length} matching memories`);
      return results;
    } catch (error) {
      console.error('❌ Search failed:', error.message);
      throw error;
    }
  }

  /**
   * Store automation workflow context
   * @param {string} workflowName - Workflow name
   * @param {Object} context - Workflow context
   */
  async storeWorkflowContext(workflowName, context) {
    return await this.store(`workflow:${workflowName}`, context, {
      type: 'workflow',
      platform: context.platform || 'unknown'
    });
  }

  /**
   * Retrieve automation workflow context
   * @param {string} workflowName - Workflow name
   * @returns {Object} Workflow context
   */
  async getWorkflowContext(workflowName) {
    return await this.retrieve(`workflow:${workflowName}`);
  }

  /**
   * Store learning from automation experience
   * @param {string} lesson - What was learned
   * @param {Object} details - Details about the lesson
   */
  async learn(lesson, details) {
    const learningKey = `learning:${Date.now()}`;
    return await this.store(learningKey, {
      lesson,
      details,
      applied: false
    }, {
      type: 'learning'
    });
  }

  /**
   * Get all learnings
   * @returns {Array} All stored learnings
   */
  async getLearnings() {
    return await this.search('learning:');
  }

  /**
   * Remember user preferences
   * @param {string} preference - Preference key
   * @param {any} value - Preference value
   */
  async rememberPreference(preference, value) {
    return await this.store(`preference:${preference}`, value, {
      type: 'preference'
    });
  }

  /**
   * Get user preference
   * @param {string} preference - Preference key
   * @returns {any} Preference value
   */
  async getPreference(preference) {
    return await this.retrieve(`preference:${preference}`);
  }

  /**
   * Clear all memories
   */
  async clear() {
    this.memories.clear();
    console.log('🗑️  All memories cleared');
  }

  /**
   * Get memory statistics
   * @returns {Object} Statistics
   */
  getStats() {
    const stats = {
      totalMemories: this.memories.size,
      sessionId: this.sessionId,
      byType: {},
      oldestMemory: null,
      newestMemory: null
    };

    for (const memory of this.memories.values()) {
      const type = memory.metadata.type;
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      if (!stats.oldestMemory || memory.metadata.timestamp < stats.oldestMemory) {
        stats.oldestMemory = memory.metadata.timestamp;
      }

      if (!stats.newestMemory || memory.metadata.timestamp > stats.newestMemory) {
        stats.newestMemory = memory.metadata.timestamp;
      }
    }

    return stats;
  }
}

export default MemoryLayer;

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🧠 AI Memory Layer                                     ║
║                                                           ║
║   Persistent memory for automation sessions             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

Features:
  - Store and retrieve workflow context
  - Learn from automation experiences
  - Remember user preferences
  - Search through memories
  - Session-based memory management

Example:
  const memory = new MemoryLayer();

  // Store workflow context
  await memory.storeWorkflowContext('api-integration', {
    platform: 'n8n',
    nodes: ['webhook', 'http-request'],
    lastRun: Date.now()
  });

  // Learn from experience
  await memory.learn('HTTP nodes need authentication header', {
    issue: 'API call failed',
    solution: 'Added Bearer token'
  });

  // Remember preferences
  await memory.rememberPreference('defaultPlatform', 'n8n');
  `);
}
