import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FinancialReports.css';

const FinancialReports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [report, setReport] = useState(null);
  const [dateRange, setDateRange] = useState('month');
  const [customRange, setCustomRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [filters, setFilters] = useState({
    serviceType: '',
    paymentMethod: '',
    status: ''
  });
  const [activeTab, setActiveTab] = useState('summary');
  const [chartData, setChartData] = useState(null);
  const [mockDataGenerated, setMockDataGenerated] = useState(false);

  useEffect(() => {
    fetchFinancialData();
  }, [dateRange, customRange, filters]);

  const fetchFinancialData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Calculate date range based on selection
      const { startDate, endDate } = calculateDateRange();
      
      // Fetch financial report
      const reportResponse = await axios.get('/api/financial-reports', {
        params: {
          startDate,
          endDate,
          ...filters
        }
      });
      
      if (reportResponse.data) {
        setReport(reportResponse.data);
        setTransactions(reportResponse.data.transactions || []);
        prepareChartData(reportResponse.data);
      }
    } catch (err) {
      console.error('Error fetching financial data:', err);
      setError('Failed to load financial data. Please try again later.');
      
      // Check if we need to generate mock data
      if (err.response && err.response.status === 404) {
        setError('No financial data found. You can generate mock data for testing.');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateDateRange = () => {
    const today = new Date();
    let startDate, endDate;
    
    switch (dateRange) {
      case 'today':
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date();
        break;
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

  const prepareChartData = (reportData) => {
    if (!reportData || !reportData.serviceTypeBreakdown) return;
    
    // Prepare data for service type breakdown chart
    const serviceLabels = Object.keys(reportData.serviceTypeBreakdown);
    const serviceData = serviceLabels.map(label => reportData.serviceTypeBreakdown[label].revenue);
    
    setChartData({
      serviceBreakdown: {
        labels: serviceLabels,
        data: serviceData
      }
    });
  };

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };

  const handleCustomRangeChange = (e) => {
    setCustomRange({
      ...customRange,
      [e.target.name]: e.target.value
    });
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const generateMockData = async () => {
    try {
      setLoading(true);
      await axios.post('/api/generate-mock-transactions', { count: 50 });
      setMockDataGenerated(true);
      fetchFinancialData();
    } catch (err) {
      console.error('Error generating mock data:', err);
      setError('Failed to generate mock data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderSummary = () => {
    if (!report || !report.summary) return null;
    
    const { summary, serviceTypeBreakdown } = report;
    
    return (
      <div className="financial-summary">
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-icon revenue-icon">💰</div>
            <div className="card-content">
              <h3>Total Revenue</h3>
              <div className="card-value">{formatCurrency(summary.totalRevenue)}</div>
              <div className="card-detail">
                <span>Net: {formatCurrency(summary.netRevenue)}</span>
              </div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-icon transactions-icon">🧾</div>
            <div className="card-content">
              <h3>Transactions</h3>
              <div className="card-value">{summary.totalTransactions}</div>
              <div className="card-detail">
                <span>Completed: {summary.completedTransactions}</span>
              </div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-icon profit-icon">📈</div>
            <div className="card-content">
              <h3>Gross Profit</h3>
              <div className="card-value">{formatCurrency(summary.grossProfit)}</div>
              <div className="card-detail">
                <span>Payouts: {formatCurrency(summary.totalPayouts)}</span>
              </div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-icon refunds-icon">↩️</div>
            <div className="card-content">
              <h3>Refunds</h3>
              <div className="card-value">{formatCurrency(summary.totalRefunds)}</div>
              <div className="card-detail">
                <span>Count: {summary.refundedTransactions}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="breakdown-section">
          <h3>Service Type Breakdown</h3>
          <div className="service-breakdown">
            <div className="breakdown-chart">
              {/* In a real implementation, this would be a chart component */}
              <div className="chart-placeholder">
                {Object.entries(serviceTypeBreakdown).map(([type, data]) => (
                  <div 
                    key={type} 
                    className="chart-bar" 
                    style={{ 
                      height: `${(data.revenue / summary.totalRevenue) * 100}%`,
                      backgroundColor: getServiceColor(type)
                    }}
                    title={`${type}: ${formatCurrency(data.revenue)}`}
                  ></div>
                ))}
              </div>
            </div>
            
            <div className="breakdown-table">
              <table>
                <thead>
                  <tr>
                    <th>Service Type</th>
                    <th>Count</th>
                    <th>Revenue</th>
                    <th>% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(serviceTypeBreakdown).map(([type, data]) => (
                    <tr key={type}>
                      <td>
                        <span className="service-color" style={{ backgroundColor: getServiceColor(type) }}></span>
                        {formatServiceType(type)}
                      </td>
                      <td>{data.count}</td>
                      <td>{formatCurrency(data.revenue)}</td>
                      <td>{((data.revenue / summary.totalRevenue) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTransactions = () => {
    return (
      <div className="transactions-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Client</th>
              <th>Service</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment Method</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map(transaction => (
                <tr key={transaction._id} className={`status-${transaction.status}`}>
                  <td>{transaction.transactionId}</td>
                  <td>{formatDate(transaction.date)}</td>
                  <td>{transaction.clientName}</td>
                  <td>{formatServiceType(transaction.serviceType)}</td>
                  <td>{formatCurrency(transaction.amount)}</td>
                  <td>
                    <span className={`status-badge ${transaction.status}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </td>
                  <td>{formatPaymentMethod(transaction.paymentMethod)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">No transactions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPayouts = () => {
    // Filter transactions to only show those with contractor payouts
    const payoutTransactions = transactions.filter(t => t.contractorId && t.contractorPayout > 0);
    
    return (
      <div className="payouts-section">
        <div className="payout-summary">
          <div className="summary-card">
            <div className="card-content">
              <h3>Total Payouts</h3>
              <div className="card-value">
                {report ? formatCurrency(report.summary.totalPayouts) : '$0.00'}
              </div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-content">
              <h3>Pending Payouts</h3>
              <div className="card-value">
                {formatCurrency(
                  payoutTransactions
                    .filter(t => t.payoutStatus === 'pending')
                    .reduce((sum, t) => sum + t.contractorPayout, 0)
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="payouts-table">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Contractor</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Payout</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payoutTransactions.length > 0 ? (
                payoutTransactions.map(transaction => (
                  <tr key={transaction._id} className={`payout-status-${transaction.payoutStatus}`}>
                    <td>{transaction.transactionId}</td>
                    <td>{formatDate(transaction.date)}</td>
                    <td>{transaction.contractorId || 'Unknown'}</td>
                    <td>{formatServiceType(transaction.serviceType)}</td>
                    <td>{formatCurrency(transaction.amount)}</td>
                    <td>{formatCurrency(transaction.contractorPayout)}</td>
                    <td>
                      <span className={`status-badge ${transaction.payoutStatus}`}>
                        {transaction.payoutStatus.charAt(0).toUpperCase() + transaction.payoutStatus.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">No payout data found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const formatServiceType = (type) => {
    if (!type) return 'Unknown';
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatPaymentMethod = (method) => {
    if (!method) return 'Unknown';
    return method.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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

  return (
    <div className="financial-reports">
      <div className="reports-header">
        <div className="date-filter">
          <select value={dateRange} onChange={handleDateRangeChange}>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
          
          {dateRange === 'custom' && (
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
        
        <div className="filters">
          <select 
            name="serviceType" 
            value={filters.serviceType} 
            onChange={handleFilterChange}
          >
            <option value="">All Services</option>
            <option value="standard">Standard Cleaning</option>
            <option value="deep">Deep Cleaning</option>
            <option value="move-in">Move-in Cleaning</option>
            <option value="move-out">Move-out Cleaning</option>
            <option value="commercial">Commercial Cleaning</option>
          </select>
          
          <select 
            name="paymentMethod" 
            value={filters.paymentMethod} 
            onChange={handleFilterChange}
          >
            <option value="">All Payment Methods</option>
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="check">Check</option>
            <option value="paypal">PayPal</option>
          </select>
          
          <select 
            name="status" 
            value={filters.status} 
            onChange={handleFilterChange}
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        
        <div className="actions">
          <button className="export-btn">Export Report</button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-message">Loading financial data...</div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          {!mockDataGenerated && (
            <button className="generate-data-btn" onClick={generateMockData}>
              Generate Mock Data
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="reports-tabs">
            <button 
              className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
              onClick={() => handleTabChange('summary')}
            >
              Summary
            </button>
            <button 
              className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => handleTabChange('transactions')}
            >
              Transactions
            </button>
            <button 
              className={`tab-btn ${activeTab === 'payouts' ? 'active' : ''}`}
              onClick={() => handleTabChange('payouts')}
            >
              Contractor Payouts
            </button>
          </div>
          
          <div className="reports-content">
            {activeTab === 'summary' && renderSummary()}
            {activeTab === 'transactions' && renderTransactions()}
            {activeTab === 'payouts' && renderPayouts()}
          </div>
        </>
      )}
    </div>
  );
};

export default FinancialReports; 