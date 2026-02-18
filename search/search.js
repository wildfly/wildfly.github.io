(() => {
  'use strict';

  const WFLYDocSearch = (() => {

    function WFLYDocSearch() {
      this.index = null;
      this.isLoading = true;

      this.addSearchToIndex();
      this.initializeElements();
      this.loadSearchIndex();
      this.bindEvents();
    }

    WFLYDocSearch.prototype.addSearchToIndex = function () {
      // Add search elements to header after page loads
      const header = document.getElementById('header');
      if (header) {
        const h1 = header.querySelector('h1');
        if (h1) {
          // Create wrapper div
          const wrapper = document.createElement('div');
          wrapper.className = 'header-with-search';

          // Create search container
          const searchContainer = document.createElement('div');
          searchContainer.className = 'search-container';
          searchContainer.innerHTML = `
              <input type="text" id="searchInput" class="search-input" placeholder="Search docs..." autocomplete="off">
              <button type="button" id="searchButton" class="search-button">Search</button>
          `;

          // Insert wrapper before h1
          h1.parentNode.insertBefore(wrapper, h1);

          // Move h1 into wrapper
          wrapper.appendChild(h1);

          // Add search container to wrapper
          wrapper.appendChild(searchContainer);
        }
      }
    }

    WFLYDocSearch.prototype.initializeElements = function () {
      this.searchInput = document.getElementById('searchInput');
      this.searchButton = document.getElementById('searchButton');
      this.searchDialog = document.getElementById('searchDialog');
      this.closeDialog = document.getElementById('closeDialog');
      this.searchResults = document.getElementById('searchResults');
      this.dialogBody = this.searchDialog.querySelector('.dialog-body');
      this.dialogSearchInput = document.getElementById('dialogSearchInput');
      this.dialogSearchButton = document.getElementById('dialogSearchButton');
    };

    WFLYDocSearch.prototype.loadSearchIndex = async function () {
      this.setLoadingState(true);

      try {
        this.setButtonState(true);

        // Define all index files to load
        // Those indexes files should be available, otherwise, there could be a delay by loading them
        const indexFiles = [
          'wildfly-doc-index.json',
          'wildfly-glow/wildfly-glow-doc-index.json',
          'wildfly-container/wildfly-container-doc-index.json',
          'wildfly-operator/wildfly-operator-doc-index.json',
          'wildfly-s2i/wildfly-s2i-doc-index.json'
        ];

        // Initialize FlexSearch Document index
        this.index = new FlexSearch.Document({
          encoder: FlexSearch.Charset.Normalize,
          tokenize: 'strict',
          document: {
            id: 'url',
            store: true,
            index: [
              {
                field: 'title',
              },
              {
                field: 'content',
              }
            ]
          }
        });

        // Load and merge all index files
        const allDocuments = [];
        for (const indexFile of indexFiles) {
          try {
            const response = await fetch(indexFile);
            if (response.ok) {
              const documents = await response.json();
              allDocuments.push(...documents);
              console.log(`Loaded ${documents.length} documents from ${indexFile}`);
            } else {
              console.warn(`Failed to load ${indexFile}: HTTP ${response.status}`);
            }
          } catch (error) {
            console.warn(`Failed to load ${indexFile}:`, error.message);
          }
        }

        if (allDocuments.length === 0) {
          throw new Error('No search index files could be loaded');
        }

        // Add all documents to index
        for (let i = 0; i < allDocuments.length; i++) {
          await this.index.add(allDocuments[i]);
        }

        console.log(`Search index initialized with ${allDocuments.length} documents`);
        this.isLoading = false;
        this.setButtonState(false);

      } catch (error) {
        console.error('Failed to load search index:', error);
        this.setButtonState(true);
      } finally {
        this.setLoadingState(false);
      }
    };

    WFLYDocSearch.prototype.bindEvents = function () {
      // Main page search button
      this.searchButton.addEventListener('click', () => {
        this.openDialog();
        this.performSearch();
      });

      // Main page search input
      this.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.openDialog();
          this.performSearch();
        }
      });

      // Dialog search button
      this.dialogSearchButton.addEventListener('click', () => {
        this.performDialogSearch();
      });

      // Dialog search input
      this.dialogSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.performDialogSearch();
        }
      });

      // Close dialog
      this.closeDialog.addEventListener('click', () => {
        this.closeSearchDialog();
      });


      // Close dialog with Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.searchDialog.classList.contains('active')) {
          this.closeSearchDialog();
        }
      });
    };

    WFLYDocSearch.prototype.openDialog = function () {
      this.searchDialog.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Sync search terms from main input to dialog input
      if (this.dialogSearchInput) {
        this.dialogSearchInput.value = this.searchInput.value;
        // Focus on the dialog search input for better UX
        setTimeout(() => {
          this.dialogSearchInput.focus();
        }, 100);
      }
    };

    WFLYDocSearch.prototype.closeSearchDialog = function () {
      this.searchDialog.classList.remove('active');
      this.searchInput.value = '';
      document.body.style.overflow = '';
    };

    WFLYDocSearch.prototype.performDialogSearch = function () {
      if (this.isLoading) {
        this.searchResults.innerHTML = '<div class="loading">Search index is still loading, please wait...</div>';
        this.dialogBody.scrollTop = 0;
        return;
      }

      const query = this.dialogSearchInput.value.trim();
      if (!query) {
        this.searchResults.innerHTML = '<div class="loading">Enter a search term to begin...</div>';
        this.dialogBody.scrollTop = 0;
        return;
      }

      this.performSearchWithQuery(query);
    };

    WFLYDocSearch.prototype.performSearch = function () {
      const query = this.searchInput.value.trim();
      this.performSearchWithQuery(query);
    };

    WFLYDocSearch.prototype.performSearchWithQuery = async function (query) {
      if (this.isLoading) {
        this.searchResults.innerHTML = '<div class="loading">Search index is still loading, please wait...</div>';
        this.dialogBody.scrollTop = 0;
        return;
      }

      if (!query) {
        this.searchResults.innerHTML = '<div class="loading">Enter a search term to begin...</div>';
        this.dialogBody.scrollTop = 0;
        return;
      }

      try {
        const startTime = Date.now();

        // Search in both title and content fields
        const results = await this.index.search({
          query: query,
          enrich: true,
          suggest: true
        });

        const searchTime = Date.now() - startTime;
        this.displayResults(results, query, searchTime);

      } catch (error) {
        console.error('Search error:', error);
        this.searchResults.innerHTML = '<div class="loading">An error occurred during search.</div>';
      }
    };

    WFLYDocSearch.prototype.countHits = function (text, terms) {
      if (!text) return 0;
      const textLower = text.toLowerCase();
      let count = 0;
      for (let i = 0; i < terms.length; i++) {
        let pos = 0;
        while ((pos = textLower.indexOf(terms[i], pos)) !== -1) {
          count++;
          pos += terms[i].length;
        }
      }
      return count;
    };

    WFLYDocSearch.prototype.countDistinctTerms = function (text, terms) {
      if (!text) return 0;
      const textLower = text.toLowerCase();
      let count = 0;
      for (let i = 0; i < terms.length; i++) {
        if (textLower.indexOf(terms[i]) !== -1) {
          count++;
        }
      }
      return count;
    };

    WFLYDocSearch.prototype.displayResults = function (results, query, searchTime) {
      const resultsByUrl = new Map();
      const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 0);

      console.log({ results });
      // FlexSearch returns results grouped by field:
      // [ { field: "title", result: [...] }, { field: "content", result: [...] } ]
      // Use the field property to determine which fields actually matched
      if (Array.isArray(results)) {
        results.forEach(fieldResult => {
          const field = fieldResult.field;
          if (fieldResult.result) {
            fieldResult.result.forEach(item => {
              const url = item.doc.url;
              if (!resultsByUrl.has(url)) {
                item.titleScore = 0;
                item.contentScore = 0;
                item.allTermsInTitle = false;
                item.allTermsInContent = false;
                resultsByUrl.set(url, item);
              }
              const entry = resultsByUrl.get(url);
              if (field === 'title') {
                entry.titleScore = this.countHits(item.doc.title, queryTerms);
                entry.allTermsInTitle = this.countDistinctTerms(item.doc.title, queryTerms) === queryTerms.length;
              } else if (field === 'content') {
                entry.contentScore = this.countHits(item.doc.content, queryTerms);
                entry.allTermsInContent = this.countDistinctTerms(item.doc.content, queryTerms) === queryTerms.length;
              }
            });
          }
        });
      }

      const allResults = Array.from(resultsByUrl.values());

      if (allResults.length === 0) {
        this.searchResults.innerHTML = `
                <div class="no-results">
                    <h3>No results found</h3>
                    <p>Try different keywords or check your spelling.</p>
                </div>
            `;
        this.dialogBody.scrollTop = 0;
        return;
      }

      // Rank results in 8 tiers, prioritizing all terms in title over
      // all terms in content, then partial matches:
      //
      // Tier 0: All terms in title + content hits
      // Tier 1: All terms in title + no content hits
      // Tier 2: All terms in content + title hits
      // Tier 3: All terms in content + no title hits
      // Tier 4: Partial terms + title hits + content hits
      // Tier 5: Partial terms + title hits only
      // Tier 6: Partial terms + content hits only
      // Tier 7: Partial terms + no direct hits
      //
      // Within each tier: sort by titleScore desc, then contentScore desc
      allResults.sort((a, b) => {
        const aHasTitle = a.titleScore > 0;
        const aHasContent = a.contentScore > 0;
        const bHasTitle = b.titleScore > 0;
        const bHasContent = b.contentScore > 0;

        const aTier = a.allTermsInTitle ? (aHasContent ? 0 : 1)
          : a.allTermsInContent ? (aHasTitle ? 2 : 3)
          : (aHasTitle && aHasContent) ? 4 : aHasTitle ? 5 : aHasContent ? 6 : 7;
        const bTier = b.allTermsInTitle ? (bHasContent ? 0 : 1)
          : b.allTermsInContent ? (bHasTitle ? 2 : 3)
          : (bHasTitle && bHasContent) ? 4 : bHasTitle ? 5 : bHasContent ? 6 : 7;

        if (aTier !== bTier) return aTier - bTier;

        if (a.titleScore !== b.titleScore) return b.titleScore - a.titleScore;
        return b.contentScore - a.contentScore;
      });

      const resultsHtml = allResults.map(item => {
        const doc = item.doc;
        const titleSnippet = this.createSnippet(doc.title, query, 100);
        const contentSnippet = this.createSnippet(doc.content, query, 300);

        return `
                <div class="result-item">
                    <a href="${doc.url}" class="result-title" target="_blank" rel="noopener noreferrer">
                        ${titleSnippet}
                    </a>
                    <div class="result-url">${doc.url}</div>
                    <div class="result-content">
                        ${contentSnippet}
                    </div>
                </div>
            `;
      }).join('');

      const statsHtml = `
            <div class="search-stats">
                Found ${allResults.length} result${allResults.length !== 1 ? 's' : ''} for "${query}" in ${searchTime}ms
            </div>
        `;

      this.searchResults.innerHTML = statsHtml + resultsHtml;
      this.dialogBody.scrollTop = 0;
    };

    WFLYDocSearch.prototype.createSnippet = function (text, query, maxLength) {
      if (!text || !query) return this.escapeHtml(text || '');

      const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
      const textLower = text.toLowerCase();

      // Find the first occurrence of any query term
      let firstMatchIndex = -1;
      let matchedTerm = '';

      for (let i = 0; i < queryTerms.length; i++) {
        const term = queryTerms[i];
        const index = textLower.indexOf(term);
        if (index !== -1 && (firstMatchIndex === -1 || index < firstMatchIndex)) {
          firstMatchIndex = index;
          matchedTerm = term;
        }
      }

      let snippet;
      if (firstMatchIndex === -1) {
        // No match found, return truncated text
        snippet = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
      } else {
        // Create snippet around the first match
        const startBuffer = Math.floor((maxLength - matchedTerm.length) / 2);
        const start = Math.max(0, firstMatchIndex - startBuffer);
        const end = Math.min(text.length, start + maxLength);

        snippet = text.substring(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < text.length) snippet = snippet + '...';
      }

      // Highlight query terms
      let highlightedSnippet = this.escapeHtml(snippet);
      queryTerms.forEach(term => {
        const regex = new RegExp(`(${this.escapeRegExp(term)})`, 'gi');
        highlightedSnippet = highlightedSnippet.replace(regex, '<span class="highlight">$1</span>');
      });

      return highlightedSnippet;
    };

    WFLYDocSearch.prototype.escapeHtml = function (text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    WFLYDocSearch.prototype.escapeRegExp = function (string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    WFLYDocSearch.prototype.setButtonState = function (disabled) {
      this.searchButton.disabled = disabled;
      this.searchButton.textContent = disabled ? 'Loading...' : 'Search';

      if (this.dialogSearchButton) {
        this.dialogSearchButton.disabled = disabled;
        this.dialogSearchButton.textContent = disabled ? 'Loading...' : 'Search';
      }
    };

    WFLYDocSearch.prototype.setLoadingState = function (loading) {
      const placeholder = loading ? 'Downloading search index...' : 'Search docs...';

      this.searchInput.placeholder = placeholder;
      if (this.dialogSearchInput) {
        this.dialogSearchInput.placeholder = placeholder;
      }
    };

    return WFLYDocSearch;
  })();

  // Initialize the search when the DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    new WFLYDocSearch();
  });

})();
