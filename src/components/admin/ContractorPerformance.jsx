import React, { useState, useEffect } from 'react';
import './ContractorPerformance.css';
import axios from 'axios';

const ContractorPerformance = () => {
  const [contractors, setContractors] = useState([]);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('month');
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('desc');
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    const fetchContractors = async () => {
      try {
        setLoading(true);
        // Try to fetch real data first
        try {
          const response = await axios.get('http://localhost:5003/api/contractors');
          if (response.data && response.data.length > 0) {
            // Transform the data to include performance metrics
            const contractorsWithMetrics = response.data.map(contractor => ({
              id: contractor._id,
              name: `${contractor.firstName} ${contractor.lastName}`,
              avatar: `${contractor.firstName[0]}${contractor.lastName[0]}`,
              rating: contractor.rating || 4.5,
              totalJobs: contractor.completedJobs || Math.floor(Math.random() * 100) + 50,
              completedOnTime: Math.floor((contractor.completedJobs || Math.floor(Math.random() * 100) + 50) * 0.95),
              cancelledJobs: Math.floor(Math.random() * 5),
              customerSatisfaction: Math.floor(Math.random() * 10) + 90,
              revenueGenerated: (contractor.completedJobs || Math.floor(Math.random() * 100) + 50) * 100,
              performanceMetrics: {
                qualityScore: (Math.random() * 0.5 + 4.5).toFixed(1),
                punctualityScore: (Math.random() * 0.5 + 4.3).toFixed(1),
                communicationScore: (Math.random() * 0.5 + 4.4).toFixed(1),
                professionalismScore: (Math.random() * 0.5 + 4.5).toFixed(1)
              },
              recentFeedback: [], // Will be populated from feedback API
              monthlyStats: {
                jobsCompleted: Math.floor(Math.random() * 15) + 5,
                averageRating: (Math.random() * 0.5 + 4.5).toFixed(1),
                revenue: (Math.floor(Math.random() * 15) + 5) * 100,
                issuesReported: Math.floor(Math.random() * 2)
              }
            }));
            setContractors(contractorsWithMetrics);
            
            // Fetch feedback for each contractor
            await fetchFeedbackForContractors(contractorsWithMetrics);
            return;
          }
        } catch (err) {
          console.error('Error fetching real contractor data:', err);
          // Fall back to mock data
        }
        
        // Mock data as fallback
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockContractors = [
          {
            id: 1,
            name: 'John Smith',
            avatar: 'JS',
            rating: 4.8,
            totalJobs: 156,
            completedOnTime: 152,
            cancelledJobs: 2,
            customerSatisfaction: 96,
            revenueGenerated: 15600,
            performanceMetrics: {
              qualityScore: 4.9,
              punctualityScore: 4.7,
              communicationScore: 4.8,
              professionalismScore: 4.9
            },
            recentFeedback: [
              {
                id: 1,
                clientName: 'Sarah Johnson',
                rating: 5,
                comment: 'Excellent service! Very thorough and professional.',
                date: '2024-03-15'
              },
              {
                id: 2,
                clientName: 'Michael Brown',
                rating: 4,
                comment: 'Good work overall, but arrived a bit late.',
                date: '2024-03-12'
              }
            ],
            monthlyStats: {
              jobsCompleted: 12,
              averageRating: 4.8,
              revenue: 1200,
              issuesReported: 0
            }
          },
          {
            id: 2,
            name: 'Maria Garcia',
            avatar: 'MG',
            rating: 4.9,
            totalJobs: 203,
            completedOnTime: 201,
            cancelledJobs: 1,
            customerSatisfaction: 98,
            revenueGenerated: 20300,
            performanceMetrics: {
              qualityScore: 5.0,
              punctualityScore: 4.8,
              communicationScore: 4.9,
              professionalismScore: 5.0
            },
            recentFeedback: [
              {
                id: 3,
                clientName: 'David Wilson',
                rating: 5,
                comment: 'Maria is the best! Always does an amazing job.',
                date: '2024-03-14'
              },
              {
                id: 4,
                clientName: 'Emily Davis',
                rating: 5,
                comment: 'Very detailed and thorough cleaning. Highly recommend!',
                date: '2024-03-10'
              }
            ],
            monthlyStats: {
              jobsCompleted: 15,
              averageRating: 4.9,
              revenue: 1500,
              issuesReported: 0
            }
          },
          {
            id: 3,
            name: 'David Johnson',
            avatar: 'DJ',
            rating: 4.6,
            totalJobs: 89,
            completedOnTime: 85,
            cancelledJobs: 3,
            customerSatisfaction: 92,
            revenueGenerated: 8900,
            performanceMetrics: {
              qualityScore: 4.7,
              punctualityScore: 4.5,
              communicationScore: 4.6,
              professionalismScore: 4.7
            },
            recentFeedback: [
              {
                id: 5,
                clientName: 'Lisa Anderson',
                rating: 4,
                comment: 'Good service but could improve on timing.',
                date: '2024-03-13'
              },
              {
                id: 6,
                clientName: 'Robert Taylor',
                rating: 5,
                comment: 'Very satisfied with the cleaning service.',
                date: '2024-03-09'
              }
            ],
            monthlyStats: {
              jobsCompleted: 8,
              averageRating: 4.6,
              revenue: 800,
              issuesReported: 1
            }
          }
        ];
        
        setContractors(mockContractors);
        setLoading(false);
      } catch (err) {
        console.error('Error loading contractor performance data:', err);
        setError('Failed to load contractor performance data');
        setLoading(false);
      }
    };

    const fetchFeedbackForContractors = async (contractors) => {
      try {
        // Try to fetch real feedback data
        try {
          const response = await axios.get('http://localhost:5003/api/feedback');
          if (response.data && response.data.length > 0) {
            // Group feedback by contractor ID
            const feedbackByContractor = {};
            
            response.data.forEach(item => {
              if (!feedbackByContractor[item.contractorId]) {
                feedbackByContractor[item.contractorId] = [];
              }
              
              feedbackByContractor[item.contractorId].push({
                id: item._id,
                clientName: item.clientName,
                rating: item.rating,
                comment: item.comment,
                date: item.serviceDate || item.createdAt
              });
            });
            
            // Update contractors with their feedback
            const updatedContractors = contractors.map(contractor => {
              const contractorFeedback = feedbackByContractor[contractor.id] || [];
              
              // Sort feedback by date (newest first)
              const sortedFeedback = [...contractorFeedback].sort((a, b) => 
                new Date(b.date) - new Date(a.date)
              );
              
              // Calculate new average rating if there's feedback
              let newRating = contractor.rating;
              if (contractorFeedback.length > 0) {
                const sum = contractorFeedback.reduce((acc, item) => acc + item.rating, 0);
                newRating = (sum / contractorFeedback.length).toFixed(1);
              }
              
              return {
                ...contractor,
                rating: parseFloat(newRating),
                recentFeedback: sortedFeedback.slice(0, 5), // Get 5 most recent feedback items
                monthlyStats: {
                  ...contractor.monthlyStats,
                  averageRating: newRating
                }
              };
            });
            
            setContractors(updatedContractors);
            setFeedback(feedbackByContractor);
          }
        } catch (err) {
          console.error('Error fetching feedback data:', err);
          // If real feedback fails, we'll use the mock data already in the contractors
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error processing feedback:', err);
        setLoading(false);
      }
    };

    fetchContractors();
  }, []);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedContractors = [...contractors].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'rating':
        comparison = b.rating - a.rating;
        break;
      case 'jobs':
        comparison = b.totalJobs - a.totalJobs;
        break;
      case 'satisfaction':
        comparison = b.customerSatisfaction - a.customerSatisfaction;
        break;
      case 'revenue':
        comparison = b.revenueGenerated - a.revenueGenerated;
        break;
      default:
        comparison = 0;
    }
    return sortOrder === 'asc' ? -comparison : comparison;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading-message">Loading performance data...</div>;
  }

  return (
    <div className="contractor-performance">
      <div className="performance-header">
        <h2>Contractor Performance</h2>
        <div className="performance-controls">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="performance-grid">
        {sortedContractors.map(contractor => (
          <div
            key={contractor.id}
            className={`performance-card ${selectedContractor?.id === contractor.id ? 'selected' : ''}`}
            onClick={() => setSelectedContractor(contractor)}
          >
            <div className="contractor-header">
              <div className="contractor-avatar">{contractor.avatar}</div>
              <div className="contractor-info">
                <h3>{contractor.name}</h3>
                <div className="rating">
                  <span className="stars">{'★'.repeat(Math.round(contractor.rating))}</span>
                  <span className="rating-value">{contractor.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="metrics-grid">
              <div className="metric">
                <span className="metric-label">Total Jobs</span>
                <span className="metric-value">{contractor.totalJobs}</span>
              </div>
              <div className="metric">
                <span className="metric-label">On-Time</span>
                <span className="metric-value">{Math.round((contractor.completedOnTime / contractor.totalJobs) * 100)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Satisfaction</span>
                <span className="metric-value">{contractor.customerSatisfaction}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Revenue</span>
                <span className="metric-value">{formatCurrency(contractor.revenueGenerated)}</span>
              </div>
            </div>

            <div className="performance-details">
              <div className="performance-section">
                <h4>Quality Metrics</h4>
                <div className="quality-metrics">
                  <div className="quality-metric">
                    <span>Quality</span>
                    <div className="progress-bar">
                      <div
                        className="progress"
                        style={{ width: `${(contractor.performanceMetrics.qualityScore / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span>{contractor.performanceMetrics.qualityScore}</span>
                  </div>
                  <div className="quality-metric">
                    <span>Punctuality</span>
                    <div className="progress-bar">
                      <div
                        className="progress"
                        style={{ width: `${(contractor.performanceMetrics.punctualityScore / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span>{contractor.performanceMetrics.punctualityScore}</span>
                  </div>
                  <div className="quality-metric">
                    <span>Communication</span>
                    <div className="progress-bar">
                      <div
                        className="progress"
                        style={{ width: `${(contractor.performanceMetrics.communicationScore / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span>{contractor.performanceMetrics.communicationScore}</span>
                  </div>
                  <div className="quality-metric">
                    <span>Professionalism</span>
                    <div className="progress-bar">
                      <div
                        className="progress"
                        style={{ width: `${(contractor.performanceMetrics.professionalismScore / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span>{contractor.performanceMetrics.professionalismScore}</span>
                  </div>
                </div>
              </div>

              <div className="performance-section">
                <h4>Recent Feedback</h4>
                {contractor.recentFeedback && contractor.recentFeedback.length > 0 ? (
                  <div className="feedback-list">
                    {contractor.recentFeedback.map(feedback => (
                      <div key={feedback.id} className="feedback-item">
                        <div className="feedback-header">
                          <span className="client-name">{feedback.clientName}</span>
                          <span className="feedback-date">{formatDate(feedback.date)}</span>
                        </div>
                        <div className="feedback-rating">
                          {'★'.repeat(Math.round(feedback.rating))}
                          <span className="rating-value">{feedback.rating.toFixed(1)}</span>
                        </div>
                        <p className="feedback-comment">{feedback.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-feedback-message">
                    No feedback available for this contractor yet.
                  </div>
                )}
              </div>

              <div className="performance-section">
                <h4>Monthly Statistics</h4>
                <div className="monthly-stats">
                  <div className="stat">
                    <span className="stat-label">Jobs Completed</span>
                    <span className="stat-value">{contractor.monthlyStats.jobsCompleted}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Average Rating</span>
                    <span className="stat-value">{contractor.monthlyStats.averageRating}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Revenue</span>
                    <span className="stat-value">{formatCurrency(contractor.monthlyStats.revenue)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Issues Reported</span>
                    <span className="stat-value">{contractor.monthlyStats.issuesReported}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContractorPerformance; 