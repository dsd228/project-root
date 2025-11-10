// analytics.js - Analytics de Diseño
class DesignAnalytics {
    constructor(editor) {
        this.editor = editor;
        this.analyticsData = {
            sessions: [],
            designStats: {},
            userActions: [],
            performance: {}
        };
        this.init();
    }

    init() {
        this.setupAnalytics();
        this.startSession();
        this.trackInitialData();
    }

    setupAnalytics() {
        this.createAnalyticsPanel();
        this.setupTracking();
    }

    createAnalyticsPanel() {
        const rightSidebar = document.querySelector('.right-sidebar');
        if (!rightSidebar) return;

        const analyticsPanel = document.createElement('div');
        analyticsPanel.className = 'analytics-panel';
        analyticsPanel.innerHTML = `
            <div class="section-header">
                <h3><i class="ri-bar-chart-line"></i> Analytics</h3>
                <button class="icon-btn" id="analytics-settings">
                    <i class="ri-settings-3-line"></i>
                </button>
            </div>
            
            <div class="analytics-tabs">
                <button class="analytics-tab active" data-tab="overview">Overview</button>
                <button class="analytics-tab" data-tab="performance">Performance</button>
                <button class="analytics-tab" data-tab="usage">Usage</button>
            </div>

            <div class="analytics-content">
                <div class="analytics-tab-content active" id="overview-tab">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value" id="total-elements">0</div>
                            <div class="stat-label">Total Elements</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="session-time">0m</div>
                            <div class="stat-label">Session Time</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="actions-count">0</div>
                            <div class="stat-label">Actions</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="design-score">0%</div>
                            <div class="stat-label">Design Score</div>
                        </div>
                    </div>
                    
                    <div class="recent-activity">
                        <h4>Recent Activity</h4>
                        <div class="activity-list" id="activity-list"></div>
                    </div>
                </div>
                
                <div class="analytics-tab-content" id="performance-tab">
                    <div class="performance-metrics">
                        <div class="metric">
                            <label>Render Performance</label>
                            <div class="metric-bar">
                                <div class="metric-fill" id="render-performance" style="width: 0%"></div>
                            </div>
                            <span id="render-time">0ms</span>
                        </div>
                        <div class="metric">
                            <label>Memory Usage</label>
                            <div class="metric-bar">
                                <div class="metric-fill" id="memory-usage" style="width: 0%"></div>
                            </div>
                            <span id="memory-value">0MB</span>
                        </div>
                        <div class="metric">
                            <label>Interaction Speed</label>
                            <div class="metric-bar">
                                <div class="metric-fill" id="interaction-speed" style="width: 0%"></div>
                            </div>
                            <span id="interaction-value">0ms</span>
                        </div>
                    </div>
                </div>
                
                <div class="analytics-tab-content" id="usage-tab">
                    <div class="usage-stats">
                        <div class="usage-chart" id="tool-usage-chart">
                            <h4>Tool Usage</h4>
                            <div class="chart-placeholder">
                                <p>Tool usage data will appear here</p>
                            </div>
                        </div>
                        <div class="usage-chart" id="element-usage-chart">
                            <h4>Element Types</h4>
                            <div class="chart-placeholder">
                                <p>Element type distribution will appear here</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="analytics-actions">
                <button class="btn-secondary" onclick="editorApp.analytics.exportAnalytics()">
                    Export Data
                </button>
                <button class="btn-primary" onclick="editorApp.analytics.showInsights()">
                    Get Insights
                </button>
            </div>
        `;

        rightSidebar.appendChild(analyticsPanel);
        this.setupAnalyticsTabs();
        this.updateAnalyticsDisplay();
    }

    setupAnalyticsTabs() {
        document.querySelectorAll('.analytics-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.analytics-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.analytics-tab-content').forEach(c => c.classList.remove('active'));
                
                e.target.classList.add('active');
                document.getElementById(`${e.target.dataset.tab}-tab`).classList.add('active');
            });
        });
    }

    setupTracking() {
        this.trackUserActions();
        this.trackPerformance();
        this.trackDesignChanges();
    }

    startSession() {
        this.currentSession = {
            id: `session_${Date.now()}`,
            startTime: new Date().toISOString(),
            actions: [],
            elementsCreated: 0,
            elementsModified: 0,
            toolsUsed: new Set()
        };

        this.analyticsData.sessions.push(this.currentSession);
        
        this.sessionTimer = setInterval(() => {
            this.updateSessionTime();
        }, 60000);
    }

    trackUserActions() {
        const originalSelectTool = this.editor.selectElement.bind(this.editor);
        this.editor.selectElement = (...args) => {
            this.trackAction('tool_used', { tool: 'select' });
            return originalSelectTool(...args);
        };

        const originalCreateRectangle = this.editor.createRectangle.bind(this.editor);
        this.editor.createRectangle = (...args) => {
            this.trackAction('element_created', { type: 'rectangle' });
            this.currentSession.elementsCreated++;
            return originalCreateRectangle(...args);
        };

        const originalDeleteSelected = this.editor.deleteSelected.bind(this.editor);
        this.editor.deleteSelected = (...args) => {
            if (this.editor.selectedElement) {
                this.trackAction('element_deleted', { type: this.editor.selectedElement.type });
            }
            return originalDeleteSelected(...args);
        };
    }

    trackPerformance() {
        const originalRender = this.editor.render.bind(this.editor);
        this.editor.render = (...args) => {
            const startTime = performance.now();
            const result = originalRender(...args);
            const renderTime = performance.now() - startTime;
            
            this.trackPerformanceMetric('render', renderTime);
            return result;
        };

        this.performanceInterval = setInterval(() => {
            this.trackMemoryUsage();
        }, 10000);
    }

    trackDesignChanges() {
        let lastElementsHash = '';
        
        this.designChangeInterval = setInterval(() => {
            const currentHash = this.getElementsHash();
            if (currentHash !== lastElementsHash) {
                this.trackAction('design_modified', {});
                lastElementsHash = currentHash;
                this.updateDesignStats();
            }
        }, 5000);
    }

    trackAction(action, data) {
        const actionRecord = {
            action,
            timestamp: new Date().toISOString(),
            data,
            sessionId: this.currentSession.id
        };

        this.analyticsData.userActions.push(actionRecord);
        this.currentSession.actions.push(actionRecord);
        
        this.updateRecentActivity(actionRecord);
        this.updateStatsDisplay();
    }

    trackPerformanceMetric(metric, value) {
        if (!this.analyticsData.performance[metric]) {
            this.analyticsData.performance[metric] = [];
        }
        
        this.analyticsData.performance[metric].push({
            value,
            timestamp: new Date().toISOString()
        });

        if (this.analyticsData.performance[metric].length > 100) {
            this.analyticsData.performance[metric].shift();
        }

        this.updatePerformanceDisplay();
    }

    trackMemoryUsage() {
        const memoryUsage = Math.round(JSON.stringify(this.editor.elements).length / 1024);
        this.trackPerformanceMetric('memory', memoryUsage);
    }

    updateSessionTime() {
        const startTime = new Date(this.currentSession.startTime);
        const currentTime = new Date();
        const minutes = Math.round((currentTime - startTime) / 60000);
        
        this.currentSession.duration = minutes;
        this.updateStatsDisplay();
    }

    updateDesignStats() {
        const elements = this.editor.elements;
        
        this.analyticsData.designStats = {
            totalElements: elements.length,
            elementTypes: this.countElementTypes(elements),
            colorUsage: this.analyzeColorUsage(elements),
            typography: this.analyzeTypography(elements),
            layoutScore: this.calculateLayoutScore(elements)
        };

        this.updateStatsDisplay();
    }

    countElementTypes(elements) {
        const counts = {};
        elements.forEach(element => {
            counts[element.type] = (counts[element.type] || 0) + 1;
        });
        return counts;
    }

    analyzeColorUsage(elements) {
        const colors = new Set();
        elements.forEach(element => {
            if (element.fill && element.fill !== 'transparent') {
                colors.add(element.fill);
            }
        });
        return {
            uniqueColors: colors.size,
            colorPalette: Array.from(colors)
        };
    }

    analyzeTypography(elements) {
        const fonts = new Set();
        const sizes = new Set();
        
        elements.forEach(element => {
            if (element.type === 'text') {
                if (element.fontFamily) fonts.add(element.fontFamily);
                if (element.fontSize) sizes.add(element.fontSize);
            }
        });

        return {
            fontFamilies: fonts.size,
            fontSizeVariety: sizes.size
        };
    }

    calculateLayoutScore(elements) {
        let score = 50;
        
        if (elements.length > 5) score += 10;
        if (elements.length > 10) score += 10;
        
        const types = this.countElementTypes(elements);
        const typeCount = Object.keys(types).length;
        if (typeCount > 1) score += 10;
        if (typeCount > 2) score += 10;
        
        return Math.min(100, score);
    }

    updateAnalyticsDisplay() {
        this.updateStatsDisplay();
        this.updatePerformanceDisplay();
        this.updateRecentActivity();
    }

    updateStatsDisplay() {
        const totalElements = document.getElementById('total-elements');
        const sessionTime = document.getElementById('session-time');
        const actionsCount = document.getElementById('actions-count');
        const designScore = document.getElementById('design-score');

        if (totalElements) {
            totalElements.textContent = this.editor.elements.length;
        }

        if (sessionTime) {
            const minutes = this.currentSession.duration || 0;
            sessionTime.textContent = `${minutes}m`;
        }

        if (actionsCount) {
            actionsCount.textContent = this.currentSession.actions.length;
        }

        if (designScore) {
            const score = this.analyticsData.designStats.layoutScore || 0;
            designScore.textContent = `${score}%`;
        }
    }

    updatePerformanceDisplay() {
        const renderTime = document.getElementById('render-time');
        const memoryValue = document.getElementById('memory-value');
        const interactionValue = document.getElementById('interaction-value');

        const renderMetrics = this.analyticsData.performance.render || [];
        const memoryMetrics = this.analyticsData.performance.memory || [];

        if (renderTime && renderMetrics.length > 0) {
            const avgRenderTime = renderMetrics.reduce((a, b) => a + b.value, 0) / renderMetrics.length;
            renderTime.textContent = `${avgRenderTime.toFixed(1)}ms`;
            
            const renderPerformance = document.getElementById('render-performance');
            if (renderPerformance) {
                const performancePercent = Math.max(0, 100 - (avgRenderTime / 16) * 100);
                renderPerformance.style.width = `${performancePercent}%`;
            }
        }

        if (memoryValue && memoryMetrics.length > 0) {
            const currentMemory = memoryMetrics[memoryMetrics.length - 1].value;
            memoryValue.textContent = `${currentMemory}KB`;
            
            const memoryUsage = document.getElementById('memory-usage');
            if (memoryUsage) {
                const memoryPercent = Math.min(100, (currentMemory / 1024) * 100);
                memoryUsage.style.width = `${memoryPercent}%`;
            }
        }
    }

    updateRecentActivity(latestAction = null) {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;

        const recentActions = this.analyticsData.userActions.slice(-5).reverse();
        
        activityList.innerHTML = recentActions.map(action => {
            const time = new Date(action.timestamp).toLocaleTimeString();
            let description = '';
            
            switch (action.action) {
                case 'element_created':
                    description = `Created ${action.data.type}`;
                    break;
                case 'element_deleted':
                    description = `Deleted ${action.data.type}`;
                    break;
                case 'tool_used':
                    description = `Used ${action.data.tool} tool`;
                    break;
                case 'design_modified':
                    description = 'Modified design';
                    break;
                default:
                    description = action.action;
            }
            
            return `
                <div class="activity-item">
                    <div class="activity-icon">📝</div>
                    <div class="activity-content">
                        <div class="activity-desc">${description}</div>
                        <div class="activity-time">${time}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getElementsHash() {
        return JSON.stringify(this.editor.elements.map(el => ({
            type: el.type,
            x: el.x,
            y: el.y,
            width: el.width,
            height: el.height
        })));
    }

    exportAnalytics() {
        const analyticsExport = {
            summary: {
                totalSessions: this.analyticsData.sessions.length,
                totalActions: this.analyticsData.userActions.length,
                totalElementsCreated: this.analyticsData.userActions.filter(a => a.action === 'element_created').length,
                currentSession: this.currentSession
            },
            designStats: this.analyticsData.designStats,
            performance: this.analyticsData.performance,
            recentActions: this.analyticsData.userActions.slice(-50)
        };

        const blob = new Blob([JSON.stringify(analyticsExport, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = `design-analytics-${Date.now()}.json`;
        link.href = URL.createObjectURL(blob);
        link.click();
        
        this.editor.showNotification('📊 Analytics data exported');
    }

    showInsights() {
        const insights = this.generateInsights();
        this.showInsightsModal(insights);
    }

    generateInsights() {
        const stats = this.analyticsData.designStats;
        const actions = this.analyticsData.userActions;
        
        const insights = [];

        if (stats.elementTypes) {
            const elementTypes = Object.keys(stats.elementTypes);
            if (elementTypes.length === 1) {
                insights.push('Consider adding more element types for visual variety');
            }
        }

        if (stats.colorUsage && stats.colorUsage.uniqueColors < 2) {
            insights.push('Try using more colors to create visual interest');
        }

        if (stats.typography && stats.typography.fontFamilies < 2) {
            insights.push('Using multiple font families can improve hierarchy');
        }

        const createActions = actions.filter(a => a.action === 'element_created').length;
        const deleteActions = actions.filter(a => a.action === 'element_deleted').length;
        
        if (deleteActions > createActions * 0.5) {
            insights.push('You might be deleting too many elements - consider using undo/redo more');
        }

        const renderTimes = this.analyticsData.performance.render || [];
        if (renderTimes.length > 0) {
            const avgRenderTime = renderTimes.reduce((a, b) => a + b.value, 0) / renderTimes.length;
            if (avgRenderTime > 30) {
                insights.push('Consider optimizing your design for better performance');
            }
        }

        return insights.length > 0 ? insights : ['Great work! Your design habits look good.'];
    }

    showInsightsModal(insights) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Design Insights</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="insights-list">
                        ${insights.map(insight => `
                            <div class="insight-item">
                                <i class="ri-lightbulb-flash-line"></i>
                                <span>${insight}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="insights-actions">
                        <button class="btn-primary" onclick="this.closest('.modal').remove()">
                            Got it!
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        modal.querySelector('.close').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    cleanup() {
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
        }
        if (this.performanceInterval) {
            clearInterval(this.performanceInterval);
        }
        if (this.designChangeInterval) {
            clearInterval(this.designChangeInterval);
        }
    }

    saveAnalytics() {
        try {
            localStorage.setItem('editor-analytics', JSON.stringify(this.analyticsData));
        } catch (error) {
            console.error('Error saving analytics:', error);
        }
    }

    loadAnalytics() {
        try {
            const saved = localStorage.getItem('editor-analytics');
            if (saved) {
                this.analyticsData = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    }
}