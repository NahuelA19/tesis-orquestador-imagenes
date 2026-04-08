import React from 'react';
import type { MedicalOrder } from '../types';
import { AlertCircle, User, FileText } from 'lucide-react';

interface Props {
  order: MedicalOrder;
}

export const OrderCard: React.FC<Props> = ({ order }) => {
  // Determinar severidad
  let severityClass = 'routine';
  if (order.is_critical) severityClass = 'critical';
  else if (order.is_urgent) severityClass = 'urgent';

  // Formatear origen para la UI
  const originClass = `origin-${order.origin.toLowerCase()}`;

  // Verificar si hay palabras de riesgo para pintar de rojo en la UI
  const alertWords = ["acv", "infarto", "hemorragia", "tec", "politrauma"];
  const isHighRiskDiagnosis = alertWords.some(w => order.diagnosis.toLowerCase().includes(w));

  return (
    <div className={`order-card ${severityClass}`}>
      <div className="card-header">
        <span className={`card-origin ${originClass}`}>
          {order.origin}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="patient-info">
        <div className="patient-name">
          {order.patient_name} {order.patient_lastname}
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <User size={14} /> {order.patient_age} años • DNI: {order.patient_dni}
        </div>
      </div>

      <div className="study-info">
        <div className="study-title">
          <FileText size={16} color="var(--color-routine)" />
          {order.medical_order} ({order.modality})
        </div>
        <div className={`study-diagnosis ${isHighRiskDiagnosis ? 'diagnosis-alert' : ''}`}>
          {isHighRiskDiagnosis && <AlertCircle size={14} style={{ display: 'inline', marginRight: 4, marginBottom: -2 }} />}
          Dx: {order.diagnosis}
        </div>
      </div>

      <div className="card-footer">
        <span style={{ color: 'var(--text-primary)' }}>📍 {order.location}</span>
        <span>Dr/a. {order.requesting_physician}</span>
      </div>
    </div>
  );
};
