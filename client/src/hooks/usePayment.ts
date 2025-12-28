import { ApiService } from '../services/api.service';

export function usePayment() {
  const buyWithStars = async (packId: string) => {
    try {
      const { invoiceLink } = await ApiService.createStarsInvoice(packId);
      // @ts-ignore
      const tg = window.Telegram?.WebApp;
      
      if (tg) {
        tg.openInvoice(invoiceLink, (status: string) => {
          if (status === 'paid') alert('Payment Successful! Syncing...');
          else if (status === 'cancelled') console.log('Payment cancelled');
          else console.error('Payment failed', status);
        });
      } else {
        alert('Please open in Telegram to pay.');
      }
    } catch (err) {
      console.error('Payment Init Error', err);
      alert('Could not initialize payment.');
    }
  };
  return { buyWithStars };
}
