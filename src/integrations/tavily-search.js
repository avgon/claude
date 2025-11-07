#!/usr/bin/env node

/**
 * Tavily AI Web Search Integration
 * Purpose: Web search capabilities for automation research
 */

import { tavily } from '@tavily/core';
import dotenv from 'dotenv';

dotenv.config();

class TavilySearch {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.TAVILY_API_KEY;

    if (!this.apiKey) {
      throw new Error('TAVILY_API_KEY is required. Get one at https://tavily.com');
    }

    this.client = tavily({ apiKey: this.apiKey });
  }

  /**
   * Search the web with Tavily
   * @param {string} query - Search query
   * @param {Object} options - Search options
   */
  async search(query, options = {}) {
    try {
      console.log(`🔍 Searching: "${query}"`);

      const result = await this.client.search(query, {
        maxResults: options.maxResults || 5,
        searchDepth: options.searchDepth || 'advanced',
        includeAnswer: options.includeAnswer !== false,
        includeRawContent: options.includeRawContent || false,
        includeDomains: options.includeDomains || [],
        excludeDomains: options.excludeDomains || [],
        ...options
      });

      console.log('✅ Search completed');
      return result;
    } catch (error) {
      console.error('❌ Search failed:', error.message);
      throw error;
    }
  }

  /**
   * Search specifically for automation documentation
   */
  async searchAutomationDocs(platform, query) {
    const domains = {
      'n8n': ['docs.n8n.io', 'n8n.io'],
      'make': ['make.com', 'help.make.com'],
      'weavy': ['weavy.io', 'docs.weavy.io']
    };

    return await this.search(query, {
      includeDomains: domains[platform] || [],
      maxResults: 3,
      searchDepth: 'advanced'
    });
  }

  /**
   * Get quick answer without detailed results
   */
  async quickAnswer(query) {
    const result = await this.search(query, {
      maxResults: 1,
      includeAnswer: true
    });

    return result.answer;
  }

  /**
   * Search for API documentation
   */
  async searchApiDocs(apiName) {
    return await this.search(`${apiName} API documentation`, {
      includeDomains: ['docs.', 'developer.', 'api.'],
      maxResults: 5
    });
  }
}

export default TavilySearch;

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🔍 Tavily AI Web Search Integration                    ║
║                                                           ║
║   Real-time web search for AI agents                     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

Features:
  - Fast, LLM-optimized search results
  - Domain filtering for targeted searches
  - API documentation search
  - Quick answers without full results

Example:
  const search = new TavilySearch();
  const results = await search.search('n8n webhook setup');
  const docs = await search.searchAutomationDocs('n8n', 'HTTP request node');
  `);

  // Example usage
  if (process.argv[2]) {
    const search = new TavilySearch();
    const results = await search.search(process.argv.slice(2).join(' '));
    console.log('\nResults:', JSON.stringify(results, null, 2));
  }
}
