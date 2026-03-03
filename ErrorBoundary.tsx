import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // تحديث الحالة بحيث تعرض واجهة الخطأ في المرة القادمة
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // يمكنك تسجيل الخطأ هنا (مثلاً إرساله إلى خدمة خارجية)
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // يمكنك تخصيص واجهة الخطأ هنا
      return this.props.fallback || (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'system-ui, sans-serif',
          backgroundColor: '#f5f5f5',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#d32f2f', marginBottom: '1rem' }}>
            عذراً، حدث خطأ غير متوقع
          </h1>
          <p style={{ color: '#666', fontSize: '1rem', maxWidth: '500px' }}>
            {this.state.error?.message || 'يرجى تحديث الصفحة والمحاولة مرة أخرى.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '2rem',
              padding: '0.5rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            تحديث الصفحة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
