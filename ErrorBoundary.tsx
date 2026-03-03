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

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'حدث خطأ غير متوقع',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleRetry = () => {
    window.location.reload();
  };

  handleReport = () => {
    window.location.href = `mailto:support@smartry.com?subject=خطأ في التطبيق&body=${encodeURIComponent(this.state.errorMessage)}`;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full flex flex-col items-center"
          >
            <TriangleAlert className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              عذراً، حدث خطأ غير متوقع
            </h2>
            <div className="w-full bg-red-50 p-6 rounded-2xl mb-8 text-right border border-red-200">
              <p className="text-red-800 font-medium text-sm break-words">
                {this.state.errorMessage}
              </p>
            </div>
            <div className="flex flex-row gap-4 w-full justify-center mb-6">
              <button
                onClick={this.handleRetry}
                className="flex-1 bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                إعادة المحاولة
              </button>
              <button
                onClick={this.handleReport}
                className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                إبلاغ الدعم
              </button>
            </div>
            <p className="text-gray-500 text-sm">سنحل المشكلة قريباً</p>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
