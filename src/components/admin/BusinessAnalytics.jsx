import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BusinessAnalytics.css';

const BusinessAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('month');
  const [customRange, setCustomRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [analyticsData, setAnalyticsData] = useState({
    customerMetrics: {
      totalCustomers: 0,
      newCustomers: 0,
      returningCustomers: 0,
      customerRetentionRate: 0,
      averageServicePerCustomer: 0
    },
    serviceMetrics: {
      totalServices: 0,
      servicesByType: {},
      mostPopularService: '',
      averageServiceValue: 0
    },
    businessGrowth: {
      revenueGrowth: 0,
      customerGrowth: 0,
      serviceGrowth: 0
    },
    geographicData: {
      servicesByZipCode: {}
    },
    contractorPerformance: {
      topPerformers: [],
      averageRating: 0
    }
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, customRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Calculate date range based on selection
      const { startDate, endDate } = calculateDateRange();
      
      // In a real implementation, this would fetch data from the server
      // For now, we'll simulate a delay and generate mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock data
      const mockData = generateMockAnalyticsData(startDate, endDate);
      setAnalyticsData(mockData);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDateRange = () => {
    const today = new Date();
    let startDate, endDate;
    
    switch (timeRange) {
      case 'week':
        startDate = new Date(today.setDate(today.getDate() - today.getDay()));
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date();
        break;
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), quarter * 3, 1);
        endDate = new Date();
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date();
        break;
      case 'custom':
        startDate = new Date(customRange.startDate);
        endDate = new Date(customRange.endDate);
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date();
    }
    
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  };

  const generateMockAnalyticsData = (startDate, endDate) => {
    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate date difference in days
    const dateDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    // Generate random data based on date range
    const totalCustomers = 100 + Math.floor(Math.random() * 200);
    const newCustomers = Math.floor(totalCustomers * (0.1 + Math.random() * 0.2));
    const returningCustomers = totalCustomers - newCustomers;
    
    const totalServices = totalCustomers * (1 + Math.random() * 0.5);
    
    // Service types and their distribution
    const serviceTypes = {
      'standard': 0.5,
      'deep': 0.25,
      'move-in': 0.1,
      'move-out': 0.1,
      'commercial': 0.05
    };
    
    // Calculate services by type
    const servicesByType = {};
    Object.keys(serviceTypes).forEach(type => {
      servicesByType[type] = Math.floor(totalServices * serviceTypes[type] * (0.9 + Math.random() * 0.2));
    });
    
    // Find most popular service
    let mostPopularService = '';
    let maxServices = 0;
    Object.keys(servicesByType).forEach(type => {
      if (servicesByType[type] > maxServices) {
        maxServices = servicesByType[type];
        mostPopularService = type;
      }
    });
    
    // Generate zip code distribution
    const zipCodes = ['78201', '78202', '78203', '78204', '78205', '78206', '78207', '78208', '78209', '78210'];
    const servicesByZipCode = {};
    zipCodes.forEach(zip => {
      servicesByZipCode[zip] = Math.floor(totalServices * (0.05 + Math.random() * 0.15));
    });
    
    // Generate top performers
    const topPerformers = [
      { name: 'John Smith', rating: 4.9, services: 45, revenue: 5400 },
      { name: 'Maria Garcia', rating: 4.8, services: 42, revenue: 5040 },
      { name: 'David Johnson', rating: 4.7, services: 38, revenue: 4560 },
      { name: 'Sarah Williams', rating: 4.6, services: 36, revenue: 4320 },
      { name: 'Michael Brown', rating: 4.5, services: 33, revenue: 3960 }
    ];
    
    // Calculate average rating
    const averageRating = topPerformers.reduce((sum, performer) => sum + performer.rating, 0) / topPerformers.length;
    
    // Calculate growth metrics (compared to previous period)
    const revenueGrowth = (Math.random() * 0.3) - 0.05; // -5% to +25%
    const customerGrowth = (Math.random() * 0.25) - 0.05; // -5% to +20%
    const serviceGrowth = (Math.random() * 0.2) - 0.02; // -2% to +18%
    
    return {
      customerMetrics: {
        totalCustomers,
        newCustomers,
        returningCustomers,
        customerRetentionRate: Math.round((returningCustomers / totalCustomers) * 100),
        averageServicePerCustomer: +(totalServices / totalCustomers).toFixed(2)
      },
      serviceMetrics: {
        totalServices: Math.floor(totalServices),
        servicesByType,
        mostPopularService,
        averageServiceValue: 120 + Math.floor(Math.random() * 50)
      },
      businessGrowth: {
        revenueGrowth,
        customerGrowth,
        serviceGrowth
      },
      geographicData: {
        servicesByZipCode
      },
      contractorPerformance: {
        topPerformers,
        averageRating
      }
    };
  };

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  const handleCustomRangeChange = (e) => {
    setCustomRange({
      ...customRange,
      [e.target.name]: e.target.value
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const renderOverview = () => {
    const { customerMetrics, serviceMetrics, businessGrowth } = analyticsData;
    
    return (
      <div className="analytics-overview">
        <div className="metrics-cards">
          <div className="metric-card">
            <div className="metric-icon customers-icon">👥</div>
            <div className="metric-content">
              <h3>Total Customers</h3>
              <div className="metric-value">{customerMetrics.totalCustomers}</div>
              <div className="metric-detail">
                <span className={`growth ${businessGrowth.customerGrowth >= 0 ? 'positive' : 'negative'}`}>
                  {businessGrowth.customerGrowth >= 0 ? '↑' : '↓'} {formatPercentage(Math.abs(businessGrowth.customerGrowth))}
                </span>
                <span>vs previous period</span>
              </div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon services-icon">🧹</div>
            <div className="metric-content">
              <h3>Total Services</h3>
              <div className="metric-value">{serviceMetrics.totalServices}</div>
              <div className="metric-detail">
                <span className={`growth ${businessGrowth.serviceGrowth >= 0 ? 'positive' : 'negative'}`}>
                  {businessGrowth.serviceGrowth >= 0 ? '↑' : '↓'} {formatPercentage(Math.abs(businessGrowth.serviceGrowth))}
                </span>
                <span>vs previous period</span>
              </div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon revenue-icon">💰</div>
            <div className="metric-content">
              <h3>Revenue Growth</h3>
              <div className="metric-value">{formatPercentage(Math.abs(businessGrowth.revenueGrowth))}</div>
              <div className="metric-detail">
                <span className={`growth ${businessGrowth.revenueGrowth >= 0 ? 'positive' : 'negative'}`}>
                  {businessGrowth.revenueGrowth >= 0 ? '↑' : '↓'}
                </span>
                <span>vs previous period</span>
              </div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon retention-icon">🔄</div>
            <div className="metric-content">
              <h3>Customer Retention</h3>
              <div className="metric-value">{customerMetrics.customerRetentionRate}%</div>
              <div className="metric-detail">
                <span>{customerMetrics.returningCustomers} returning customers</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="analytics-sections">
          <div className="analytics-section">
            <h3>Service Distribution</h3>
            <div className="service-distribution">
              <div className="chart-container">
                {/* In a real implementation, this would be a proper chart component */}
                <div className="pie-chart-placeholder">
                  {Object.entries(serviceMetrics.servicesByType).map(([type, count], index) => {
                    const percentage = count / serviceMetrics.totalServices;
                    const color = getServiceColor(type);
                    const rotation = index === 0 ? 0 : Object.entries(serviceMetrics.servicesByType)
                      .slice(0, index)
                      .reduce((sum, [_, prevCount]) => sum + (prevCount / serviceMetrics.totalServices * 360), 0);
                    
                    return (
                      <div 
                        key={type}
                        className="pie-segment"
                        style={{
                          backgroundColor: color,
                          transform: `rotate(${rotation}deg)`,
                          clipPath: `polygon(50% 50%, 50% 0%, ${percentage * 360 <= 180 ? '100% 0%' : '100% 0%, 100% 100%'}, ${percentage * 360 >= 270 ? '0% 100%, 0% 0%' : percentage * 360 >= 180 ? '0% 100%' : '50% 50%'})`
                        }}
                        title={`${formatServiceType(type)}: ${count} services (${(percentage * 100).toFixed(1)}%)`}
                      ></div>
                    );
                  })}
                </div>
              </div>
              
              <div className="chart-legend">
                {Object.entries(serviceMetrics.servicesByType).map(([type, count]) => (
                  <div key={type} className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: getServiceColor(type) }}></span>
                    <span className="legend-label">{formatServiceType(type)}</span>
                    <span className="legend-value">{count} ({((count / serviceMetrics.totalServices) * 100).toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="analytics-section">
            <h3>Geographic Distribution</h3>
            <div className="geographic-distribution">
              <div className="zip-code-chart">
                {Object.entries(analyticsData.geographicData.servicesByZipCode).map(([zipCode, count]) => {
                  const percentage = count / serviceMetrics.totalServices;
                  return (
                    <div key={zipCode} className="zip-code-bar">
                      <div className="zip-code-label">{zipCode}</div>
                      <div className="zip-code-bar-container">
                        <div 
                          className="zip-code-bar-fill"
                          style={{ 
                            width: `${percentage * 100}%`,
                            backgroundColor: `hsl(${Math.floor(percentage * 240)}, 70%, 60%)`
                          }}
                        ></div>
                      </div>
                      <div className="zip-code-value">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomerAnalytics = () => {
    const { customerMetrics } = analyticsData;
    
    return (
      <div className="customer-analytics">
        <div className="metrics-cards">
          <div className="metric-card">
            <div className="metric-content">
              <h3>Total Customers</h3>
              <div className="metric-value">{customerMetrics.totalCustomers}</div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-content">
              <h3>New Customers</h3>
              <div className="metric-value">{customerMetrics.newCustomers}</div>
              <div className="metric-detail">
                <span>{((customerMetrics.newCustomers / customerMetrics.totalCustomers) * 100).toFixed(1)}% of total</span>
              </div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-content">
              <h3>Returning Customers</h3>
              <div className="metric-value">{customerMetrics.returningCustomers}</div>
              <div className="metric-detail">
                <span>{((customerMetrics.returningCustomers / customerMetrics.totalCustomers) * 100).toFixed(1)}% of total</span>
              </div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-content">
              <h3>Avg. Services per Customer</h3>
              <div className="metric-value">{customerMetrics.averageServicePerCustomer}</div>
            </div>
          </div>
        </div>
        
        <div className="analytics-section">
          <h3>Customer Acquisition & Retention</h3>
          <div className="customer-funnel">
            <div className="funnel-stage">
              <div className="funnel-label">Website Visitors</div>
              <div className="funnel-value">{Math.floor(customerMetrics.totalCustomers * 10)}</div>
              <div className="funnel-bar" style={{ width: '100%' }}></div>
            </div>
            
            <div className="funnel-stage">
              <div className="funnel-label">Estimate Requests</div>
              <div className="funnel-value">{Math.floor(customerMetrics.totalCustomers * 3)}</div>
              <div className="funnel-bar" style={{ width: '80%' }}></div>
            </div>
            
            <div className="funnel-stage">
              <div className="funnel-label">Appointments Booked</div>
              <div className="funnel-value">{Math.floor(customerMetrics.totalCustomers * 1.5)}</div>
              <div className="funnel-bar" style={{ width: '60%' }}></div>
            </div>
            
            <div className="funnel-stage">
              <div className="funnel-label">Services Completed</div>
              <div className="funnel-value">{analyticsData.serviceMetrics.totalServices}</div>
              <div className="funnel-bar" style={{ width: '40%' }}></div>
            </div>
            
            <div className="funnel-stage">
              <div className="funnel-label">Repeat Customers</div>
              <div className="funnel-value">{customerMetrics.returningCustomers}</div>
              <div className="funnel-bar" style={{ width: '30%' }}></div>
            </div>
          </div>
        </div>
        
        <div className="analytics-section">
          <h3>Customer Lifetime Value</h3>
          <div className="customer-ltv">
            <div className="ltv-calculation">
              <div className="ltv-formula">
                <div className="ltv-component">
                  <div className="ltv-label">Avg. Service Value</div>
                  <div className="ltv-value">{formatCurrency(analyticsData.serviceMetrics.averageServiceValue)}</div>
                </div>
                <div className="ltv-operator">×</div>
                <div className="ltv-component">
                  <div className="ltv-label">Avg. Services per Year</div>
                  <div className="ltv-value">{(customerMetrics.averageServicePerCustomer * 12 / timeRangeFactor()).toFixed(1)}</div>
                </div>
                <div className="ltv-operator">×</div>
                <div className="ltv-component">
                  <div className="ltv-label">Avg. Customer Lifespan (Years)</div>
                  <div className="ltv-value">2.5</div>
                </div>
                <div className="ltv-operator">=</div>
                <div className="ltv-component ltv-result">
                  <div className="ltv-label">Customer LTV</div>
                  <div className="ltv-value">{formatCurrency(analyticsData.serviceMetrics.averageServiceValue * (customerMetrics.averageServicePerCustomer * 12 / timeRangeFactor()) * 2.5)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContractorAnalytics = () => {
    const { contractorPerformance } = analyticsData;
    
    return (
      <div className="contractor-analytics">
        <div className="metrics-cards">
          <div className="metric-card">
            <div className="metric-content">
              <h3>Average Rating</h3>
              <div className="metric-value">{contractorPerformance.averageRating.toFixed(1)}</div>
              <div className="metric-detail">
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span 
                      key={star} 
                      className={`star ${star <= Math.round(contractorPerformance.averageRating) ? 'filled' : ''}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-content">
              <h3>Total Contractors</h3>
              <div className="metric-value">{contractorPerformance.topPerformers.length}</div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-content">
              <h3>Avg. Services per Contractor</h3>
              <div className="metric-value">
                {(analyticsData.serviceMetrics.totalServices / contractorPerformance.topPerformers.length).toFixed(1)}
              </div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-content">
              <h3>Avg. Revenue per Contractor</h3>
              <div className="metric-value">
                {formatCurrency(analyticsData.serviceMetrics.totalServices * analyticsData.serviceMetrics.averageServiceValue / contractorPerformance.topPerformers.length)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="analytics-section">
          <h3>Top Performing Contractors</h3>
          <div className="top-performers">
            <table className="performers-table">
              <thead>
                <tr>
                  <th>Contractor</th>
                  <th>Rating</th>
                  <th>Services</th>
                  <th>Revenue</th>
                  <th>Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {contractorPerformance.topPerformers.map((performer, index) => (
                  <tr key={index}>
                    <td>{performer.name}</td>
                    <td>
                      <div className="table-rating">
                        <span className="rating-value">{performer.rating.toFixed(1)}</span>
                        <div className="star-rating small">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span 
                              key={star} 
                              className={`star ${star <= Math.round(performer.rating) ? 'filled' : ''}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td>{performer.services}</td>
                    <td>{formatCurrency(performer.revenue)}</td>
                    <td>
                      <div className="efficiency-bar">
                        <div 
                          className="efficiency-fill"
                          style={{ 
                            width: `${(performer.services / Math.max(...contractorPerformance.topPerformers.map(p => p.services))) * 100}%`,
                            backgroundColor: `hsl(${120 * (performer.rating / 5)}, 70%, 50%)`
                          }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="analytics-section">
          <h3>Contractor Utilization</h3>
          <div className="contractor-utilization">
            <div className="utilization-chart">
              {contractorPerformance.topPerformers.map((performer, index) => {
                const utilizationPercentage = performer.services / (50 + Math.random() * 10);
                return (
                  <div key={index} className="utilization-bar">
                    <div className="utilization-label">{performer.name}</div>
                    <div className="utilization-bar-container">
                      <div 
                        className="utilization-bar-fill"
                        style={{ 
                          width: `${utilizationPercentage * 100}%`,
                          backgroundColor: getUtilizationColor(utilizationPercentage)
                        }}
                      ></div>
                      <div className="utilization-target" style={{ left: '80%' }}></div>
                    </div>
                    <div className="utilization-value">{(utilizationPercentage * 100).toFixed(0)}%</div>
                  </div>
                );
              })}
            </div>
            <div className="utilization-legend">
              <div className="legend-item">
                <div className="legend-marker target-marker"></div>
                <span>Target Utilization (80%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const timeRangeFactor = () => {
    switch (timeRange) {
      case 'week': return 52;
      case 'month': return 12;
      case 'quarter': return 4;
      case 'year': return 1;
      case 'custom': 
        const start = new Date(customRange.startDate);
        const end = new Date(customRange.endDate);
        const days = (end - start) / (1000 * 60 * 60 * 24);
        return 365 / days;
      default: return 12;
    }
  };

  const formatServiceType = (type) => {
    if (!type) return 'Unknown';
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getServiceColor = (type) => {
    const colors = {
      'standard': '#4a90e2',
      'deep': '#50c878',
      'move-in': '#9370db',
      'move-out': '#f5a623',
      'commercial': '#e74c3c'
    };
    
    return colors[type] || '#999999';
  };

  const getUtilizationColor = (percentage) => {
    if (percentage < 0.5) return '#e74c3c'; // Red - underutilized
    if (percentage < 0.7) return '#f5a623'; // Orange - below target
    if (percentage < 0.9) return '#50c878'; // Green - optimal
    return '#9370db'; // Purple - potential overutilization
  };

  return (
    <div className="business-analytics">
      <div className="analytics-header">
        <div className="time-filter">
          <select value={timeRange} onChange={handleTimeRangeChange}>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
          
          {timeRange === 'custom' && (
            <div className="custom-range">
              <input
                type="date"
                name="startDate"
                value={customRange.startDate}
                onChange={handleCustomRangeChange}
              />
              <span>to</span>
              <input
                type="date"
                name="endDate"
                value={customRange.endDate}
                onChange={handleCustomRangeChange}
              />
            </div>
          )}
        </div>
        
        <div className="actions">
          <button className="export-btn">Export Report</button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-message">Loading analytics data...</div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="analytics-tabs">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => handleTabChange('customers')}
            >
              Customer Analytics
            </button>
            <button 
              className={`tab-btn ${activeTab === 'contractors' ? 'active' : ''}`}
              onClick={() => handleTabChange('contractors')}
            >
              Contractor Analytics
            </button>
          </div>
          
          <div className="analytics-content">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'customers' && renderCustomerAnalytics()}
            {activeTab === 'contractors' && renderContractorAnalytics()}
          </div>
        </>
      )}
    </div>
  );
};

export default BusinessAnalytics; 