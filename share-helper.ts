export const ShareHelper = {
  shareReminder: async (reminderText: string) => {
    const textToShare = `📋 تذكير: ${reminderText}\n\nتم عبر تطبيق Smartry`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'مشاركة التذكير',
          text: textToShare,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(textToShare);
        alert('تم نسخ التذكير إلى الحافظة');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  }
};
