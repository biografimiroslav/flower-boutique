import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PriceSlider({ initialMin = 0, initialMax = 5000, onEnter }) {
  const [min, setMin] = useState(initialMin);
  const [max, setMax] = useState(initialMax);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setMin(initialMin);
    setMax(initialMax);
  }, [initialMin, initialMax]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMinChange = (e) => setMin(Math.min(Number(e.target.value), max - 100));
  const handleMaxChange = (e) => setMax(Math.max(Number(e.target.value), min + 100));

  const handleEnter = () => {
    setIsOpen(false);
    if (onEnter) onEnter(min, max);
    else navigate(`/catalog?min=${min}&max=${max}`);
  };

  const p1 = (min / 5000) * 100;
  const p2 = (max / 5000) * 100;

  return (
    <div className="selectionByPriceForm" style={{ position: 'relative', width: '100%' }} ref={dropdownRef}>
      <input type="text" className="selectionByPriceInput" placeholder="ОБРАТИ ЦІНУ" readOnly style={{ cursor: 'pointer', width: '100%' }} value={`Від ${min} до ${max} грн`} onClick={() => setIsOpen(!isOpen)} />
      <button className="selectionByPriceEnter" onClick={handleEnter}>ENTER</button>
      <div className={`price-slider-dropdown ${isOpen ? 'show' : ''}`}>
        <div className="price-slider-values">Від <span>{min}</span> до <span>{max}</span> грн</div>
        <div className="range-slider-container">
          <div className="slider-track" style={{ background: `linear-gradient(to right, #e0e0e0 ${p1}%, #c86b8e ${p1}%, #c86b8e ${p2}%, #e0e0e0 ${p2}%)` }}></div>
          <input type="range" min="0" max="5000" value={min} onChange={handleMinChange} className="range-slider" />
          <input type="range" min="0" max="5000" value={max} onChange={handleMaxChange} className="range-slider" />
        </div>
      </div>
    </div>
  );
}