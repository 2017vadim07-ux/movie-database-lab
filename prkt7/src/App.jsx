import { useEffect, useMemo, useState } from 'react';
import './styles/global.scss';

const UPGRADES = [
  {
    id: 'click',
    name: 'Потужність кліку',
    description: '+1 кредит за клік',
    baseCost: 25,
  },
  {
    id: 'auto',
    name: 'Автоклікер',
    description: '+1 кредит/сек',
    baseCost: 80,
  },
  {
    id: 'passive',
    name: 'Пасивний дохід',
    description: '+5 кредитів/сек',
    baseCost: 150,
  },
  {
    id: 'combo',
    name: 'Комбо',
    description: 'Кожен 10-й клік дає x5',
    baseCost: 250,
  },
  {
    id: 'critical',
    name: 'Критичний клік',
    description: 'Шанс отримати x3',
    baseCost: 400,
  },
];

const SKINS = [
  {
    id: 'dark',
    name: 'Dark Terminal',
    price: 0,
    background: '#101314',
    panel: '#171d1f',
    accent: '#5ee787',
  },
  {
    id: 'blue',
    name: 'Blue Cyber',
    price: 1500,
    background: '#0d1321',
    panel: '#172033',
    accent: '#4bb8ff',
  },
  {
    id: 'gold',
    name: 'DUiKT Gold',
    price: 3,
    background: '#17130a',
    panel: '#28200f',
    accent: '#facc15',
    duikt: true,
  },
];

const DEFAULT_STATE = {
  credits: 0,
  totalEarned: 0,
  totalClicks: 0,
  duiktcoins: 0,
  prestigeCount: 0,
  upgrades: {
    click: 0,
    auto: 0,
    passive: 0,
    combo: 0,
    critical: 0,
  },
  activeBoost: null,
  antiBonus: null,
  unlockedSkins: ['dark'],
  activeSkin: 'dark',
  achievements: [],
  lastSave: Date.now(),
};

function getCost(baseCost, level) {
  return Math.floor(baseCost * 1.55 ** level);
}

function format(value) {
  return Math.floor(value).toLocaleString('uk-UA');
}

function App() {
  const [game, setGame] = useState(() => {
    const saved = localStorage.getItem('duikt-clicker-save');

    if (!saved) return DEFAULT_STATE;

    const parsed = JSON.parse(saved);
    const secondsOffline = Math.floor((Date.now() - parsed.lastSave) / 1000);
    const passive = getPassiveIncome(parsed);
    const offlineReward = Math.min(secondsOffline * passive * 0.5, passive * 60 * 60 * 8);

    return {
      ...DEFAULT_STATE,
      ...parsed,
      credits: parsed.credits + offlineReward,
      totalEarned: parsed.totalEarned + offlineReward,
    };
  });

  const skin = SKINS.find((item) => item.id === game.activeSkin) || SKINS[0];

  const prestigeMultiplier = 1 + game.duiktcoins * 0.05;

  const boostMultiplier =
    game.activeBoost && game.activeBoost.endsAt > Date.now()
      ? game.activeBoost.multiplier
      : 1;

  const antiMultiplier =
    game.antiBonus && game.antiBonus.endsAt > Date.now()
      ? game.antiBonus.multiplier
      : 1;

  const incomeMultiplier = prestigeMultiplier * boostMultiplier * antiMultiplier;

  const clickValue = useMemo(() => {
    return (1 + game.upgrades.click) * incomeMultiplier;
  }, [game.upgrades.click, incomeMultiplier]);

  const passiveIncome = useMemo(() => {
    return getPassiveIncome(game) * incomeMultiplier;
  }, [game, incomeMultiplier]);

  useEffect(() => {
    localStorage.setItem(
      'duikt-clicker-save',
      JSON.stringify({
        ...game,
        lastSave: Date.now(),
      }),
    );
  }, [game]);

  useEffect(() => {
    const timer = setInterval(() => {
      setGame((prev) => {
        const income = getPassiveIncome(prev) * incomeMultiplier;
        if (income <= 0) return prev;

        return {
          ...prev,
          credits: prev.credits + income,
          totalEarned: prev.totalEarned + income,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [incomeMultiplier]);

  function getPassiveIncome(state) {
    return state.upgrades.auto * 1 + state.upgrades.passive * 5;
  }

  function addAchievement(id) {
    setGame((prev) => {
      if (prev.achievements.includes(id)) return prev;

      return {
        ...prev,
        achievements: [...prev.achievements, id],
        credits: prev.credits + 100,
        totalEarned: prev.totalEarned + 100,
      };
    });
  }

  function click() {
    if (game.antiBonus?.type === 'ddos' && game.antiBonus.endsAt > Date.now()) return;

    let reward = clickValue;

    if (game.upgrades.combo > 0 && (game.totalClicks + 1) % 10 === 0) {
      reward *= 5;
    }

    if (game.upgrades.critical > 0 && Math.random() < game.upgrades.critical * 0.03) {
      reward *= 3;
    }

    setGame((prev) => ({
      ...prev,
      credits: prev.credits + reward,
      totalEarned: prev.totalEarned + reward,
      totalClicks: prev.totalClicks + 1,
    }));

    if (game.totalClicks + 1 >= 1) addAchievement('Перший клік');
    if (game.totalClicks + 1 >= 100) addAchievement('100 кліків');
  }

  function buyUpgrade(upgrade) {
    if (game.antiBonus?.type === 'bug' && game.antiBonus.endsAt > Date.now()) return;

    const level = game.upgrades[upgrade.id];
    const cost = getCost(upgrade.baseCost, level);

    if (game.credits < cost) return;

    setGame((prev) => ({
      ...prev,
      credits: prev.credits - cost,
      upgrades: {
        ...prev.upgrades,
        [upgrade.id]: level + 1,
      },
    }));
  }

  function openCase() {
    if (game.credits < 200) return;

    const random = Math.random();

    setGame((prev) => {
      let next = {
        ...prev,
        credits: prev.credits - 200,
      };

      if (random < 0.3) {
        next.credits += 500;
        next.totalEarned += 500;
      } else if (random < 0.55) {
        next.activeBoost = {
          name: 'x2 дохід',
          multiplier: 2,
          endsAt: Date.now() + 30000,
        };
      } else if (random < 0.75) {
        next.antiBonus = {
          name: 'Вірус',
          type: 'virus',
          multiplier: 0.5,
          endsAt: Date.now() + 20000,
        };
      } else if (random < 0.9) {
        next.antiBonus = {
          name: 'Баг апгрейдів',
          type: 'bug',
          multiplier: 1,
          endsAt: Date.now() + 20000,
        };
      } else {
        next.duiktcoins += 1;
      }

      return next;
    });

    addAchievement('Перший кейс');
  }

  function spinWheel() {
    if (game.credits < 500) return;

    const prizes = ['credits', 'boost', 'ddos', 'duikt'];
    const prize = prizes[Math.floor(Math.random() * prizes.length)];

    setGame((prev) => {
      const next = {
        ...prev,
        credits: prev.credits - 500,
      };

      if (prize === 'credits') {
        next.credits += 1200;
        next.totalEarned += 1200;
      }

      if (prize === 'boost') {
        next.activeBoost = {
          name: 'x3 дохід',
          multiplier: 3,
          endsAt: Date.now() + 20000,
        };
      }

      if (prize === 'ddos') {
        next.antiBonus = {
          name: 'DDoS',
          type: 'ddos',
          multiplier: 0.3,
          endsAt: Date.now() + 15000,
        };
      }

      if (prize === 'duikt') {
        next.duiktcoins += 1;
      }

      return next;
    });
  }

  function prestige() {
    const reward = Math.floor(Math.sqrt(game.totalEarned / 25000));

    if (reward <= 0) return;

    setGame((prev) => ({
      ...DEFAULT_STATE,
      duiktcoins: prev.duiktcoins + reward,
      prestigeCount: prev.prestigeCount + 1,
      unlockedSkins: prev.unlockedSkins,
      activeSkin: prev.activeSkin,
      achievements: prev.achievements,
    }));

    addAchievement('Перший престиж');
  }

  function buySkin(skinItem) {
    const unlocked = game.unlockedSkins.includes(skinItem.id);

    if (unlocked) {
      setGame((prev) => ({
        ...prev,
        activeSkin: skinItem.id,
      }));
      return;
    }

    if (skinItem.duikt) {
      if (game.duiktcoins < skinItem.price) return;

      setGame((prev) => ({
        ...prev,
        duiktcoins: prev.duiktcoins - skinItem.price,
        unlockedSkins: [...prev.unlockedSkins, skinItem.id],
        activeSkin: skinItem.id,
      }));
      return;
    }

    if (game.credits < skinItem.price) return;

    setGame((prev) => ({
      ...prev,
      credits: prev.credits - skinItem.price,
      unlockedSkins: [...prev.unlockedSkins, skinItem.id],
      activeSkin: skinItem.id,
    }));
  }

  function resetGame() {
    localStorage.removeItem('duikt-clicker-save');
    setGame(DEFAULT_STATE);
  }

  return (
    <main
      className="app"
      style={{
        '--bg': skin.background,
        '--panel': skin.panel,
        '--accent': skin.accent,
      }}
    >
      <header className="header">
        <h1>DUiKT Clicker Lab</h1>
        <p>React + Vite SPA Clicker Game</p>
      </header>

      <section className="stats">
        <div>
          <span>Кредити</span>
          <strong>{format(game.credits)}</strong>
        </div>
        <div>
          <span>Клік</span>
          <strong>{format(clickValue)}</strong>
        </div>
        <div>
          <span>За секунду</span>
          <strong>{format(passiveIncome)}</strong>
        </div>
        <div>
          <span>Duiktcoins</span>
          <strong>{format(game.duiktcoins)}</strong>
        </div>
        <div>
          <span>Престиж</span>
          <strong>{game.prestigeCount}</strong>
        </div>
      </section>

      <section className="click-zone">
        <button className="click-button" onClick={click}>
          Клік
        </button>

        {game.activeBoost?.endsAt > Date.now() && (
          <p className="good">Бонус: {game.activeBoost.name}</p>
        )}

        {game.antiBonus?.endsAt > Date.now() && (
          <p className="bad">Антибонус: {game.antiBonus.name}</p>
        )}
      </section>

      <section className="panel">
        <h2>Апгрейди</h2>

        <div className="grid">
          {UPGRADES.map((upgrade) => {
            const level = game.upgrades[upgrade.id];
            const cost = getCost(upgrade.baseCost, level);

            return (
              <div className="card" key={upgrade.id}>
                <h3>{upgrade.name}</h3>
                <p>{upgrade.description}</p>
                <p>Рівень: {level}</p>
                <button onClick={() => buyUpgrade(upgrade)}>
                  Купити: {format(cost)}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <h2>Бонуси</h2>

        <div className="actions">
          <button onClick={openCase}>Відкрити кейс: 200</button>
          <button onClick={spinWheel}>Колесо фортуни: 500</button>
        </div>
      </section>

      <section className="panel">
        <h2>Престиж</h2>
        <p>Формула: floor(sqrt(totalEarned / 25000))</p>
        <p>Множник Duiktcoins: x{prestigeMultiplier.toFixed(2)}</p>
        <button onClick={prestige}>Зробити престиж</button>
      </section>

      <section className="panel">
        <h2>Скіни</h2>

        <div className="grid">
          {SKINS.map((skinItem) => (
            <div className="card" key={skinItem.id}>
              <h3>{skinItem.name}</h3>
              <p>
                Ціна: {skinItem.price} {skinItem.duikt ? 'Duiktcoins' : 'кредитів'}
              </p>
              <button onClick={() => buySkin(skinItem)}>
                {game.unlockedSkins.includes(skinItem.id)
                  ? 'Застосувати'
                  : 'Купити'}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Досягнення</h2>

        {game.achievements.length === 0 ? (
          <p>Поки немає досягнень.</p>
        ) : (
          <ul>
            {game.achievements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2>Керування</h2>
        <button onClick={resetGame}>Скинути гру</button>
      </section>
    </main>
  );
}

export default App;