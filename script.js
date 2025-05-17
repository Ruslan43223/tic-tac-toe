import { Connection, PublicKey } from '@solana/web3.js';

// Настройка подключения к Solana Mainnet
const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

async function findBackpackWallet() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 20; // Увеличим попытки до 10 секунд
    console.log('Начало поиска Backpack...');
    const interval = setInterval(() => {
      // Ищем все ключи, связанные с solana
      const solanaKeys = Object.keys(window).filter(key => key.toLowerCase().includes('solana') || key.toLowerCase().includes('backpack'));
      console.log('Обнаруженные ключи:', solanaKeys);

      // Проверяем каждый ключ на наличие isBackpack
      for (const key of solanaKeys) {
        const solanaObj = window[key];
        console.log(`Проверка ключа ${key}:`, solanaObj);
        if (solanaObj?.isBackpack) {
          clearInterval(interval);
          console.log('Найден Backpack:', solanaObj);
          resolve(solanaObj);
          return;
        }
      }

      // Дополнительная проверка window.solana
      if (window.solana?.isBackpack) {
        clearInterval(interval);
        console.log('Найден Backpack в window.solana:', window.solana);
        resolve(window.solana);
        return;
      }

      attempts++;
      console.log(`Попытка ${attempts}/${maxAttempts}`);
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.log('Backpack не найден. Доступные объекты:', window.solana);
        reject(new Error('Backpack wallet not detected after timeout'));
      }
    }, 500);
  });
}

document.getElementById('connect-button').addEventListener('click', async () => {
  try {
    const wallet = await findBackpackWallet();
    if (!wallet.isBackpack) {
      throw new Error('Выбранный кошелёк не является Backpack');
    }
    await wallet.connect();
    const publicKey = new PublicKey(wallet.publicKey.toString());
    console.log('Кошелёк Backpack подключен к Solana Mainnet:', publicKey.toBase58());
    document.getElementById('wallet-status').textContent = `Подключен: ${publicKey.toBase58()}`;
  } catch (error) {
    console.error('Ошибка подключения кошелька:', error);
    alert(`Не удалось подключить кошелёк Backpack: ${error.message}`);
  }
});

// Дополнительная отладка при загрузке страницы
window.addEventListener('load', () => {
  console.log('Окно загружено. Проверка наличия кошельков:');
  console.log('window.solana:', window.solana);
  console.log('window.solana?.isBackpack:', window.solana?.isBackpack);
  console.log('window.solana?.isPhantom:', window.solana?.isPhantom);
  console.log('Все ключи solana/backpack:', Object.keys(window).filter(key => key.toLowerCase().includes('solana') || key.toLowerCase().includes('backpack')));
});