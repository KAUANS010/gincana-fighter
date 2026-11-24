import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuPage.css';

const menuOptions = [
  { label: 'Começar', action: 'start', top: '68.3%' },
  { label: 'Tutorial', path: '/tutorial', top: '74.1%' },
  { label: 'Ranking', path: '/ranking', top: '79.9%' },
  { label: 'Sair', action: 'exit', top: '85.8%' },
];

export function MenuPage({ onExit, onStart }) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const startSoundRef = useRef(null);
  const optionSoundRef = useRef(null);
  const selectedOptionRef = useRef(0);
  const [selectedOption, setSelectedOption] = useState(0);

  const playSound = (soundRef, errorMessage) => {
    const sound = soundRef.current;
    if (!sound) return;

    sound.currentTime = 0;
    sound.play().catch((error) => console.error(errorMessage, error));
  };

  const selectOption = (index) => {
    if (selectedOptionRef.current === index) return;

    selectedOptionRef.current = index;
    setSelectedOption(index);
    playSound(optionSoundRef, 'Erro ao reproduzir som de navegação do menu:');
  };

  const chooseOption = (option) => {
    if (option.action === 'exit') {
      onExit();
      return;
    }

    if (option.action === 'start') {
      playSound(startSoundRef, 'Erro ao reproduzir som de início:');
      onStart();
      return;
    }

    navigate(option.path);
  };

  useEffect(() => {
    menuRef.current?.focus();
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      selectOption((selectedOptionRef.current + 1) % menuOptions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      selectOption((selectedOptionRef.current - 1 + menuOptions.length) % menuOptions.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      chooseOption(menuOptions[selectedOption]);
    }
  };

  return (
    <section
      ref={menuRef}
      className="menu-screen"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Menu principal do Gincana Fighter"
    >
      <audio ref={startSoundRef} src="/assets/sons/start.m4a" preload="auto" />
      <audio ref={optionSoundRef} src="/assets/sons/pause-opcao.m4a" preload="auto" />
      <div className="menu-artwork">
        <img
          className="menu-background"
          src="/assets/screens/MENU.png"
          alt="Arte do menu principal do Gincana Fighter"
        />

        <div className="menu-options" aria-label="Opções do menu">
          {menuOptions.map((option, index) => (
            <button
              key={option.label}
              type="button"
              className={`menu-option${selectedOption === index ? ' selected' : ''}`}
              style={{ top: option.top }}
              onMouseEnter={() => selectOption(index)}
              onFocus={() => selectOption(index)}
              onClick={() => chooseOption(option)}
              aria-current={selectedOption === index ? 'true' : undefined}
              aria-label={option.label}
            >
              <img
                className="menu-pointer"
                src="/assets/screens/PONTEIRO.png"
                alt=""
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
