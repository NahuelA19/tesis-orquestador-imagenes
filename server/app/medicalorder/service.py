from sqlmodel import Session, select
from app.medicalorder.model import MedicalOrder, MedicalOrderCreate
from typing import Sequence

# 1. Definimos las reglas de triaje clínico para buscar coincidencias
PALABRAS_CRITICAS = ["acv", "infarto", "hemorragia", "tec", "politrauma", "evisceracion", "paro"]
PALABRAS_URGENTES = ["fractura", "apendicitis", "dolor toracico", "dificultad respiratoria", "agudo"]
ORIGENES_URGENTES = ["guardia", "shockroom", "uti", "terapia intensiva", "emergencia"]


def perform_triage(order: MedicalOrder) -> MedicalOrder:
    """Evalúa la semántica de la orden para asignar criticidad algorítmicamente."""
    
    # 2. Análisis por Origen (Setting)
    setting = order.study_setting.lower()
    if any(origen in setting for origen in ORIGENES_URGENTES):
        order.is_urgent = True

    # 3. Análisis Semántico del Diagnóstico
    diagnostico_limpio = order.diagnosis.lower()
    
    if any(palabra in diagnostico_limpio for palabra in PALABRAS_CRITICAS):
        order.is_critical = True
        order.is_urgent = True  # Todo lo crítico es obligatoriamente urgente
    elif any(palabra in diagnostico_limpio for palabra in PALABRAS_URGENTES):
        order.is_urgent = True

    return order


def get_all(session: Session) -> Sequence[MedicalOrder]:
    statement = select(MedicalOrder)
    result = session.exec(statement)
    orders = result.all()

    return orders


def create_order(session: Session, data: MedicalOrderCreate):
    # Idempotencia: si la orden ya existe por external_id, la retornamos sin duplicar
    existing = session.exec(
        select(MedicalOrder).where(MedicalOrder.external_id == data.external_id)
    ).first()

    if existing:
        print(f"ℹ️ Orden '{data.external_id}' ya existe (id: {existing.id}). Omitiendo inserción.")
        return existing

    # Creamos la instancia de MedicalOrder desde los datos crudos
    order = MedicalOrder.model_validate(data)

    # Aplicamos el triaje clínico dinámico ANTES de hacer el commit en base de datos
    order = perform_triage(order)

    session.add(order)
    session.commit()
    session.refresh(order)

    return order
