import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Dashboard render error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Dashboard Error</p>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">页面遇到异常，已停止继续渲染</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              请刷新页面后重试。如果刚刚导入了 CSV，建议先检查表头和日期格式是否符合要求。
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
