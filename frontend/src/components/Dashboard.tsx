import React, { useEffect, useState } from 'react';
import type { MedicalOrder } from '../types';
import { OrderCard } from './OrderCard';
import { Activity, AlertTriangle, Clipboard } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<MedicalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:8000/orders');
      if (!response.ok) throw new Error('Error de red al conectar con el Middleware');
      const data: MedicalOrder[] = await response.json();
      setOrders(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "No se pudo conectar a la API. ¿Está corriendo uvicorn?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Auto-refresh cada 10 segundos para simular tiempo real
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filtrado algorítmico basado en el Triaje
  const criticalOrders = orders.filter(o => o.is_critical);
  const urgentOrders = orders.filter(o => o.is_urgent && !o.is_critical);
  const routineOrders = orders.filter(o => !o.is_urgent && !o.is_critical);

  if (loading && orders.length === 0) {
    return (
      <div className="loading-state">
        <Activity size={48} className="animate-pulse text-blue-500" />
        <h2>Conectando con RadioGroup...</h2>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="error-state">
        <AlertTriangle size={48} />
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <>
      <header className="header-bar">
        <div className="header-title">
          <Activity size={28} color="var(--color-routine)" />
          <strong>RadioGroup</strong>
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          {orders.length} pacientes procesados
        </div>
      </header>

      <main className="dashboard-container">
        <div className="kanban-board">
          {/* Columna CRITICA */}
          <section className="column critical">
            <div className="column-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-critical)' }}>
                <AlertTriangle size={20} />
                CRÍTICO
              </h3>
              <span className="badge-count" style={{ background: 'var(--color-critical-bg)', color: 'var(--color-critical)' }}>
                {criticalOrders.length}
              </span>
            </div>
            <div className="cards-container">
              {criticalOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
              {criticalOrders.length === 0 && (
                <p style={{ textAlign: 'center', opacity: 0.5, marginTop: '2rem' }}>No hay emergencias críticas.</p>
              )}
            </div>
          </section>

          {/* Columna URGENTE */}
          <section className="column urgent">
            <div className="column-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-urgent)' }}>
                <Activity size={20} />
                URGENCIA
              </h3>
              <span className="badge-count" style={{ background: 'var(--color-urgent-bg)', color: 'var(--color-urgent)' }}>
                {urgentOrders.length}
              </span>
            </div>
            <div className="cards-container">
              {urgentOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
              {urgentOrders.length === 0 && (
                <p style={{ textAlign: 'center', opacity: 0.5, marginTop: '2rem' }}>No hay ordenes de urgencia.</p>
              )}
            </div>
          </section>

          {/* Columna RUTINA */}
          <section className="column routine">
            <div className="column-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-routine)' }}>
                <Clipboard size={20} />
                RUTINA
              </h3>
              <span className="badge-count" style={{ background: 'var(--color-routine-bg)', color: 'var(--color-routine)' }}>
                {routineOrders.length}
              </span>
            </div>
            <div className="cards-container">
              {routineOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
              {routineOrders.length === 0 && (
                <p style={{ textAlign: 'center', opacity: 0.5, marginTop: '2rem' }}>Cola de rutina vacía.</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
};
