import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function LocationAutocomplete({ value, onChange, placeholder, required }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: query,
          format: 'json',
          addressdetails: 1,
          limit: 5
        }
      });
      setSuggestions(res.data || []);
      setIsOpen(true);
    } catch (err) {
      console.error('Error fetching location suggestions:', err);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 500);
  };

  const handleSelect = (suggestion) => {
    onChange(suggestion.display_name);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        style={{ width: '100%', boxSizing: 'border-box' }}
      />
      {isOpen && suggestions.length > 0 && (
        <ul style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--bg-main)',
          border: '1px solid var(--border-input)',
          borderRadius: '4px',
          zIndex: 1000,
          listStyle: 'none',
          padding: 0,
          margin: 0,
          maxHeight: '200px',
          overflowY: 'auto',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          {suggestions.map((s, idx) => (
            <li 
              key={idx}
              onClick={() => handleSelect(s)}
              style={{
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-input)',
                fontSize: '0.85rem'
              }}
              onMouseEnter={(e) => e.target.style.background = 'var(--bg-input)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
