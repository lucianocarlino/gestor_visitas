from sqlalchemy.orm import Session
from app.models.visit import VisitaModel
from app.schemas.domain import Visita

class VisitsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_visits(self) -> list[Visita]:
        try:
            return [visita.to_domain() for visita in self.db.query(VisitaModel).all()]
        except Exception as e:
            print(f"Error fetching visits: {e}")
            return []