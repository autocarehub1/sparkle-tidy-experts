import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from './Logo';
import './Appointment.css';

// Configure axios to use the backend URL
axios.defaults.baseURL = 'http://localhost:5003';
axios.defaults.timeout = 10000; // 10 seconds timeout
axios.defaults.headers.post['Content-Type'] = 'application/json';

function Appointment() {
  const navigate = useNavigate();
  // State for appointment form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    propertyType: 'residential',
    serviceType: 'standard',
    squareFootage: '',
    date: '',
    timeSlot: '',
    specialRequests: '',
    pets: false,
    recurring: 'one-time',
    howHeard: '',
  });

  // State for calendar and time slots
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [calendarDays, setCalendarDays] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState(null);

  // Pricing rates (per sq ft)
  const rates = {
    residential: {
      standard: 0.12,
      deep: 0.20,
      move: 0.25,
    },
    commercial: {
      standard: 0.10,
      deep: 0.18,
      specialized: 0.22,
    }
  };
  
  // Frequency discounts
  const frequencyDiscounts = {
    'one-time': 1.0,
    'weekly': 0.85,
    'bi-weekly': 0.90,
    'monthly': 0.95,
  };

  // Generate calendar days for the current month
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    const firstDayIndex = firstDay.getDay();
    
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get the last day of the previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    const days = [];
    
    // Add days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        month: month - 1,
        year,
        isCurrentMonth: false,
        isAvailable: false
      });
    }
    
    // Add days from current month
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isPast = date < new Date(today.setHours(0, 0, 0, 0));
      
      days.push({
        day: i,
        month,
        year,
        isCurrentMonth: true,
        isAvailable: !isWeekend && !isPast,
        isToday: i === today.getDate() && month === today.getMonth() && year === today.getFullYear()
      });
    }
    
    // Add days from next month
    const daysNeeded = 42 - days.length;
    for (let i = 1; i <= daysNeeded; i++) {
      days.push({
        day: i,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false,
        isAvailable: false
      });
    }
    
    setCalendarDays(days);
  }, [currentMonth]);

  // Generate time slots when a date is selected
  useEffect(() => {
    if (selectedDate) {
      // In a real app, you would fetch available time slots from the server
      // For now, we'll generate some random availability
      const slots = [];
      const startHour = 8; // 8 AM
      const endHour = 17; // 5 PM
      
      for (let hour = startHour; hour <= endHour; hour++) {
        // Skip lunch hour
        if (hour !== 12) {
          const isAvailable = Math.random() > 0.3; // 70% chance of availability
          slots.push({
            time: `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`,
            isAvailable
          });
          
          // Add half-hour slots
          if (hour < endHour) {
            const halfHourAvailable = Math.random() > 0.3;
            slots.push({
              time: `${hour % 12 || 12}:30 ${hour < 12 ? 'AM' : 'PM'}`,
              isAvailable: halfHourAvailable
            });
          }
        }
      }
      
      setAvailableTimeSlots(slots);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDate]);

  // Calculate estimated price when form data changes
  useEffect(() => {
    if (formData.propertyType && formData.serviceType && formData.squareFootage) {
      const sqft = parseFloat(formData.squareFootage);
      
      if (!isNaN(sqft) && sqft > 0) {
        const baseRate = rates[formData.propertyType][formData.serviceType];
        
        // Apply discount for recurring services
        const discount = frequencyDiscounts[formData.recurring] || 1.0;
        
        let price = baseRate * sqft * discount;
        
        // Minimum prices
        const minimumPrice = formData.propertyType === 'residential' ? 120 : 200;
        price = Math.max(price, minimumPrice);
        
        // Store as a number, not a string
        setEstimatedPrice(parseFloat(price.toFixed(2)));
      } else {
        setEstimatedPrice(null);
      }
    } else {
      setEstimatedPrice(null);
    }
  }, [formData.propertyType, formData.serviceType, formData.squareFootage, formData.recurring]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle date selection
  const handleDateSelect = (day, month, year) => {
    const date = new Date(year, month, day);
    setSelectedDate(date);
    setFormData({
      ...formData,
      date: date.toISOString().split('T')[0]
    });
  };

  // Handle time slot selection
  const handleTimeSelect = (time) => {
    setFormData({
      ...formData,
      timeSlot: time
    });
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  // Move to next step
  const nextStep = () => {
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  // Move to previous step
  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Maximum number of retry attempts
    const maxRetries = 2;
    let retryCount = 0;
    let success = false;
    
    while (retryCount <= maxRetries && !success) {
      try {
        if (retryCount > 0) {
          console.log(`Retry attempt ${retryCount}/${maxRetries}...`);
        }
        
        // Make sure estimatedPrice is properly formatted
        const formattedPrice = estimatedPrice ? estimatedPrice.toString() : '0.00';
        
        console.log('Submitting appointment data:', {
          ...formData,
          estimatedPrice: formattedPrice
        });
        
        // Send appointment data to the server
        const response = await axios.post('/api/send-appointment', {
          ...formData,
          estimatedPrice: formattedPrice
        });
        
        console.log('Server response:', response.data);
        
        if (response.data.success) {
          setSuccess(true);
          success = true;
        } else {
          throw new Error(response.data.message || 'There was an error scheduling your appointment. Please try again.');
        }
      } catch (err) {
        console.error(`Error submitting appointment (attempt ${retryCount + 1}/${maxRetries + 1}):`, err);
        
        if (retryCount === maxRetries) {
          // This was the last attempt, show error to user
          if (err.response) {
            console.error('Server error response:', err.response.data);
            setError(err.response.data.message || 'There was an error scheduling your appointment. Please try again or contact us directly at info@sparkletidy.com.');
          } else if (err.request) {
            console.error('No response received from server');
            setError('Could not connect to the server. Please check your internet connection and try again, or contact us directly at info@sparkletidy.com.');
          } else {
            console.error('Error details:', err.message);
            setError(err.message || 'There was an error scheduling your appointment. Please try again or contact us directly at info@sparkletidy.com.');
          }
        }
        
        retryCount++;
        
        if (retryCount <= maxRetries) {
          // Wait before retrying (exponential backoff)
          const delay = 1000 * Math.pow(2, retryCount - 1);
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    setLoading(false);
  };

  // Render month name and year
  const renderMonthYear = () => {
    const options = { month: 'long', year: 'numeric' };
    return currentMonth.toLocaleDateString('en-US', options);
  };

  // Render step 1: Service details
  const renderStep1 = () => (
    <div className="appointment-step">
      <h3>Step 1: Service Details</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="propertyType">Property Type</label>
          <select 
            id="propertyType" 
            name="propertyType" 
            value={formData.propertyType} 
            onChange={handleChange}
            required
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="serviceType">Service Type</label>
          <select 
            id="serviceType" 
            name="serviceType" 
            value={formData.serviceType} 
            onChange={handleChange}
            required
          >
            {formData.propertyType === 'residential' ? (
              <>
                <option value="standard">Standard Cleaning</option>
                <option value="deep">Deep Cleaning</option>
                <option value="move">Move In/Out Cleaning</option>
              </>
            ) : (
              <>
                <option value="standard">Standard Office Cleaning</option>
                <option value="deep">Deep Commercial Cleaning</option>
                <option value="specialized">Specialized Cleaning</option>
              </>
            )}
          </select>
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="squareFootage">Square Footage</label>
          <input 
            type="number" 
            id="squareFootage" 
            name="squareFootage" 
            value={formData.squareFootage} 
            onChange={handleChange}
            min="1"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="recurring">Cleaning Frequency</label>
          <select 
            id="recurring" 
            name="recurring" 
            value={formData.recurring} 
            onChange={handleChange}
            required
          >
            <option value="one-time">One-time Service</option>
            <option value="weekly">Weekly</option>
            <option value="bi-weekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>
      
      <div className="form-group full-width">
        <label htmlFor="specialRequests">Special Requests or Instructions</label>
        <textarea 
          id="specialRequests" 
          name="specialRequests" 
          value={formData.specialRequests} 
          onChange={handleChange} 
          rows="4"
        ></textarea>
      </div>
      
      <div className="form-group checkbox-group">
        <input 
          type="checkbox" 
          id="pets" 
          name="pets" 
          checked={formData.pets} 
          onChange={handleChange}
        />
        <label htmlFor="pets">I have pets at home</label>
      </div>
      
      {estimatedPrice && (
        <div className="estimated-price">
          <h4>Estimated Price</h4>
          <div className="price-amount">${estimatedPrice}</div>
          <p className="price-note">Final price may vary based on specific requirements and on-site assessment.</p>
        </div>
      )}
      
      <div className="form-buttons">
        <button type="button" className="next-button" onClick={nextStep}>
          Continue to Schedule
        </button>
      </div>
    </div>
  );

  // Render step 2: Schedule
  const renderStep2 = () => (
    <div className="appointment-step">
      <h3>Step 2: Choose Date & Time</h3>
      
      <div className="calendar-container">
        <div className="calendar-header">
          <button type="button" onClick={prevMonth} className="month-nav">
            &lt;
          </button>
          <h4>{renderMonthYear()}</h4>
          <button type="button" onClick={nextMonth} className="month-nav">
            &gt;
          </button>
        </div>
        
        <div className="calendar-weekdays">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        
        <div className="calendar-days">
          {calendarDays.map((day, index) => (
            <div 
              key={index} 
              className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''} ${day.isAvailable ? 'available' : ''} ${selectedDate && selectedDate.getDate() === day.day && selectedDate.getMonth() === day.month && selectedDate.getFullYear() === day.year ? 'selected' : ''}`}
              onClick={() => day.isAvailable && handleDateSelect(day.day, day.month, day.year)}
            >
              {day.day}
            </div>
          ))}
        </div>
      </div>
      
      {selectedDate && (
        <div className="time-slots-container">
          <h4>Available Times for {formatDate(selectedDate)}</h4>
          <div className="time-slots">
            {availableTimeSlots.map((slot, index) => (
              <button 
                key={index} 
                type="button" 
                className={`time-slot ${!slot.isAvailable ? 'unavailable' : ''} ${formData.timeSlot === slot.time ? 'selected' : ''}`}
                disabled={!slot.isAvailable}
                onClick={() => slot.isAvailable && handleTimeSelect(slot.time)}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="form-buttons">
        <button type="button" className="back-button" onClick={prevStep}>
          Back
        </button>
        <button 
          type="button" 
          className="next-button" 
          onClick={nextStep}
          disabled={!formData.date || !formData.timeSlot}
        >
          Continue to Contact Info
        </button>
      </div>
    </div>
  );

  // Render step 3: Contact information
  const renderStep3 = () => (
    <div className="appointment-step">
      <h3>Step 3: Contact Information</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input 
            type="tel" 
            id="phone" 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="howHeard">How did you hear about us?</label>
          <select 
            id="howHeard" 
            name="howHeard" 
            value={formData.howHeard} 
            onChange={handleChange}
          >
            <option value="">Please select</option>
            <option value="google">Google Search</option>
            <option value="social">Social Media</option>
            <option value="friend">Friend/Family</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      <div className="form-group full-width">
        <label htmlFor="address">Street Address</label>
        <input 
          type="text" 
          id="address" 
          name="address" 
          value={formData.address} 
          onChange={handleChange} 
          required 
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city">City</label>
          <input 
            type="text" 
            id="city" 
            name="city" 
            value={formData.city} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="zipCode">ZIP Code</label>
          <input 
            type="text" 
            id="zipCode" 
            name="zipCode" 
            value={formData.zipCode} 
            onChange={handleChange} 
            required 
          />
        </div>
      </div>
      
      <div className="form-buttons">
        <button type="button" className="back-button" onClick={prevStep}>
          Back
        </button>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Scheduling...' : 'Schedule Appointment'}
        </button>
      </div>
    </div>
  );

  // Render success message
  const renderSuccess = () => (
    <div className="success-message">
      <div className="success-icon">✓</div>
      <h3>Appointment Scheduled Successfully!</h3>
      <p>Thank you for choosing Sparkle & Tidy Experts. We've received your appointment request and will confirm your booking shortly.</p>
      
      <div className="appointment-details">
        <p className="appointment-date">Date: {new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p className="appointment-time">Time: {formData.timeSlot}</p>
      </div>
      
      <p>A confirmation email has been sent to {formData.email}. If you have any questions, please contact us at <a href="mailto:info@sparkletidy.com">info@sparkletidy.com</a> or call (210) 555-1234.</p>
      
      <button 
        className="home-button"
        onClick={() => navigate('/')}
      >
        Return to Home
      </button>
    </div>
  );

  return (
    <section className="appointment-section" id="appointment">
      <div className="container">
        <div className="section-title">
          <h2>Schedule Your Cleaning</h2>
          <p>Book your professional cleaning service in just a few easy steps.</p>
        </div>
        
        {!success ? (
          <div className="appointment-container">
            <div className="appointment-progress">
              <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-label">Service Details</div>
              </div>
              <div className="progress-line"></div>
              <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-label">Schedule</div>
              </div>
              <div className="progress-line"></div>
              <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-label">Contact Info</div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="appointment-form">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              
              {error && <div className="error-message">{error}</div>}
            </form>
          </div>
        ) : (
          renderSuccess()
        )}
      </div>
    </section>
  );
}

export default Appointment; 