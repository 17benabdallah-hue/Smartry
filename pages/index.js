export default function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      fontFamily: 'system-ui, sans-serif', 
      backgroundColor: '#f5f5f5' 
    }}>
      <h1 style={{ color: '#333', marginBottom: '1rem' }}>
        مرحباً بك في Smartry
      </h1>
      <p style={{ color: '#666', fontSize: '1.2rem', textAlign: 'center' }}>
        سكرتيرك الذكي للتذكيرات
      </p>
      <p style={{ color: '#999', marginTop: '2rem' }}>
        جاري تحميل التطبيق...
      </p>
    </div>
  );
          }
