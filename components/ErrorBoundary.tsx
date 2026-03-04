'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'motion/react';
import { TriangleAlert, RefreshCw, Mail } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

/**
 * مكون ErrorBoundary بسيط لالتقاط أخطاء React وعرض واجهة بديلة.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || 'حدث خطأ غير متوقع' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // تسجيل الخطأ في وحدة التحكم (يمكنك إضافة خدمة خارجية لاحقًا)
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  handleManualError = (error: Error | any) => {
    const throwable = error instanceof Error ? error : new Error(String(error));
    this.setState({
      hasError: true,
      errorMessage: throwable.message || 'حدث خطأ غير متوقع',
    });
    console.error('Manual error triggered:', throwable);
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallbackScreen
          message={this.state.errorMessage}
          onRetry={this.handleRetry}
        />
      );
    }

    // توفير دالة معالجة الأخطاء للأبناء عبر السياق إذا أردت
    // يمكن تمرير this.handleManualError عبر Context إذا أردت
    return this.props.children;
  }
}

interface FallbackProps {
  message: string;
  onRetry: () => void;
}

const ErrorFallbackScreen = ({ message, onRetry }: FallbackProps) => {
  const handleEmailReport = () => {
    // فتح عميل البريد الإلكتروني مع رسالة معدة مسبقًا
    const subject = encodeURIComponent('تقرير خطأ في التطبيق');
    const body = encodeURIComponent(`حدث الخطأ التالي:\n\n${message}`);
    window.location.href = `mailto:1smartry@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full flex flex-col items-center"
      >
        <TriangleAlert className="w-16 h-16 text-red-500 mb-4" />
        
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          عذراً، حدث خطأ غير متوقع
        </h2>
        
        <div className="w-full bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl mb-8 text-right border border-red-200 dark:border-red-800/30">
          <p className="text-red-800 dark:text-red-300 font-medium text-sm break-words">
            {message}
          </p>
        </div>

        <div className="flex flex-row gap-4 w-full justify-center mb-6">
          <button
            onClick={onRetry}
            className="flex-1 bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
          
          <button
            onClick={handleEmailReport}
            className="flex-1 bg-gray-200 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 text-gray-800 dark:text-gray-200 font-bold py-3 px-4 rounded-xl hover:bg-gray-300 dark:hover:bg-zinc-600 transition-all flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            إبلاغ الدعم
          </button>
        </div>

        <p className="text-gray-500 dark:text-gray-400 text-sm">
          سنحل المشكلة قريباً
        </p>
      </motion.div>
    </div>
  );
};
