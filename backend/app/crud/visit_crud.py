from sqlalchemy.orm import Session
from app.models.visit import VisitaModel, ReporteSinclairModel, VisitaTecnicoModel
from app.schemas.domain import CreateVisitDTO


class VisitsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_visits(self) -> list[VisitaModel]:
        try:
            return self.db.query(VisitaModel).all()
        except Exception as e:
            print(f"Error fetching visits: {e}")
            return []

    def get_visit_by_id(self, visit_id: str) -> VisitaModel | None:
        try:
            return self.db.query(VisitaModel).filter(VisitaModel.id == visit_id).first()
        except Exception as e:
            print(f"Error fetching visit by ID: {e}")
            return None

    def create_visit(self, visita: CreateVisitDTO) -> VisitaModel | None:
        try:
            new_visita = VisitaModel.from_create_dto(visita)
            if visita.tecnico_ids:
                new_visita.tecnicos = [VisitaTecnicoModel(tecnico_id=t_id) for t_id in visita.tecnico_ids]
            self.db.add(new_visita)
            self.db.commit()
            self.db.refresh(new_visita)
            return new_visita
        except Exception as e:
            print(f"Error creating visit: {e}")
            self.db.rollback()
            return None

    def create_report(self, visita: CreateVisitDTO, visit_id: str, numero: str) -> ReporteSinclairModel | None:
        try:
            new_report = ReporteSinclairModel.from_create_dto(visita, numero=numero)
            new_report.visita_id = visit_id
            self.db.add(new_report)
            self.db.commit()
            self.db.refresh(new_report)
            return new_report
        except Exception as e:
            print(f"Error creating report: {e}")
            self.db.rollback()
            return None

    def filter_by_date_range(self, start: str, end: str) -> list[VisitaModel]:
        try:
            return (
                self.db.query(VisitaModel)
                .filter(VisitaModel.fecha >= start, VisitaModel.fecha <= end)
                .all()
            )
        except Exception as e:
            print(f"Error filtering visits by date range: {e}")
            return []
