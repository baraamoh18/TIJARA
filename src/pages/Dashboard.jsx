import React from 'react';
import './Dashboard.css';
import { MdWarningAmber, MdShoppingCart, MdArrowBack } from 'react-icons/md';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const currentDate = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const salesLog = [
    { date: '25 أبريل', revenue: '11,500 ج', cost: '7,062 ج', profit: '4,438 ج', margin: '39%', status: 'green' },
    { date: '24 أبريل', revenue: '9,800 ج', cost: '6,188 ج', profit: '3,612 ج', margin: '37%', status: 'green' },
    { date: '23 أبريل', revenue: '14,200 ج', cost: '8,726 ج', profit: '5,474 ج', margin: '39%', status: 'green' },
    { date: '22 أبريل', revenue: '7,200 ج', cost: '5,840 ج', profit: '1,460 ج', margin: '20%', status: 'yellow' },
    { date: '21 أبريل', revenue: '13,100 ج', cost: '8,191 ج', profit: '4,909 ج', margin: '37%', status: 'green' },
    { date: '20 أبريل', revenue: '10,400 ج', cost: '6,552 ج', profit: '3,848 ج', margin: '37%', status: 'green' },
  ];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">الرئيسية</h1>
        <div className="dashboard-date">{currentDate}</div>
      </div>

      {/* Summary Cards */}
      <div className="cards-grid">
        <div className="summary-card green-border">
          <div className="card-header">
            <span className="card-title">إيراد اليوم</span>
            <span className="card-title" style={{ fontSize: '10px' }}>جنيــه *</span>
          </div>
          <h2 className="card-value">0 <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>جنيه</span></h2>
          <p className="card-subtitle">لم تدخل مبيعات بعد</p>
        </div>

        <div className="summary-card green-border">
          <div className="card-header">
            <span className="card-title">ربح اليوم</span>
            <span className="card-title" style={{ fontSize: '10px' }}>جنيــه *</span>
          </div>
          <h2 className="card-value">0 <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>جنيه</span></h2>
          <p className="card-subtitle">--</p>
        </div>

        <div className="summary-card yellow-border">
          <div className="card-header">
            <span className="card-title">قيمة المخزن</span>
          </div>
          <h2 className="card-value">12,181 <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>جنيه</span></h2>
          <p className="card-subtitle">5 منتج في المخزن</p>
        </div>

        <div className="summary-card red-border">
          <div className="card-header">
            <span className="card-title">ديون لم تسدد</span>
          </div>
          <h2 className="card-value red-text">- 1,900 <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>جنيه</span></h2>
          <p className="card-subtitle" style={{ color: '#eab308', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MdWarningAmber className="warning-icon" /> 1 دين متأخر
          </p>
        </div>
      </div>

      {/* Banners */}
      <div className="banners-section">
        <div className="banner yellow">
          <span>مخزون قليل: منتج 1 — منتج 2</span>
        </div>
        <div className="banner red">
          <span>لديك 1 دين متأخر — <span className="banner-link">اضغط هنا للتفاصيل</span></span>
        </div>
      </div>

      {/* Middle Section: Charts & Top Products */}
      <div className="middle-section">
        <div className="panel">
          <h3 className="panel-title">أكثر المنتجات مبيعاً اليوم</h3>
          <div className="empty-state">
            <MdShoppingCart />
            <span>لم تدخل مبيعات اليوم بعد</span>
          </div>
        </div>

        <div className="panel">
          <h3 className="panel-title">مبيعات آخر 7 أيام</h3>
          <div className="chart-container">
            <div className="chart-bars">
              {['26', '25', '24', '23', '22', '21', '20'].map((day, index) => (
                <div key={index} className="chart-bar-group">
                  <div className={`bar-line ${index === 0 ? 'empty' : ''}`}></div>
                  <span className="bar-label">{day}</span>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-dot dark"></div>
                <span>التكلفة</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot green"></div>
                <span>الإيراد</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Sales Log Table */}
      <div className="panel">
        <div className="table-header-row">
          <h3 className="panel-title" style={{ margin: 0 }}>سجل المبيعات — آخر 7 أيام</h3>
          <Link to="/sales" className="table-link">
             <MdArrowBack style={{ verticalAlign: 'middle', marginLeft: '4px' }} /> تقرير اليوم 
          </Link>
        </div>
        
        <table className="sales-table">
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>الإيراد</th>
              <th>التكلفة</th>
              <th>الربح</th>
              <th>الهامش</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {salesLog.map((row, idx) => (
              <tr key={idx}>
                <td>{row.date}</td>
                <td>{row.revenue}</td>
                <td className="value-red">{row.cost}</td>
                <td className="value-green">{row.profit}</td>
                <td>
                  <span className={`margin-badge ${row.margin === '20%' ? 'yellow' : ''}`}>
                    {row.margin}
                  </span>
                </td>
                <td>
                  <div className={`status-dot ${row.status}`}></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
