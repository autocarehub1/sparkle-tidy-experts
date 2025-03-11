import React, { useState } from 'react';
import './Testimonials.css';

function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Homeowner',
      quote: 'Sparkle & Tidy has been cleaning my home for over a year now, and I couldn\'t be happier with their service. My house always looks and smells amazing after they\'re done!',
      image: 'https://randomuser.me/api/portraits/women/32.jpg'
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      role: 'Office Manager',
      quote: 'We hired Sparkle & Tidy for our office cleaning needs, and they have exceeded our expectations. Our employees love coming to a clean workspace every day.',
      image: 'https://randomuser.me/api/portraits/men/45.jpg'
    },
    {
      id: 3,
      name: 'Emily Chen',
      role: 'Apartment Resident',
      quote: 'I was amazed at how thorough their deep cleaning service was. They got to places I didn\'t even know needed cleaning! Highly recommend for anyone moving in or out.',
      image: 'https://randomuser.me/api/portraits/women/68.jpg'
    },
    {
      id: 4,
      name: 'David Wilson',
      role: 'Real Estate Agent',
      quote: 'I recommend Sparkle & Tidy to all my clients who are selling their homes. Their move-out cleaning service makes properties show-ready and helps them sell faster.',
      image: 'https://randomuser.me/api/portraits/men/22.jpg'
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="testimonials-section" id="testimonials">
      <div className="container">
        <div className="section-title">
          <h2>What Our Customers Say</h2>
          <p>Don't just take our word for it. Here's what our satisfied customers have to say about our cleaning services.</p>
        </div>
        
        <div className="testimonials-carousel">
          <div className="testimonial-card">
            <div className="testimonial-image">
              <img src={testimonials[activeIndex].image} alt={testimonials[activeIndex].name} />
            </div>
            <div className="testimonial-content">
              <p className="testimonial-quote">"{testimonials[activeIndex].quote}"</p>
              <div className="testimonial-author">
                <h4>{testimonials[activeIndex].name}</h4>
                <p>{testimonials[activeIndex].role}</p>
              </div>
            </div>
          </div>
          
          <div className="testimonial-controls">
            <button className="control-btn prev" onClick={prevTestimonial}>
              &#8592;
            </button>
            <div className="testimonial-indicators">
              {testimonials.map((_, index) => (
                <span 
                  key={index} 
                  className={`indicator ${index === activeIndex ? 'active' : ''}`}
                  onClick={() => setActiveIndex(index)}
                ></span>
              ))}
            </div>
            <button className="control-btn next" onClick={nextTestimonial}>
              &#8594;
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials; 